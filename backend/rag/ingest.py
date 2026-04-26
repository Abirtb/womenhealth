# ingest.py (no DB)

import os
import pickle
from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

from pathlib import Path

_RAG_ROOT = Path(__file__).resolve().parent
PDF_DIR = str(_RAG_ROOT / "PDFs" / "RAG")
INDEX_PATH = str(_RAG_ROOT / "faiss_index")


def ingest():
    if not os.path.exists(PDF_DIR):
        raise Exception("PDF folder not found")

    print("Loading PDFs...")
    loader = PyPDFDirectoryLoader(PDF_DIR)
    docs = loader.load()

    print(f"Loaded {len(docs)} pages")

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=80
    )
    chunks = splitter.split_documents(docs)

    print(f"Split into {len(chunks)} chunks")

    embeddings = HuggingFaceEmbeddings(
        model_name="all-MiniLM-L6-v2"
    )

    print("Creating FAISS index...")
    vector_store = FAISS.from_documents(chunks, embeddings)

    vector_store.save_local(INDEX_PATH)

    print("FAISS index saved locally")

if __name__ == "__main__":
    ingest()