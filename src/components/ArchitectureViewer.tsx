import React from 'react';
import {
  GitFork,
  Database,
  ShieldAlert,
  Server,
  Terminal,
  RotateCcw,
  CheckCircle,
  FileCode,
  Network,
} from 'lucide-react';

export const ArchitectureViewer: React.FC = () => {
  return (
    <div id="architecture-viewer-container" className="space-y-6">
      {/* LangGraph Visual Flow */}
      <div className="p-5 rounded-xl border border-stone-200 bg-white shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-stone-700" />
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wide">
              LangGraph StateGraph Execution Topology
            </h3>
          </div>
          <span className="text-xs font-mono text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
            Cyclic & Interrupted Execution Ready
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
          {/* Node 1 */}
          <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/50 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-blue-900">
              <span>1. input_guardrail</span>
              <span className="text-[10px] font-mono bg-blue-200/60 px-1.5 py-0.5 rounded">ENTRY</span>
            </div>
            <p className="text-[11px] text-blue-800 leading-snug">
              Masks PAN, Aadhaar, Bank Acc. Intercepts prompt injections & malicious system overrides.
            </p>
            <div className="text-[10px] font-mono text-blue-700 pt-1">
              • [MASKED_PAN]
              <br />• Injection signature check
            </div>
          </div>

          {/* Node 2 */}
          <div className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/50 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-purple-900">
              <span>2. route_intent</span>
              <span className="text-[10px] font-mono bg-purple-200/60 px-1.5 py-0.5 rounded">ROUTER</span>
            </div>
            <p className="text-[11px] text-purple-800 leading-snug">
              Classifies query intent. Resolves multi-turn antecedent pronoun references via SQLite context.
            </p>
            <div className="text-[10px] font-mono text-purple-700 pt-1">
              • Branch: rag_policy
              <br />• Branch: loan_status
            </div>
          </div>

          {/* Node 3 */}
          <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-amber-900">
              <span>3. Tool Execution</span>
              <span className="text-[10px] font-mono bg-amber-200/60 px-1.5 py-0.5 rounded">EXEC</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-snug">
              Dispatches either RAG semantic vector search or loan record lookup with SLA escalation formula.
            </p>
            <div className="text-[10px] font-mono text-amber-700 pt-1">
              • TF-IDF Vector Search
              <br />• Score = 0.65*F + 0.35*R
            </div>
          </div>

          {/* Node 4 */}
          <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
              <span>4. output_guardrail</span>
              <span className="text-[10px] font-mono bg-emerald-200/60 px-1.5 py-0.5 rounded">EXIT</span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-snug">
              Guarantees zero unredacted PII in output. Enforces strict Pydantic JSON schema structure.
            </p>
            <div className="text-[10px] font-mono text-emerald-700 pt-1">
              • Groundedness verification
              <br />• Audit logging write
            </div>
          </div>
        </div>
      </div>

      {/* Persistence & Checkpointing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* SQLite Checkpointer */}
        <div className="p-4.5 rounded-xl border border-stone-200 bg-white shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-stone-700" />
              <h4 className="text-xs font-bold text-stone-900 uppercase">
                SQLite Checkpointer & Time-Travel
              </h4>
            </div>
            <span className="text-[10px] font-mono bg-stone-100 px-1.5 py-0.5 rounded text-stone-600">
              checkpoints.sqlite
            </span>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            Every step in the StateGraph serializes its complete state dictionary into SQLite table <code>graph_checkpoints</code>. 
            Allows pausing runs at any step (e.g. <code>stop_after_node="input_guardrail"</code>), auditing in-flight state, resuming without recomputing prior nodes, and rewinding to past checkpoints for branching execution.
          </p>
          <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200 font-mono text-[11px] text-stone-800">
            <code>
              CREATE TABLE graph_checkpoints (
              <br />&nbsp;&nbsp;checkpoint_id TEXT PRIMARY KEY,
              <br />&nbsp;&nbsp;thread_id TEXT,
              <br />&nbsp;&nbsp;step_index INTEGER,
              <br />&nbsp;&nbsp;node_name TEXT,
              <br />&nbsp;&nbsp;state_json TEXT,
              <br />&nbsp;&nbsp;timestamp REAL
              <br />);
            </code>
          </div>
        </div>

        {/* Model Context Protocol Server */}
        <div className="p-4.5 rounded-xl border border-stone-200 bg-white shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-stone-700" />
              <h4 className="text-xs font-bold text-stone-900 uppercase">
                Model Context Protocol (MCP) Server
              </h4>
            </div>
            <span className="text-[10px] font-mono bg-stone-100 px-1.5 py-0.5 rounded text-stone-600">
              mcp_server.py
            </span>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            Standardizes agent tools using the Anthropic Model Context Protocol (MCP) specification. Provides JSON-RPC 2.0 interface supporting both stdio pipes and HTTP transport.
          </p>
          <div className="space-y-1 text-xs">
            <div className="p-2 bg-stone-50 rounded border border-stone-200 flex items-center justify-between">
              <span className="font-mono text-stone-900 font-semibold">check_loan_application_status</span>
              <span className="text-[10px] text-stone-500">Record Lookup + Escalation</span>
            </div>
            <div className="p-2 bg-stone-50 rounded border border-stone-200 flex items-center justify-between">
              <span className="font-mono text-stone-900 font-semibold">retrieve_policy_clauses</span>
              <span className="text-[10px] text-stone-500">RAG Semantic Search</span>
            </div>
            <div className="p-2 bg-stone-50 rounded border border-stone-200 flex items-center justify-between">
              <span className="font-mono text-stone-900 font-semibold">calculate_escalation_score</span>
              <span className="text-[10px] text-stone-500">Turnaround SLA Risk Metric</span>
            </div>
            <div className="p-2 bg-stone-50 rounded border border-stone-200 flex items-center justify-between">
              <span className="font-mono text-stone-900 font-semibold">add_policy_document</span>
              <span className="text-[10px] text-stone-500">Dynamic Ingestion & Re-index</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
