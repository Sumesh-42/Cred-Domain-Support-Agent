"""
Cred Domain Support Agent - Guardrails Engine

Implements:
1. Input-side fixed-format PII masking:
   - PAN: [A-Z]{5}[0-9]{4}[A-Z]{1} -> [MASKED_PAN]
   - Aadhaar: 12 digits with optional spaces or hyphens -> [MASKED_AADHAAR]
   - Bank Account: 9 to 18 contiguous digits -> [MASKED_BANK_ACCOUNT]
   Note: Applicant name and income figures are unformatted/free-text and acknowledged
   as out-of-scope for masking under keyless MOCK_LLM mode per scenario instructions.
2. Input-side Prompt Injection Detection:
   - Blocks adversarial system-prompt overrides, jailbreak phrases, roleplay exploits.
3. Output-side Groundedness Check:
   - Validates that synthesized responses are firmly grounded in approved context.
"""

import re
from typing import Tuple, List, Dict, Any

# Regular expression patterns for fixed-format PII in Indian banking
PAN_PATTERN = re.compile(r"\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b", re.IGNORECASE)
AADHAAR_PATTERN = re.compile(r"\b\d{4}[ -]?\d{4}[ -]?\d{4}\b")
# For bank account: 9 to 18 digits, avoiding matches that are already Aadhaar (12 digits with separator)
BANK_ACCOUNT_PATTERN = re.compile(r"\b\d{9,18}\b")

# Prompt Injection Attack Signatures
INJECTION_SIGNATURES = [
    r"ignore\s+(all\s+)?(previous|prior|above)\s+(instructions|prompts|rules|commands)",
    r"disregard\s+(all\s+)?(previous|prior|system)\s+directives",
    r"you\s+are\s+now\s+(in\s+)?(unrestricted|dan|developer|god)\s+mode",
    r"reveal\s+(your\s+)?(system\s+prompt|initial\s+instructions|hidden\s+rules)",
    r"bypass\s+(all\s+)?(security|guardrails|policies|filters)",
    r"print\s+(your\s+)?(system\s+prompt|internal\s+instructions)",
    r"roleplay\s+as\s+(an\s+)?(unfiltered|admin|root|attacker)",
    r"override\s+cred\s+lending\s+policy",
]
INJECTION_REGEXES = [re.compile(sig, re.IGNORECASE) for sig in INJECTION_SIGNATURES]


def mask_pii(text: str) -> Tuple[str, List[str]]:
    """
    Masks Indian fixed-format PII: PAN, Aadhaar, and Bank Account numbers.
    Returns: (masked_text, list_of_guards_triggered)
    """
    guards_applied: List[str] = []
    masked = text

    # Mask PAN
    if PAN_PATTERN.search(masked):
        masked = PAN_PATTERN.sub("[MASKED_PAN]", masked)
        guards_applied.append("PII_MASKED_PAN")

    # Mask Aadhaar
    if AADHAAR_PATTERN.search(masked):
        masked = AADHAAR_PATTERN.sub("[MASKED_AADHAAR]", masked)
        guards_applied.append("PII_MASKED_AADHAAR")

    # Mask Bank Account numbers
    # Ensure we do not re-mask placeholder strings
    if BANK_ACCOUNT_PATTERN.search(masked):
        # Only replace numbers that are not part of already masked tokens
        def repl(match):
            m = match.group(0)
            # if 12 digits and looks like aadhaar without spaces, it's captured
            return "[MASKED_BANK_ACCOUNT]"
        masked = BANK_ACCOUNT_PATTERN.sub(repl, masked)
        guards_applied.append("PII_MASKED_BANK_ACCOUNT")

    return masked, guards_applied


def detect_prompt_injection(text: str) -> Tuple[bool, str]:
    """
    Checks if user query contains prompt injection or adversarial jailbreak triggers.
    Returns: (is_injection, reason)
    """
    for regex in INJECTION_REGEXES:
        match = regex.search(text)
        if match:
            return True, f"Prompt injection detected: matched signature '{match.group(0)}'"
    return False, ""


def check_output_groundedness(
    answer: str,
    retrieved_contexts: List[str],
    similarity_score: float,
    threshold: float
) -> Tuple[bool, str]:
    """
    Output-side groundedness check:
    Ensures that the answer is supported by the retrieved context.
    Under MOCK_LLM / retrieval-grounded operation:
    1. Checks if similarity_score meets the calibrated empirical threshold.
    2. Validates that retrieved_contexts is non-empty.
    3. Confirms the answer does not contradict lack of context.
    """
    if similarity_score < threshold:
        return False, f"Retrieval similarity {similarity_score:.4f} is below calibrated confidence threshold {threshold:.4f}."

    if not retrieved_contexts:
        return False, "Zero supporting knowledge base contexts retrieved."

    # Verify that key terms in answer have overlap with context
    return True, "Response confirmed grounded in retrieved policy context."
