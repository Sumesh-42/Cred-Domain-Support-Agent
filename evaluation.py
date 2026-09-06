"""
Cred Domain Support Agent - Evaluation Module
Evaluates 15 queries:
- 12 policy topics (one for every policy document)
- 2 out-of-scope questions
- 1 credit-score edge case
Using a documented deterministic MOCK_LLM judge.
Writes reports/generated/rag_triad.json.
"""

import os
import json
from eval_rag_triad import (
    compute_context_relevance,
    compute_groundedness,
    compute_answer_relevance,
)
from rag_core import generate_grounded_answer

EVALUATION_15_QUERIES = [
    # 12 Policy topics
    {
        "id": "Q01",
        "topic": "Loan Eligibility",
        "query": "What are the KYC documents required for a salaried applicant?",
        "target_docs": ["DOC-KYC-REQUIREMENTS"],
    },
    {
        "id": "Q02",
        "topic": "Prepayment Penalty",
        "query": "Can I prepay my floating rate home loan without penalty?",
        "target_docs": ["DOC-PREPAYMENT-PENALTY"],
    },
    {
        "id": "Q03",
        "topic": "EMI Calculation",
        "query": "How is EMI calculated on reducing balance?",
        "target_docs": ["DOC-EMI-CALCULATION"],
    },
    {
        "id": "Q04",
        "topic": "Credit Card Fees",
        "query": "What are the annual fees and late charges for credit cards?",
        "target_docs": ["DOC-CREDIT-CARD-FEES"],
    },
    {
        "id": "Q05",
        "topic": "Fraud Dispute",
        "query": "What is the fraud dispute resolution turnaround time?",
        "target_docs": ["DOC-FRAUD-DISPUTE"],
    },
    {
        "id": "Q06",
        "topic": "Minimum Balance",
        "query": "What is the penalty for not maintaining minimum balance?",
        "target_docs": ["DOC-MIN-BALANCE"],
    },
    {
        "id": "Q07",
        "topic": "Foreclosure Charges",
        "query": "Are there foreclosure charges on fixed rate personal loans?",
        "target_docs": ["DOC-PREPAYMENT-PENALTY"],
    },
    {
        "id": "Q08",
        "topic": "NRI Lending",
        "query": "Can Non-Resident Indians apply for home loans at Cred?",
        "target_docs": ["DOC-NRI-ELIGIBILITY"],
    },
    {
        "id": "Q09",
        "topic": "Account Closure",
        "query": "What are the requirements to close an active credit line account?",
        "target_docs": ["DOC-ACCOUNT-CLOSURE"],
    },
    {
        "id": "Q10",
        "topic": "Interest Rates",
        "query": "How is benchmark interest rate pegged to repo rate?",
        "target_docs": ["DOC-INTEREST-RATES"],
    },
    {
        "id": "Q11",
        "topic": "Moratorium Policy",
        "query": "Is loan moratorium allowed during economic emergencies?",
        "target_docs": ["DOC-MORATORIUM"],
    },
    {
        "id": "Q12",
        "topic": "Collateral & Guarantees",
        "query": "What collateral is required for unsecured personal credit lines?",
        "target_docs": ["DOC-COLLATERAL"],
    },
    # 2 Out-of-scope questions
    {
        "id": "Q13",
        "topic": "Out-of-Scope Recipe",
        "query": "What is the authentic recipe for chicken tikka masala?",
        "target_docs": [],
    },
    {
        "id": "Q14",
        "topic": "Out-of-Scope Weather",
        "query": "What is the weather forecast for Bangalore this weekend?",
        "target_docs": [],
    },
    # 1 Credit score edge case
    {
        "id": "Q15",
        "topic": "Credit Score Edge Case",
        "query": "Will applying for multiple loans in one week damage my CIBIL score?",
        "target_docs": ["DOC-CREDIT-CARD-FEES", "DOC-LOAN-ELIGIBILITY"],
    },
]


def run_15_query_evaluation() -> dict:
    results = []
    total_cr, total_g, total_ar = 0.0, 0.0, 0.0

    print("=" * 75)
    print("CRED DOMAIN SUPPORT AGENT - 15-QUERY EVALUATION BENCHMARK")
    print("=" * 75)

    for item in EVALUATION_15_QUERIES:
        q = item["query"]
        target = item["target_docs"]
        rag_res = generate_grounded_answer(q)

        cr = compute_context_relevance(q, rag_res["retrieved_chunks"], target)
        g = compute_groundedness(rag_res["answer"], rag_res["retrieved_chunks"], rag_res["fallback_triggered"])
        ar = compute_answer_relevance(q, rag_res["answer"], rag_res["fallback_triggered"])
        triad_avg = round((cr + g + ar) / 3.0, 4)

        total_cr += cr
        total_g += g
        total_ar += ar

        eval_record = {
            "id": item["id"],
            "topic": item["topic"],
            "query": q,
            "target_docs": target,
            "context_relevance": cr,
            "groundedness": g,
            "answer_relevance": ar,
            "triad_average": triad_avg,
            "fallback_triggered": rag_res["fallback_triggered"],
            "similarity": rag_res["retrieval_similarity"],
        }
        results.append(eval_record)
        print(f"[{item['id']}] {item['topic']:24} | CR: {cr:.4f} | G: {g:.4f} | AR: {ar:.4f} | Avg: {triad_avg:.4f}")

    n = len(results)
    mean_cr = round(total_cr / n, 4)
    mean_g = round(total_g / n, 4)
    mean_ar = round(total_ar / n, 4)
    composite = round((mean_cr + mean_g + mean_ar) / 3.0, 4)

    summary = {
        "queries_evaluated": n,
        "mean_context_relevance": mean_cr,
        "mean_groundedness": mean_g,
        "mean_answer_relevance": mean_ar,
        "composite_triad_score": composite,
        "evaluations": results,
    }

    os.makedirs("reports/generated", exist_ok=True)
    with open("reports/generated/rag_triad.json", "w") as f:
        json.dump(summary, f, indent=2)

    print("\n" + "=" * 75)
    print(f"Summary: Mean CR={mean_cr:.4f} | Mean G={mean_g:.4f} | Mean AR={mean_ar:.4f} | Composite={composite:.4f}")
    print("Exported to reports/generated/rag_triad.json")
    print("=" * 75)
    return summary


if __name__ == "__main__":
    run_15_query_evaluation()
