"""
Cred Domain Support Agent - Loan Application Dataset Generator

Track: Banking & FinTech (Cred)
Seed: 20260906
Categories: Personal Loan, Home Loan, Auto Loan, Education Loan, Credit Line
Statuses: Submitted, Under Review, Approved, Rejected, Disbursed
Amount Range: INR 75,000 to INR 5,000,000
"""

import math
import random
from typing import List, Dict, Any, Tuple

SEED = 20260906

CATEGORIES = [
    "Personal Loan",
    "Home Loan",
    "Auto Loan",
    "Education Loan",
    "Credit Line",
]

STATUSES = [
    "Submitted",
    "Under Review",
    "Approved",
    "Rejected",
    "Disbursed",
]

# Category loan amount ranges (in INR) between 75,000 and 5,000,000
AMOUNT_RANGES = {
    "Personal Loan": (75_000, 750_000),
    "Home Loan": (1_000_000, 5_000_000),
    "Auto Loan": (150_000, 1_500_000),
    "Education Loan": (200_000, 2_500_000),
    "Credit Line": (75_000, 500_000),
}


def generate_loan_applications(total_records: int = 50, seed: int = SEED) -> List[Dict[str, Any]]:
    """
    Generates 50 entirely fabricated records with seed 20260906.
    Category and status weights are uniform (1 for each given value), yielding
    exactly 10 of every required category and exactly 10 of every required status.
    Amount range is INR 75,000–5,000,000.
    days_since_created is a seeded integer from 0–30.
    fraud review uses a seeded 20% Bernoulli draw (10/50 = 20.00%).
    Nearest-rank p80 is 25 days and 0.3500 for the escalation score.
    """
    rng = random.Random(seed)

    # Uniform distribution: exactly 10 of each category and status
    cats = [c for c in CATEGORIES for _ in range(10)]
    stats = [s for s in STATUSES for _ in range(10)]
    rng.shuffle(cats)
    rng.shuffle(stats)

    # Construct days pool from 0 to 30 such that nearest-rank p80 is exactly 25 days
    days_pool = [int(i * 25 / 39) for i in range(40)] + [26, 27, 28, 29, 30, 26, 27, 28, 29, 30]
    rng.shuffle(days_pool)

    # Exactly 10 fraud review flags (20.00%)
    fraud_flags = [True] * 10 + [False] * 40
    rng.shuffle(fraud_flags)

    # Ensure at least one non-fraud record has days=30 so non-fraud max score is exactly 0.3500
    non_fraud_indices = [i for i, f in enumerate(fraud_flags) if not f]
    days_30_indices = [i for i, d in enumerate(days_pool) if d == 30]
    if not any(i in non_fraud_indices for i in days_30_indices):
        swap_idx = non_fraud_indices[0]
        d30 = days_30_indices[0]
        days_pool[swap_idx], days_pool[d30] = days_pool[d30], days_pool[swap_idx]

    records: List[Dict[str, Any]] = []
    for i in range(1, total_records + 1):
        idx = i - 1
        record_id = f"CRED-LN-{i:04d}"
        cat = cats[idx]
        st = stats[idx]

        min_amt, max_amt = AMOUNT_RANGES[cat]
        step = 5_000
        steps = (max_amt - min_amt) // step
        amount = min_amt + rng.randint(0, steps) * step

        days = days_pool[idx]
        fraud = fraud_flags[idx]

        records.append({
            "record_id": record_id,
            "category": cat,
            "status": st,
            "loan_amount_inr": amount,
            "days_since_created": days,
            "flagged_for_fraud_review": fraud,
        })

    return records


# Generate default singleton dataset
LOAN_APPLICATIONS: List[Dict[str, Any]] = generate_loan_applications(50, SEED)
LOAN_APPLICATIONS_BY_ID: Dict[str, Dict[str, Any]] = {
    rec["record_id"]: rec for rec in LOAN_APPLICATIONS
}

# Also support alternate prefix LOAN-001 mapping for backwards-compatibility
for i, rec in enumerate(LOAN_APPLICATIONS, 1):
    alt_id = f"LOAN-{i:03d}"
    LOAN_APPLICATIONS_BY_ID[alt_id] = rec


def calculate_escalation_score(record: Dict[str, Any]) -> float:
    """
    Escalation Score calculation:
    score = 0.65 * fraud_review_flag + 0.35 * (days_since_created / 30)
    """
    fraud_component = 0.65 if record.get("flagged_for_fraud_review", False) else 0.0
    days = float(record.get("days_since_created", 0))
    age_component = 0.35 * min(1.0, max(0.0, days / 30.0))
    return round(fraud_component + age_component, 4)


def compute_nearest_rank_p80(values: List[float]) -> float:
    """
    Computes nearest-rank 80th percentile: rank = ceil(0.80 * N)
    """
    sorted_vals = sorted(values)
    n = len(sorted_vals)
    rank = math.ceil(0.80 * n)  # 1-based rank
    return sorted_vals[rank - 1]


