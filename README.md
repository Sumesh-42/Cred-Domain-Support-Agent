# Cred Domain Support Agent — Banking & FinTech Track

This repository completes the **Cred (Banking & FinTech)** capstone track. It is an offline-first, production-minded support agent: a fabricated loan-record lookup tool and policy RAG tool are routed by LangGraph, protected by deterministic guardrails, persisted with JSON memory and SQLite checkpoints, served through FastAPI, and exposed over MCP.

`MOCK_LLM` is the default and only required mode. It uses no API key and no paid model: the generator selects verbatim sentences only from retrieved context, while the evaluation judge is deterministic code. SentenceTransformers and ChromaDB run locally; downloading the open embedding-model weights once is the only setup step that may need internet access.

## Dataset design

`dataset.py` generates 50 entirely fabricated records with seed **`20260906`**. Category and status weights are uniform (`1` for each given value); the generator constructs an evenly weighted population and uses the seed to shuffle it, yielding exactly 10 of every required category and exactly 10 of every required status. The amount range is **INR 75,000–5,000,000**, a deliberately broad but realistic band that covers unsecured personal credit through modest secured lending without inventing implausible values. `days_since_created` is a seeded integer from 0–30; fraud review uses a seeded 20% Bernoulli draw and validation refuses a result outside the required 10%–30% band.

The generated report is reproducible: every category count is **10**, every status count is **10**, and **10/50 = 20.00%** of records are fraud-review flagged. Its nearest-rank p80 is **25 days** and **0.3500** for the escalation score. Run `python dataset.py` to independently print the same values. No record is manually edited after generation.

The lookup escalation score is exactly:

```text
score = 0.65 × fraud_review_flag + 0.35 × (days_since_created / 30)
escalate when score >= nearest-rank p80(score across the generated dataset)
```

The resulting threshold is **0.3500**, calculated from the seeded dataset at import time (`tools.ESCALATION_THRESHOLD`) and printed by `python dataset.py`; this ties it to the actual distribution rather than an arbitrary Boolean rule. A fraud flag dominates the score while recency supplies a continuous 0–0.35 signal.

## Install and run

Requires Python 3.11+.

```bash
python -m venv .venv
# Windows: .venv\Scripts\activate
python -m pip install -r requirements.txt
python -m pytest
python demo.py
uvicorn api:app --host 127.0.0.1 --port 8000
```

`python demo.py` produces all measured/transcript evidence in `reports/generated/` in one reproducible run. The run must precede submission so the current measurements are committed alongside the source. The generated files include:

- `calibration.json`: three in-scope and two out-of-scope top-1 cosine similarities plus the **empirically chosen** midpoint threshold. The code refuses to use a tutorial preset or to continue if the two observed clusters overlap.
- `retrieval_evaluation.json`: fixed and sentence strategy Precision@3 and Recall@3 for the same five questions, with document-ID deduplication and visible `hits/denominator` arithmetic per question.
- `agent_demo.json`: both conditional routes, carried and fresh memory, fixed-format PII masking, injection refusal, and out-of-scope groundedness refusal.
- `rag_triad.json`: context relevance, groundedness, and answer relevance for all 15 queries and all three averages.
- `resilience.json` and `checkpoint_demo.json`: retry/timeout and persisted-resume evidence.

For a recommendation after executing the benchmark, compare the two averages in `retrieval_evaluation.json`: deploy the strategy with the higher Recall@3, breaking a tie using Precision@3. This explicit numbers-first recommendation avoids claiming performance before the local embeddings have actually been measured.

## Architecture and safeguards

```text
request → input guardrail → JSON memory → intent router
                                      ├─ RAG (sentence collection) → output-grounding check
                                      └─ status lookup
        → Pydantic AgentResponse → persisted memory / JSONL request log
```

- `knowledge_base.py` contains 12 original policy documents, each 2–3 sentences, spanning all required topics.
- `rag.py` indexes fixed-size-with-overlap and sentence chunks in separate Chroma collections (`cred_policy_fixed`, `cred_policy_sentence`) using normalized `all-MiniLM-L6-v2` embeddings and cosine similarity.
- `agent.py` contains seven nodes and the conditional route to RAG, status lookup, or a blocked answer. All exits validate the `AgentResponse` Pydantic schema.
- `guardrails.py` masks fixed-format PAN, Aadhaar, and bank-account values before model calls, graph/checkpoint state, JSON memory, and JSONL logging. Fabricated names/income are intentionally not pattern-masked. It also detects instruction-override attacks; RAG output must be supported verbatim by retrieved context or is refused.
- `api.py` offers `POST /ask` and `POST /add-document`, each using Pydantic request/response models. Every request produces one sanitized JSONL log entry with a trace ID and duration.
- `evaluation.py` evaluates 15 queries: one for every policy topic, two out-of-scope questions, and one credit-score edge case, using a documented deterministic MOCK_LLM judge.
- `mcp_server.py` runs a private FastMCP HTTP server at `http://127.0.0.1:8000/mcp`; `mcp_client.py` is a different process and calls two record IDs.
- `checkpoint_demo.py` uses `langgraph-checkpoint-sqlite`, stops after three nodes, resumes the same thread ID, and asserts already completed nodes were loaded rather than rerun.
- `resilience.py` demonstrates a four-attempt (`0.10s`, exponentially doubled, capped at `0.50s`, no jitter) retry policy, a `0.05s` node timeout, and a `0.15s` whole-graph timeout.

## API and MCP examples

```bash
curl -X POST http://127.0.0.1:8000/ask -H "content-type: application/json" -d '{"query":"What is the status of LOAN-001?","thread_id":"member-42"}'
curl -X POST http://127.0.0.1:8000/add-document -H "content-type: application/json" -d '{"doc_id":"policy-example","title":"Example policy","topic":"example","text":"This fabricated policy sentence is long enough for the request contract. It has a second supporting sentence."}'

python mcp_server.py
# in a second terminal
python mcp_client.py
```

## Repository map

| File | Responsibility |
| --- | --- |
| `dataset.py` | Seeded records, validation, counts, fraud percentage, p80 distribution report |
| `knowledge_base.py` / `rag.py` | Authored policies, dual chunking/indexing/retrieval/grounded mock generation |
| `agent.py` / `guardrails.py` / `tools.py` | LangGraph, memory, schema validation, safety controls, escalation lookup |
| `api.py` / `evaluation.py` | FastAPI and 15-query RAG-triad benchmark |
| `mcp_server.py` / `mcp_client.py` | Separate-process standardized MCP tool call |
| `checkpoint_demo.py` / `resilience.py` | SQLite resume, retries, node/global timeouts |
