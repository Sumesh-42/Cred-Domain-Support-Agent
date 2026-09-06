"""
Cred Domain Support Agent - RAG Module
Exports dual-chunking collections, semantic vector search,
empirical threshold calibration, and grounded answer generation.
"""

from rag_core import (
    search_policy_documents,
    generate_grounded_answer,
    SIMILARITY_THRESHOLD,
    FIXED_SIZE_CHUNKS,
    SENTENCE_CHUNKS,
)
from knowledge_base import (
    POLICY_DOCUMENTS,
    get_all_policy_documents,
    add_policy_document,
)

__all__ = [
    "search_policy_documents",
    "generate_grounded_answer",
    "SIMILARITY_THRESHOLD",
    "FIXED_SIZE_CHUNKS",
    "SENTENCE_CHUNKS",
    "POLICY_DOCUMENTS",
    "get_all_policy_documents",
    "add_policy_document",
]
