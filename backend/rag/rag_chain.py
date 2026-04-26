"""
Hybrid FAISS + BM25 retrieval with optional Ollama JSON generation.

Paths are anchored to this package so Django can import from any cwd.
Heavy models load lazily on first use so `manage.py` stays fast when RAG is unused.
"""

from __future__ import annotations

import json
import os
import re
import threading
from pathlib import Path

import requests
from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain_community.retrievers import BM25Retriever
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from sentence_transformers import CrossEncoder

from .prompts import EXPLAIN_PROMPT, NUTRITION_PROMPT, RECIPE_PROMPT, SAFETY_PROMPT

_RAG_ROOT = Path(__file__).resolve().parent
INDEX_PATH = str(_RAG_ROOT / "faiss_index")
PDF_DIR = str(_RAG_ROOT / "PDFs" / "RAG")
LLAMA_API_URL = os.environ.get("OLLAMA_API_URL", "http://localhost:11434/api/generate")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "deepseek-r1:7b")

_runtime_lock = threading.Lock()
_runtime: dict | None = None
_runtime_error: str | None = None


def _ensure_runtime() -> dict:
    """Load embeddings, FAISS, BM25, reranker once; raise with message if setup fails."""
    global _runtime, _runtime_error
    with _runtime_lock:
        if _runtime is not None:
            return _runtime
        if _runtime_error is not None:
            raise RuntimeError(_runtime_error)
        try:
            embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
            vector_store = FAISS.load_local(
                INDEX_PATH,
                embeddings,
                allow_dangerous_deserialization=True,
            )
            vector_retriever = vector_store.as_retriever(search_kwargs={"k": 5})

            loader = PyPDFDirectoryLoader(PDF_DIR)
            docs = loader.load()
            splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=80)
            chunks = splitter.split_documents(docs)
            bm25 = BM25Retriever.from_documents(chunks)
            bm25.k = 10

            reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")
            _runtime = {
                "vector_retriever": vector_retriever,
                "bm25": bm25,
                "reranker": reranker,
            }
            return _runtime
        except Exception as exc:  # noqa: BLE001 — surface any init failure to caller
            _runtime_error = str(exc)
            raise RuntimeError(_runtime_error) from exc


def format_docs(docs):
    return "\n\n".join(d.page_content for d in docs)


def call_llama(prompt: str) -> str:
    try:
        res = requests.post(
            LLAMA_API_URL,
            json={
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False,
                "options": {"temperature": 0.2},
            },
            timeout=120,
        )
        data = res.json()
        if "response" not in data:
            raise RuntimeError(data.get("error", "Unknown Ollama error"))
        return data["response"]
    except Exception as e:
        raise RuntimeError(f"Failed to call LLM: {e}") from e


def parse_json(text: str):
    _to = "<" + "think" + ">"
    _tc = "<" + "/" + "think" + ">"
    text = re.sub(_to + r"[\s\S]*?" + _tc, "", text, flags=re.IGNORECASE).strip()

    try:
        match = re.search(r"(\{.*\})", text, re.DOTALL)
        if match:
            return json.loads(match.group(1))
        return json.loads(text)
    except json.JSONDecodeError:
        return {"error": "Invalid JSON", "raw": text}


def hybrid_retrieve(query: str):
    rt = _ensure_runtime()
    vector_retriever = rt["vector_retriever"]
    bm25 = rt["bm25"]
    reranker = rt["reranker"]

    v_docs = vector_retriever.invoke(query)
    b_docs = bm25.invoke(query)

    seen: set[str] = set()
    combined = []
    for d in v_docs + b_docs:
        if d.page_content not in seen:
            combined.append(d)
            seen.add(d.page_content)

    if not combined:
        return []

    pairs = [[query, d.page_content] for d in combined]
    scores = reranker.predict(pairs)
    ranked = sorted(zip(combined, scores), key=lambda x: x[1], reverse=True)
    return [d for d, _ in ranked[:3]]


def explain_recipe(recipe: str):
    ingredients = recipe.lower().split()
    query = f"pregnancy nutrition benefits risks of {' '.join(ingredients)}"
    docs = hybrid_retrieve(query)
    context = format_docs(docs)
    prompt = EXPLAIN_PROMPT.format(context=context, recipe=recipe)
    response = call_llama(prompt)
    return parse_json(response)


def nutrition_needs(trimester, condition):
    query = f"nutrition needs for trimester {trimester} with {condition}"
    docs = hybrid_retrieve(query)
    context = format_docs(docs)
    prompt = NUTRITION_PROMPT.format(context=context, trimester=trimester, condition=condition)
    response = call_llama(prompt)
    return parse_json(response)


def safety_check(ingredients: list):
    ing_str = ", ".join(ingredients)
    query = f"safety of consuming {ing_str} during pregnancy"
    docs = hybrid_retrieve(query)
    context = format_docs(docs)
    prompt = SAFETY_PROMPT.format(context=context, ingredients=ing_str)
    response = call_llama(prompt)
    return parse_json(response)


def recommend_recipes(user_profile: dict):
    trimester = user_profile.get("trimester", 1)
    conditions = ", ".join(user_profile.get("conditions") or []) or "general pregnancy"
    diet = user_profile.get("diet", "balanced")
    allergies = ", ".join(user_profile.get("allergies") or []) or "none"
    query = (
        f"pregnancy nutrition trimester {trimester} conditions {conditions} "
        f"diet {diet} allergies {allergies}"
    )

    docs = hybrid_retrieve(query)
    context = format_docs(docs)

    prompt = RECIPE_PROMPT.format(
        is_pregnant=user_profile.get("is_pregnant", True),
        trimester=trimester,
        conditions=conditions,
        diet=diet,
        allergies=allergies,
        context=context,
    )

    response = call_llama(prompt)
    return parse_json(response)
