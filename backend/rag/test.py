from rag_chain import hybrid_retrieve

docs = hybrid_retrieve("iron deficiency pregnancy")

for i, d in enumerate(docs):
    print(f"\n--- Result {i+1} ---")
    print(d.page_content[:500])  # first 500 chars