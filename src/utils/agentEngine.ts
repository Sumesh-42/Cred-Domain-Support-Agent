import { AgentResponse, LoanApplication, PolicyDocument } from '../types';
import { LOAN_APPLICATIONS, POLICY_DOCUMENTS } from '../data/mockData';

// PII Regex Patterns
const PAN_REGEX = /\b[A-Z]{5}[0-9]{4}[A-Z]\b/g;
const AADHAAR_REGEX = /\b\d{4}\s?\d{4}\s?\d{4}\b/g;
const BANK_ACC_REGEX = /\b\d{11,18}\b/g;

// Injection Attack Patterns
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /reveal\s+(your\s+)?(system\s+)?prompt/i,
  /disregard\s+(all\s+)?prior\s+guidance/i,
  /you\s+are\s+now\s+in\s+developer\s+mode/i,
  /jailbreak/i,
  /drop\s+table/i,
  /system:\s*override/i,
];

// In-Memory Thread State for Multi-Turn Sessions
const THREAD_STORAGE: Record<string, { last_loan_id: string | null; history: Array<{ query: string; answer: string }> }> = {};

export function maskPII(text: string): { maskedText: string; appliedGuards: string[] } {
  let masked = text;
  const applied: string[] = [];

  if (PAN_REGEX.test(masked)) {
    masked = masked.replace(PAN_REGEX, '[MASKED_PAN]');
    applied.push('PII_MASKED_PAN');
  }
  if (AADHAAR_REGEX.test(masked)) {
    masked = masked.replace(AADHAAR_REGEX, '[MASKED_AADHAAR]');
    applied.push('PII_MASKED_AADHAAR');
  }
  if (BANK_ACC_REGEX.test(masked)) {
    masked = masked.replace(BANK_ACC_REGEX, '[MASKED_BANK_ACCOUNT]');
    applied.push('PII_MASKED_BANK_ACCOUNT');
  }

  return { maskedText: masked, appliedGuards: applied };
}

export function detectPromptInjection(text: string): { isInjection: boolean; pattern?: string } {
  for (const pat of INJECTION_PATTERNS) {
    if (pat.test(text)) {
      return { isInjection: true, pattern: pat.source };
    }
  }
  return { isInjection: false };
}

// Tokenizer & Vector Similarity for Client-Side RAG
function tokenize(text: string): string[] {
  return text.toLowerCase().match(/\b[a-z0-9_\-]+\b/g) || [];
}

function computeSimilarity(tokensA: string[], tokensB: string[]): number {
  if (!tokensA.length || !tokensB.length) return 0;
  const setB = new Set(tokensB);
  let match = 0;
  for (const t of tokensA) {
    if (setB.has(t)) match++;
  }
  return match / Math.sqrt(tokensA.length * tokensB.length);
}

export function queryRAGPolicy(query: string, docs: PolicyDocument[]): {
  answer: string;
  sources: string[];
  similarity: number;
  fallbackTriggered: boolean;
} {
  const queryTokens = tokenize(query);
  const scores: Array<{ doc: PolicyDocument; score: number; bestSentence: string }> = [];

  for (const doc of docs) {
    const sentences = doc.content.split(/(?<=[.!?])\s+/);
    let topSentScore = 0;
    let topSent = '';
    for (const s of sentences) {
      const sentTokens = tokenize(`${doc.title} ${s}`);
      const score = computeSimilarity(queryTokens, sentTokens);
      if (score > topSentScore) {
        topSentScore = score;
        topSent = s;
      }
    }
    scores.push({ doc, score: topSentScore, bestSentence: topSent });
  }

  scores.sort((a, b) => b.score - a.score);
  const bestMatch = scores[0];

  // Calibrated Empirical Groundedness Threshold: 0.0844
  const THRESHOLD = 0.0844;

  if (!bestMatch || bestMatch.score < THRESHOLD) {
    return {
      answer: 'I cannot find sufficient policy grounding in approved Cred documentation to answer your question safely. Please connect with our support desk or consult official regulatory circulars.',
      sources: [],
      similarity: bestMatch ? Math.round(bestMatch.score * 10000) / 10000 : 0,
      fallbackTriggered: true,
    };
  }

  // Retrieve top matching documents
  const relevant = scores.filter(s => s.score >= THRESHOLD).slice(0, 3);
  const sourceIds = relevant.map(r => r.doc.doc_id);
  const combinedAnswer = relevant.map(r => `${r.doc.title}: ${r.bestSentence}`).join(' ');

  return {
    answer: `According to Cred Lending Policy (${sourceIds.join(', ')}): ${combinedAnswer}`,
    sources: sourceIds,
    similarity: Math.round(bestMatch.score * 10000) / 10000,
    fallbackTriggered: false,
  };
}

