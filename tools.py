"""
Cred Domain Support Agent - Tools Module
Exposes loan application lookup tool, escalation score calculation,
and policy retrieval tool definitions.
"""

from dataset import (
    check_loan_application_status,
    calculate_escalation_score,
    ESCALATION_THRESHOLD,
    LOAN_APPLICATIONS,
    LOAN_APPLICATIONS_BY_ID,
)
from rag_core import search_policy_documents, generate_grounded_answer

__all__ = [
    "check_loan_application_status",
    "calculate_escalation_score",
    "ESCALATION_THRESHOLD",
    "LOAN_APPLICATIONS",
    "LOAN_APPLICATIONS_BY_ID",
    "search_policy_documents",
    "generate_grounded_answer",
]
