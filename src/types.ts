export interface LoanApplication {
  record_id: string;
  category: 'Personal Loan' | 'Home Loan' | 'Auto Loan' | 'Education Loan' | 'Credit Line' | string;
  status: 'Submitted' | 'Under Review' | 'Approved' | 'Disbursed' | 'Rejected' | string;
  loan_amount_inr: number;
  days_since_created: number;
  flagged_for_fraud_review: boolean;
  escalation_score?: number;
  escalation_recommended?: boolean;
  escalation_reason?: string;
}

export interface PolicyDocument {
  doc_id: string;
  topic: string;
  title: string;
  content: string;
}

export interface PolicyChunk {
  chunk_id: string;
  doc_id: string;
  title: string;
  text: string;
  strategy: 'fixed_size' | 'sentence_based';
}

export interface AgentResponse {
  response_id: string;
  intent: 'rag_policy' | 'loan_status' | 'guardrail_block' | 'fallback';
  query: string;
  answer: string;
  sources: string[];
  escalation_required: boolean;
  escalation_score?: number | null;
  escalation_reason?: string | null;
  retrieval_similarity?: number | null;
  confidence_score: number;
  guardrails_applied: string[];
  latency_ms?: number;
  trace_id?: string;
  nodes_traversed?: string[];
}

export interface AuditLogEntry {
  trace_id: string;
  timestamp: number;
  endpoint: string;
  method: string;
  status_code: number;
  latency_ms: number;
  masked_request_text: string;
  pii_guards_applied: string[];
  response_intent: string;
  metadata?: Record<string, any>;
}

export interface TriadMetric {
  query: string;
  category: string;
  target_docs: string[];
  retrieved_sources: string[];
  retrieval_similarity: number;
  context_relevance: number;
  groundedness: number;
  answer_relevance: number;
  triad_average: number;
  fallback_triggered: boolean;
}