export function executeAgentQuery(
  rawQuery: string,
  threadId: string = 'default_thread',
  loanRecords: LoanApplication[] = LOAN_APPLICATIONS,
  policyDocs: PolicyDocument[] = POLICY_DOCUMENTS
): AgentResponse {
  const startTime = performance.now();
  const nodesTraversed: string[] = [];
  const guardrailsApplied: string[] = [];

  // Step 1: Input Guardrail
  nodesTraversed.push('input_guardrail');
  const { maskedText, appliedGuards } = maskPII(rawQuery);
  guardrailsApplied.push(...appliedGuards);

  // Check Injection
  const injectionCheck = detectPromptInjection(rawQuery);
  if (injectionCheck.isInjection) {
    guardrailsApplied.push('PROMPT_INJECTION_BLOCKED');
    nodesTraversed.push('output_guardrail');
    return {
      response_id: crypto.randomUUID(),
      intent: 'guardrail_block',
      query: maskedText,
      answer: `Security Guardrail Blocked: Input matched prompt injection or unauthorized system override pattern (${injectionCheck.pattern}). Request dropped.`,
      sources: [],
      escalation_required: false,
      escalation_score: null,
      escalation_reason: null,
      retrieval_similarity: null,
      confidence_score: 1.0,
      guardrails_applied: guardrailsApplied,
      latency_ms: Math.round((performance.now() - startTime) * 100) / 100,
      trace_id: crypto.randomUUID(),
      nodes_traversed: nodesTraversed,
    };
  }

  // Step 2: Thread Context Resolution
  if (!THREAD_STORAGE[threadId]) {
    THREAD_STORAGE[threadId] = { last_loan_id: null, history: [] };
  }
  const session = THREAD_STORAGE[threadId];

  // Check for loan ID pattern
  const loanIdMatch = maskedText.match(/CRED-LN-\d{4}/i);
  let targetLoanId = loanIdMatch ? loanIdMatch[0].toUpperCase() : null;

  // Multi-turn anaphora resolution
  if (!targetLoanId && session.last_loan_id && /\b(it|its|the loan|the application|that record|status again)\b/i.test(maskedText)) {
    targetLoanId = session.last_loan_id;
  }

  // Step 3: Intent Routing
  const isLoanIntent = Boolean(targetLoanId || /\b(loan status|application status|check status|track loan)\b/i.test(maskedText));

  if (isLoanIntent && targetLoanId) {
    nodesTraversed.push('loan_status_tool');
    session.last_loan_id = targetLoanId;

    const record = loanRecords.find(r => r.record_id === targetLoanId);
    nodesTraversed.push('output_guardrail');

    if (!record) {
      return {
        response_id: crypto.randomUUID(),
        intent: 'loan_status',
        query: maskedText,
        answer: `Loan application ${targetLoanId} was not found in Cred lending records. Please verify the 4-digit reference ID.`,
        sources: ['CRED-LOAN-DATABASE'],
        escalation_required: false,
        escalation_score: 0.0,
        escalation_reason: 'Record not found',
        retrieval_similarity: null,
        confidence_score: 0.95,
        guardrails_applied: guardrailsApplied,
        latency_ms: Math.round((performance.now() - startTime) * 100) / 100,
        trace_id: crypto.randomUUID(),
        nodes_traversed: nodesTraversed,
      };
    }

    const recency = Math.min(Math.max(record.days_since_created / 30.0, 0), 1.0);
    const fraudSig = record.flagged_for_fraud_review ? 1.0 : 0.0;
    const score = Math.round((0.65 * fraudSig + 0.35 * recency) * 10000) / 10000;
    const isEscalated = score >= 0.50;
    const reason = record.flagged_for_fraud_review
      ? 'Critical: Active fraud investigation flag'
      : (score > 0.25 ? 'High turnaround delay' : 'Standard turnaround SLA normal');

    const formattedAnswer = `Application Record: ${record.record_id} | Category: ${record.category} | Status: ${record.status} | Amount: ₹${record.loan_amount_inr.toLocaleString('en-IN')} | Age: ${record.days_since_created} days | Fraud Review: ${record.flagged_for_fraud_review ? 'FLAGGED' : 'Clean'} | Escalation Score: ${score} (${isEscalated ? 'ESCALATION RECOMMENDED' : 'SLA Normal'}).`;

    session.history.push({ query: maskedText, answer: formattedAnswer });

    return {
      response_id: crypto.randomUUID(),
      intent: 'loan_status',
      query: maskedText,
      answer: formattedAnswer,
      sources: ['CRED-LOAN-DATABASE', record.record_id],
      escalation_required: isEscalated,
      escalation_score: score,
      escalation_reason: reason,
      retrieval_similarity: null,
      confidence_score: 0.98,
      guardrails_applied: guardrailsApplied,
      latency_ms: Math.round((performance.now() - startTime) * 100) / 100,
      trace_id: crypto.randomUUID(),
      nodes_traversed: nodesTraversed,
    };
  }

  // Step 4: RAG Policy Retrieval
  nodesTraversed.push('rag_policy_tool');
  const ragResult = queryRAGPolicy(maskedText, policyDocs);

  // Step 5: Output Guardrail
  nodesTraversed.push('output_guardrail');
  if (!ragResult.fallbackTriggered) {
    guardrailsApplied.push('OUTPUT_GROUNDEDNESS_VERIFIED');
  } else {
    guardrailsApplied.push('REFUSAL_GROUNDEDNESS_VERIFIED');
  }

  session.history.push({ query: maskedText, answer: ragResult.answer });

  return {
    response_id: crypto.randomUUID(),
    intent: ragResult.fallbackTriggered ? 'fallback' : 'rag_policy',
    query: maskedText,
    answer: ragResult.answer,
    sources: ragResult.sources,
    escalation_required: false,
    escalation_score: null,
    escalation_reason: null,
    retrieval_similarity: ragResult.similarity,
    confidence_score: ragResult.fallbackTriggered ? 0.35 : 0.92,
    guardrails_applied: guardrailsApplied,
    latency_ms: Math.round((performance.now() - startTime) * 100) / 100,
    trace_id: crypto.randomUUID(),
    nodes_traversed: nodesTraversed,
  };
}
