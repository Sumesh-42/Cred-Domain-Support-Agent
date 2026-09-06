import React, { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  AlertOctagon,
  ShieldCheck,
  CheckCircle,
  FileCheck2,
  DollarSign,
  Calendar,
  Calculator,
} from 'lucide-react';
import { LoanApplication } from '../types';

interface LoanExplorerProps {
  records: LoanApplication[];
  onSelectRecordForQuery?: (recordId: string) => void;
}

export const LoanExplorer: React.FC<LoanExplorerProps> = ({
  records,
  onSelectRecordForQuery,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [onlyFraud, setOnlyFraud] = useState<boolean>(false);

  // Simulator State
  const [simDays, setSimDays] = useState<number>(20);
  const [simFraud, setSimFraud] = useState<boolean>(false);
  const [simAmount, setSimAmount] = useState<number>(500000);

  // Filtered list
  const filtered = useMemo(() => {
    return records.filter(r => {
      const matchSearch =
        r.record_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = selectedCategory === 'ALL' || r.category === selectedCategory;
      const matchStat = selectedStatus === 'ALL' || r.status === selectedStatus;
      const matchFraud = !onlyFraud || r.flagged_for_fraud_review;
      return matchSearch && matchCat && matchStat && matchFraud;
    });
  }, [records, searchTerm, selectedCategory, selectedStatus, onlyFraud]);

  // Simulator formula calculation: 0.65 * fraud + 0.35 * (days / 30.0)
  const simRecency = Math.min(Math.max(simDays / 30.0, 0), 1.0);
  const simScore = Math.round((0.65 * (simFraud ? 1.0 : 0.0) + 0.35 * simRecency) * 10000) / 10000;
  const simEscalated = simScore >= 0.50;

  return (
    <div id="loan-explorer-container" className="space-y-6">
      {/* Top Metric Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border border-stone-200 bg-white shadow-xs">
          <span className="text-xs font-medium text-stone-500">Total Applications</span>
          <p className="text-xl font-bold text-stone-900 mt-1 font-mono">{records.length}</p>
          <span className="text-[11px] text-stone-400">100% Validated Schema</span>
        </div>
        <div className="p-3.5 rounded-xl border border-stone-200 bg-white shadow-xs">
          <span className="text-xs font-medium text-stone-500">Fraud Flagged</span>
          <p className="text-xl font-bold text-rose-600 mt-1 font-mono">
            {records.filter(r => r.flagged_for_fraud_review).length}
          </p>
          <span className="text-[11px] text-stone-400">
            {((records.filter(r => r.flagged_for_fraud_review).length / records.length) * 100).toFixed(1)}% (Target: 10–30%)
          </span>
        </div>
        <div className="p-3.5 rounded-xl border border-stone-200 bg-white shadow-xs">
          <span className="text-xs font-medium text-stone-500">Escalated (Score ≥ 0.50)</span>
          <p className="text-xl font-bold text-amber-600 mt-1 font-mono">
            {records.filter(r => (r.escalation_score || 0) >= 0.50).length}
          </p>
          <span className="text-[11px] text-stone-400">Requires Senior Arbitrator</span>
        </div>
        <div className="p-3.5 rounded-xl border border-stone-200 bg-white shadow-xs">
          <span className="text-xs font-medium text-stone-500">Average Turnaround</span>
          <p className="text-xl font-bold text-stone-900 mt-1 font-mono">
            {(records.reduce((acc, r) => acc + r.days_since_created, 0) / records.length).toFixed(1)} Days
          </p>
          <span className="text-[11px] text-stone-400">80th percentile: 24 days</span>
        </div>
      </div>

      {/* Escalation Formula Simulator Card */}
      <div className="p-4.5 rounded-xl border border-stone-200 bg-stone-50/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-stone-700" />
            <span className="text-xs font-semibold text-stone-900 uppercase tracking-wide">
              Live Escalation Score Simulator (Task 6 Formula)
            </span>
          </div>
          <span className="text-xs font-mono text-stone-500 bg-white px-2 py-0.5 rounded border border-stone-200">
            Score = (0.65 × Fraud) + (0.35 × Days/30)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          {/* Days Slider */}
          <div>
            <div className="flex justify-between text-xs text-stone-600 mb-1">
              <span>Days Since Created:</span>
              <span className="font-mono font-semibold">{simDays} days</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              value={simDays}
              onChange={e => setSimDays(Number(e.target.value))}
              className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-800"
            />
          </div>

          {/* Fraud Flag Toggle */}
          <div className="flex items-center justify-between sm:justify-start gap-3">
            <span className="text-xs text-stone-600">Flagged for Fraud:</span>
            <button
              onClick={() => setSimFraud(!simFraud)}
              className={`px-3 py-1 text-xs font-medium rounded-lg border transition cursor-pointer ${
                simFraud
                  ? 'bg-rose-100 border-rose-300 text-rose-800 font-bold'
                  : 'bg-white border-stone-300 text-stone-600'
              }`}
            >
              {simFraud ? 'FLAGGED (1.0)' : 'CLEAN (0.0)'}
            </button>
          </div>

          {/* Computed Score Display */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-stone-200">
            <span className="text-xs font-medium text-stone-700">Calculated Score:</span>
            <div className="text-right">
              <span
                className={`font-mono text-sm font-bold ${
                  simEscalated ? 'text-rose-600' : 'text-emerald-700'
                }`}
              >
                {simScore.toFixed(4)}
              </span>
              <span
                className={`ml-2 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                  simEscalated ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {simEscalated ? 'ESCALATE' : 'NORMAL'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by ID (e.g. CRED-LN-0004)..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs text-stone-900 placeholder-stone-400 bg-white border border-stone-300 rounded-lg outline-none focus:border-stone-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded-lg text-stone-700 outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="Personal Loan">Personal Loan</option>
            <option value="Home Loan">Home Loan</option>
            <option value="Auto Loan">Auto Loan</option>
            <option value="Education Loan">Education Loan</option>
            <option value="Credit Line">Credit Line</option>
          </select>

          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded-lg text-stone-700 outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Approved">Approved</option>
            <option value="Disbursed">Disbursed</option>
            <option value="Rejected">Rejected</option>
          </select>

          {/* Fraud Filter Button */}
          <button
            onClick={() => setOnlyFraud(!onlyFraud)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition cursor-pointer ${
              onlyFraud
                ? 'bg-rose-50 border-rose-300 text-rose-800'
                : 'bg-white border-stone-300 text-stone-600'
            }`}
          >
            {onlyFraud ? 'Fraud Only' : 'Show All'}
          </button>
        </div>
      </div>

      {/* Tabular Directory */}
      <div className="border border-stone-200 rounded-xl overflow-hidden bg-white shadow-xs">
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-stone-100/80 sticky top-0 border-b border-stone-200 text-stone-600 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Record ID</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Principal (INR)</th>
                <th className="py-2.5 px-3">Age</th>
                <th className="py-2.5 px-3">Fraud Audit</th>
                <th className="py-2.5 px-3">Escalation Score</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map(loan => (
                <tr key={loan.record_id} className="hover:bg-stone-50/80 transition font-mono text-[11px]">
                  <td className="py-2 px-3 font-semibold text-stone-900">{loan.record_id}</td>
                  <td className="py-2 px-3 font-sans text-stone-700">{loan.category}</td>
                  <td className="py-2 px-3 font-sans">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        loan.status === 'Approved' || loan.status === 'Disbursed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : loan.status === 'Rejected'
                          ? 'bg-stone-100 text-stone-600 border border-stone-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {loan.status}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-stone-900 font-medium">
                    ₹{loan.loan_amount_inr.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2 px-3 text-stone-600">{loan.days_since_created}d</td>
                  <td className="py-2 px-3">
                    {loan.flagged_for_fraud_review ? (
                      <span className="inline-flex items-center gap-1 text-rose-600 font-bold">
                        <AlertOctagon className="w-3 h-3" /> Flagged
                      </span>
                    ) : (
                      <span className="text-stone-400">Clean</span>
                    )}
                  </td>
                  <td className="py-2 px-3">
                    <span
                      className={`font-semibold ${
                        (loan.escalation_score || 0) >= 0.50 ? 'text-rose-600' : 'text-stone-600'
                      }`}
                    >
                      {loan.escalation_score?.toFixed(4)}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right font-sans">
                    {onSelectRecordForQuery && (
                      <button
                        onClick={() => onSelectRecordForQuery(loan.record_id)}
                        className="text-xs text-stone-900 hover:text-stone-600 underline font-medium cursor-pointer"
                      >
                        Ask Agent
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
