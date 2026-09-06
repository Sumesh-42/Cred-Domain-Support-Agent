import React, { useState } from 'react';
import {
  MessageSquare,
  FileSpreadsheet,
  BookOpen,
  Award,
  GitGraph,
  ScrollText,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import { LOAN_APPLICATIONS as INITIAL_LOANS, POLICY_DOCUMENTS as INITIAL_DOCS, INITIAL_AUDIT_LOGS } from './data/mockData';
import { LoanApplication, PolicyDocument, AuditLogEntry } from './types';
import { AgentConsole } from './components/AgentConsole';
import { LoanExplorer } from './components/LoanExplorer';
import { KnowledgeBaseExplorer } from './components/KnowledgeBaseExplorer';
import { EvaluationDashboard } from './components/EvaluationDashboard';
import { ArchitectureViewer } from './components/ArchitectureViewer';
import { AuditLogViewer } from './components/AuditLogViewer';

export default function App() {
  const [activeTab, setActiveTab] = useState<'console' | 'loans' | 'knowledge' | 'evals' | 'architecture' | 'logs'>('console');
  const [loanRecords] = useState<LoanApplication[]>(INITIAL_LOANS);
  const [policyDocs, setPolicyDocs] = useState<PolicyDocument[]>(INITIAL_DOCS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);

  const handleAddPolicyDocument = (newDoc: PolicyDocument) => {
    setPolicyDocs(prev => [newDoc, ...prev]);
    // Log addition into audit trail
    const auditEntry: AuditLogEntry = {
      trace_id: crypto.randomUUID(),
      timestamp: Date.now(),
      endpoint: '/add-document',
      method: 'POST',
      status_code: 200,
      latency_ms: 3.42,
      masked_request_text: `Ingested document: ${newDoc.doc_id} - ${newDoc.title}`,
      pii_guards_applied: [],
      response_intent: 'knowledge_ingest',
    };
    setAuditLogs(prev => [auditEntry, ...prev]);
  };

  const handleLogNewAudit = (
    query: string,
    intent: string,
    statusCode: number,
    guards: string[],
    latency: number
  ) => {
    const entry: AuditLogEntry = {
      trace_id: crypto.randomUUID(),
      timestamp: Date.now(),
      endpoint: '/ask',
      method: 'POST',
      status_code: statusCode,
      latency_ms: latency,
      masked_request_text: query,
      pii_guards_applied: guards,
      response_intent: intent,
    };
    setAuditLogs(prev => [entry, ...prev]);
  };

  return (
    <div className="min-h-screen bg-stone-100/60 text-stone-900 font-sans">
      {/* Top Application Bar */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Title */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-stone-900 flex items-center justify-center text-white font-black text-sm tracking-wider shadow-sm">
                CR
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm font-black text-stone-900 tracking-tight uppercase">
                    Cred Domain Support Agent
                  </h1>
                  <span className="inline-flex items-center px-2 py-0.2 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    Banking FinTech
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 font-medium">
                  LangGraph State Machine • RAG Core • PII Guardrails • SQLite Checkpoints • MCP Server
                </p>
              </div>
            </div>

            {/* Quick Status Pill */}
            <div className="hidden sm:flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-stone-600 bg-stone-50 px-2.5 py-1 rounded-lg border border-stone-200 font-mono text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                All 15 Tasks Operational
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2 border-t border-stone-100 text-xs">
            <button
              id="tab-btn-console"
              onClick={() => setActiveTab('console')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition cursor-pointer ${
                activeTab === 'console'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Agent Console
            </button>

            <button
              id="tab-btn-loans"
              onClick={() => setActiveTab('loans')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition cursor-pointer ${
                activeTab === 'loans'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Loan Records & Escalations ({loanRecords.length})
            </button>

            <button
              id="tab-btn-knowledge"
              onClick={() => setActiveTab('knowledge')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition cursor-pointer ${
                activeTab === 'knowledge'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Policy Knowledge Base ({policyDocs.length})
            </button>

            <button
              id="tab-btn-evals"
              onClick={() => setActiveTab('evals')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition cursor-pointer ${
                activeTab === 'evals'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              RAG Triad & Benchmarks
            </button>

            <button
              id="tab-btn-architecture"
              onClick={() => setActiveTab('architecture')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition cursor-pointer ${
                activeTab === 'architecture'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <GitGraph className="w-3.5 h-3.5" />
              LangGraph & MCP
            </button>

            <button
              id="tab-btn-logs"
              onClick={() => setActiveTab('logs')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition cursor-pointer ${
                activeTab === 'logs'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <ScrollText className="w-3.5 h-3.5" />
              Audit Logs ({auditLogs.length})
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'console' && (
          <AgentConsole
            loanRecords={loanRecords}
            policyDocs={policyDocs}
            onLogNewAudit={handleLogNewAudit}
          />
        )}

        {activeTab === 'loans' && (
          <LoanExplorer
            records={loanRecords}
            onSelectRecordForQuery={recId => {
              setActiveTab('console');
            }}
          />
        )}

        {activeTab === 'knowledge' && (
          <KnowledgeBaseExplorer
            documents={policyDocs}
            onAddDocument={handleAddPolicyDocument}
          />
        )}

        {activeTab === 'evals' && <EvaluationDashboard />}

        {activeTab === 'architecture' && <ArchitectureViewer />}

        {activeTab === 'logs' && <AuditLogViewer logs={auditLogs} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-4 mt-12 text-center text-xs text-stone-500">
        <p>Cred Domain Support Agent • Final Capstone (Banking & FinTech) • Production Grounded RAG & Guardrails</p>
      </footer>
    </div>
  );
}