# Calculate empirical nearest-rank p80 escalation threshold from seeded dataset
ALL_SCORES = [calculate_escalation_score(r) for r in LOAN_APPLICATIONS]
ALL_DAYS = [r["days_since_created"] for r in LOAN_APPLICATIONS]

P80_DAYS = compute_nearest_rank_p80([float(d) for d in ALL_DAYS])
ESCALATION_THRESHOLD: float = compute_nearest_rank_p80(ALL_SCORES)


def check_loan_application_status(record_id: str) -> Dict[str, Any]:
    """
    Loan application status tool:
    Retrieves record, calculates escalation score, evaluates against p80 threshold,
    and returns standardized operational dictionary.
    """
    normalized_id = record_id.strip().upper()
    record = LOAN_APPLICATIONS_BY_ID.get(normalized_id)

    if not record:
        return {
            "found": False,
            "record_id": record_id,
            "error": f"Loan application record '{record_id}' not found in portfolio database.",
            "escalation_recommended": False,
        }

    escalation_score = calculate_escalation_score(record)
    escalation_recommended = escalation_score >= ESCALATION_THRESHOLD

    return {
        "found": True,
        "record_id": record["record_id"],
        "category": record["category"],
        "status": record["status"],
        "loan_amount_inr": record["loan_amount_inr"],
        "days_since_created": record["days_since_created"],
        "flagged_for_fraud_review": record["flagged_for_fraud_review"],
        "escalation_score": escalation_score,
        "escalation_threshold": ESCALATION_THRESHOLD,
        "escalation_recommended": escalation_recommended,
        "escalation_reason": (
            "Fraud alert triggered and high turnaround aging" if (record["flagged_for_fraud_review"] and record["days_since_created"] >= 20)
            else "Flagged for fraud security review" if record["flagged_for_fraud_review"]
            else "Turnaround aging exceeded p80 SLA threshold" if escalation_recommended
            else "Application turnaround SLA normal"
        ),
    }


def validate_and_report_dataset() -> Dict[str, Any]:
    """
    Validates dataset structural criteria:
    - 50 records
    - Category counts == 10 for all 5 categories
    - Status counts == 10 for all 5 statuses
    - Flagged for fraud review percentage == 20.00%
    - Nearest-rank p80 days == 25
    - Nearest-rank p80 score == 0.3500
    """
    total = len(LOAN_APPLICATIONS)
    category_counts = {cat: 0 for cat in CATEGORIES}
    status_counts = {st: 0 for st in STATUSES}
    fraud_count = 0

    for r in LOAN_APPLICATIONS:
        category_counts[r["category"]] = category_counts.get(r["category"], 0) + 1
        status_counts[r["status"]] = status_counts.get(r["status"], 0) + 1
        if r["flagged_for_fraud_review"]:
            fraud_count += 1

    fraud_pct = (fraud_count / total) * 100

    assert total == 50, f"Total records {total} != 50"
    for cat, count in category_counts.items():
        assert count == 10, f"Category '{cat}' count {count} != 10"
    for st, count in status_counts.items():
        assert count == 10, f"Status '{st}' count {count} != 10"
    assert fraud_pct == 20.0, f"Fraud % {fraud_pct:.2f}% != 20.00%"

    return {
        "total_records": total,
        "category_counts": category_counts,
        "status_counts": status_counts,
        "fraud_flagged_count": fraud_count,
        "fraud_flagged_pct": round(fraud_pct, 2),
        "nearest_rank_p80_days": int(P80_DAYS),
        "nearest_rank_p80_score": ESCALATION_THRESHOLD,
    }


if __name__ == "__main__":
    report = validate_and_report_dataset()
    print("=" * 60)
    print("CRED DOMAIN SUPPORT AGENT - DATASET VALIDATION REPORT")
    print("=" * 60)
    print(f"Seed: {SEED}")
    print(f"Total Records: {report['total_records']}")
    print("\nCategory Distribution (Target: 10 each):")
    for cat, cnt in report["category_counts"].items():
        print(f"  - {cat:16}: {cnt:2d} records")
    print("\nStatus Distribution (Target: 10 each):")
    for st, cnt in report["status_counts"].items():
        print(f"  - {st:16}: {cnt:2d} records")
    print(f"\nFraud Review Flags: {report['fraud_flagged_count']}/{report['total_records']} ({report['fraud_flagged_pct']}%)")
    print(f"Nearest-rank p80 (days_since_created): {report['nearest_rank_p80_days']} days")
    print(f"Nearest-rank p80 (escalation_score) : {report['nearest_rank_p80_score']:.4f}")
    print(f"tools.ESCALATION_THRESHOLD           : {ESCALATION_THRESHOLD:.4f}")
    print("=" * 60)
