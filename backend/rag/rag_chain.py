# rag_chain.py (no DB)

import json
import requests
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.retrievers import BM25Retriever
from sentence_transformers import CrossEncoder
from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

INDEX_PATH = "faiss_index"
PDF_DIR = "PDFs"
LLAMA_API_URL = "http://localhost:11434/api/generate"

# -------- INIT --------

embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

vector_store = FAISS.load_local(
    INDEX_PATH,
    embeddings,
    allow_dangerous_deserialization=True
)

vector_retriever = vector_store.as_retriever(search_kwargs={"k": 5})

# BM25 (same as before)
loader = PyPDFDirectoryLoader(PDF_DIR)
docs = loader.load()

splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=80)
chunks = splitter.split_documents(docs)

bm25 = BM25Retriever.from_documents(chunks)
bm25.k = 10

reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")

# -------- UTILS --------

def format_docs(docs):
    return "\n\n".join(d.page_content for d in docs)

def call_llama(prompt):
    try:
        res = requests.post(
            LLAMA_API_URL,
            json={
                "model": "deepseek-r1:7b", 
                "prompt": prompt, 
                "stream": False,
                "options": {"temperature": 0.2}
            }
        )
        data = res.json()
        if "response" not in data:
            raise Exception(f"Ollama error: {data.get('error', 'Unknown error')}")
        return data["response"]
    except Exception as e:
        raise Exception(f"Failed to call LLM: {str(e)}")

def parse_json(text):
    # Remove DeepSeek thinking tags
    import re
    text = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL).strip()
    
    try:
        # Try finding a JSON block
        match = re.search(r"(\{.*\})", text, re.DOTALL)
        if match:
            return json.loads(match.group(1))
        return json.loads(text)
    except:
        return {"error": "Invalid JSON", "raw": text}

# -------- HYBRID RETRIEVAL --------

def hybrid_retrieve(query):
    v_docs = vector_retriever.invoke(query)
    b_docs = bm25.invoke(query)

    seen = set()
    combined = []

    for d in v_docs + b_docs:
        if d.page_content not in seen:
            combined.append(d)
            seen.add(d.page_content)

    pairs = [[query, d.page_content] for d in combined]
    scores = reranker.predict(pairs)

    ranked = sorted(zip(combined, scores), key=lambda x: x[1], reverse=True)

    return [d for d, _ in ranked[:3]]

from prompts import EXPLAIN_PROMPT, NUTRITION_PROMPT, SAFETY_PROMPT, RECIPE_PROMPT

# -------- PIPELINE --------

def explain_recipe(recipe):
    # simple ingredient extraction (temporary)
    ingredients = recipe.lower().split()

    query = f"pregnancy nutrition benefits risks of {' '.join(ingredients)}"

    docs = hybrid_retrieve(query)

    context = format_docs(docs)

    prompt = EXPLAIN_PROMPT.format(
        context=context,
        recipe=recipe
    )

    response = call_llama(prompt)
    return parse_json(response)

def nutrition_needs(trimester, condition):
    query = f"nutrition needs for trimester {trimester} with {condition}"
    docs = hybrid_retrieve(query)
    context = format_docs(docs)
    prompt = NUTRITION_PROMPT.format(context=context, trimester=trimester, condition=condition)
    response = call_llama(prompt)
    return parse_json(response)

def safety_check(ingredients):
    ing_str = ", ".join(ingredients)
    query = f"safety of consuming {ing_str} during pregnancy"
    docs = hybrid_retrieve(query)
    context = format_docs(docs)
    prompt = SAFETY_PROMPT.format(context=context, ingredients=ing_str)
    response = call_llama(prompt)
    return parse_json(response)


def recommend_recipes(user_profile):
    query = f"pregnancy nutrition foods trimester {user_profile['trimester']} iron deficiency"

    docs = hybrid_retrieve(query)
    context = format_docs(docs)

    prompt = RECIPE_PROMPT.format(
        is_pregnant=user_profile.get("is_pregnant", True),
        trimester=user_profile.get("trimester", 1),
        conditions=", ".join(user_profile.get("conditions", [])),
        diet=user_profile.get("diet", "balanced"),
        allergies=", ".join(user_profile.get("allergies", [])),
        context=context
    )

    response = call_llama(prompt)
    return parse_json(response)
