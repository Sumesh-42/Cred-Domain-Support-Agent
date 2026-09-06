import React from 'react';
import { ShieldCheck, Terminal, FileCode, CheckCircle2 } from 'lucide-react';
import { AuditLogEntry } from '../types';

interface AuditLogViewerProps {
  logs: AuditLogEntry[];
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ logs }) => {
  return (
    <div id="audit-log-viewer-container" className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-xl border border-stone-200 bg-white shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-stone-700" />
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wide">
              Structured Audit Logs
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
              Zero PII Leakage Enforced
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Persisted as JSON-Lines in <code>structured_audit_logs.jsonl</code>. All PAN, Aadhaar, and Bank Account records are strictly redacted prior to serialization.
          </p>
        </div>

        <div className="text-xs font-mono text-stone-600 bg-stone-100 px-3 py-1.5 rounded-lg border border-stone-200 self-start sm:self-auto">
          Total Logs: {logs.length}
        </div>
      </div>

      <div className="border border-stone-200 rounded-xl overflow-hidden bg-stone-900 shadow-xs">
        <div className="p-3 bg-stone-800/80 border-b border-stone-700 flex items-center justify-between text-xs text-stone-300 font-mono">
          <span className="flex items-center gap-1.5">
            <FileCode className="w-3.5 h-3.5 text-stone-400" />
            structured_audit_logs.jsonl
          </span>
          <span className="text-[11px] text-stone-400">Append-Only Immutable Sink</span>
        </div>

        <div className="p-4 overflow-x-auto max-h-[450px] space-y-2 font-mono text-xs text-emerald-400">
          {logs.map((log, idx) => (
            <div
              key={log.trace_id || idx}
              className="p-3 rounded bg-stone-950/70 border border-stone-800 hover:border-stone-700 transition space-y-1"
            >
              <div className="flex items-center justify-between text-stone-400 text-[11px]">
                <span>
                  [{new Date(log.timestamp).toLocaleTimeString()}] Trace:{' '}
                  <span className="text-stone-200">{log.trace_id}</span>
                </span>
                <span
                  className={`px-1.5 py-0.2 rounded font-bold ${
                    log.status_code === 200 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  HTTP {log.status_code} ({log.latency_ms}ms)
                </span>
              </div>
              <div className="text-stone-300 text-xs">
                <span className="text-amber-400 font-bold">{log.method}</span> {log.endpoint} →{' '}
                <span className="text-stone-100">"{log.masked_request_text}"</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-stone-500 pt-1">
                <span>Intent: {log.response_intent}</span>
                {log.pii_guards_applied.length > 0 && (
                  <span className="text-amber-300">
                    Guards: [{log.pii_guards_applied.join(', ')}]
                  </span>
                )}
                <span className="text-emerald-500 ml-auto flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> PII Sanitized
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
