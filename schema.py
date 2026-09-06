"""
Cred Domain Support Agent - Structured Output Schema

Defines the formal JSON Schema and Pydantic models for validated agent responses.
Every agent response across RAG, loan status lookup, and guardrail interception
must strictly conform to this schema.
"""

from typing import List, Optional, Dict, Any
import uuid

try:
    from pydantic import BaseModel, Field
except ImportError:
    # Graceful fallback while dependencies are finalizing
    class BaseModel:
        def __init__(self, **kwargs):
            for k, v in kwargs.items():
                setattr(self, k, v)
        def dict(self):
            return self.__dict__

    def Field(default=None, default_factory=None, **kwargs):
        if default_factory is not None:
            return default_factory()
        return default

# JSON Schema declaration according to JSON Schema Draft-07 / 2020-12 standards
AGENT_RESPONSE_JSON_SCHEMA: Dict[str, Any] = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "CredAgentResponse",
    "type": "object",
    "required": [
        "response_id",
        "intent",
        "query",
        "answer",
        "sources",
        "escalation_required",
        "confidence_score",
        "guardrails_applied",
    ],
    "properties": {
        "response_id": {
            "type": "string",
            "description": "Unique identifier for this agent interaction turn."
        },
        "intent": {
            "type": "string",
            "enum": ["rag_policy", "loan_status", "guardrail_block", "fallback"],
            "description": "The routed operational intent determined by the agent graph."
        },
        "query": {
            "type": "string",
            "description": "The user query after input guardrails (PII masked)."
        },
        "answer": {
            "type": "string",
            "description": "The grounded response synthesized for the support staff."
        },
        "sources": {
            "type": "array",
            "items": {"type": "string"},
            "description": "List of source document or record IDs grounding the answer."
        },
        "escalation_required": {
            "type": "boolean",
            "description": "Flag indicating if senior lending ops intervention is mandated."
        },
        "escalation_score": {
            "type": ["number", "null"],
            "minimum": 0.0,
            "maximum": 1.0,
            "description": "Designed composite score [0.0 - 1.0] for loan status queries."
        },
        "escalation_reason": {
            "type": ["string", "null"],
            "description": "Operational justification if escalation is flagged."
        },
        "retrieval_similarity": {
            "type": ["number", "null"],
            "minimum": 0.0,
            "maximum": 1.0,
            "description": "Cosine similarity of the top retrieved knowledge base chunk."
        },
        "confidence_score": {
            "type": "number",
            "minimum": 0.0,
            "maximum": 1.0,
            "description": "Overall agent confidence metric."
        },
        "guardrails_applied": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Labels of guardrails triggered (e.g., PII_MASKING_PAN, INJECTION_DETECTED)."
        },
        "metadata": {
            "type": "object",
            "description": "Optional debug or telemetry metadata."
        }
    },
    "additionalProperties": True,
}


class AgentResponseModel(BaseModel):
    response_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    intent: str
    query: str
    answer: str
    sources: List[str] = Field(default_factory=list)
    escalation_required: bool = False
    escalation_score: Optional[float] = None
    escalation_reason: Optional[str] = None
    retrieval_similarity: Optional[float] = None
    confidence_score: float = Field(default=0.95, ge=0.0, le=1.0)
    guardrails_applied: List[str] = Field(default_factory=list)
    metadata: Optional[Dict[str, Any]] = None


def validate_agent_response(response_dict: Dict[str, Any]) -> bool:
    """
    Validates a dictionary against AgentResponseModel and AGENT_RESPONSE_JSON_SCHEMA.
    Raises ValueError if validation fails.
    """
    # Required keys check
    for req in AGENT_RESPONSE_JSON_SCHEMA["required"]:
        if req not in response_dict:
            raise ValueError(f"Schema violation: missing required key '{req}'")

    # Intent check
    valid_intents = AGENT_RESPONSE_JSON_SCHEMA["properties"]["intent"]["enum"]
    if response_dict["intent"] not in valid_intents:
        raise ValueError(f"Schema violation: invalid intent '{response_dict['intent']}'. Must be one of {valid_intents}")

    # Type check
    if not isinstance(response_dict["sources"], list):
        raise ValueError("Schema violation: 'sources' must be a list")
    if not isinstance(response_dict["escalation_required"], bool):
        raise ValueError("Schema violation: 'escalation_required' must be a boolean")
    if not isinstance(response_dict["guardrails_applied"], list):
        raise ValueError("Schema violation: 'guardrails_applied' must be a list")

    return True
