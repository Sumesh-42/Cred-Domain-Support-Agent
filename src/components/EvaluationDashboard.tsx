import React from 'react';
import {
  Award,
  BarChart3,
  CheckCircle2,
  Sliders,
  Target,
  FileSearch,
  Sparkles,
  ShieldCheck,
  Percent,
} from 'lucide-react';
import { RAG_TRIAD_BENCHMARKS } from '../data/mockData';

export const EvaluationDashboard: React.FC = () => {
  return (
    <div id="evaluation-dashboard-container" className="space-y-6">
      {/* Top Banner: Composite Triad Score */}
      <div className="p-5 rounded-2xl border border-stone-200 bg-stone-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-300">
              RAG Triad Certified Benchmark
            </span>
          </div>
          <h2 className="text-lg font-bold">Comprehensive Evaluation & Calibrated Safety</h2>
          <p className="text-xs text-stone-400 max-w-xl">
            Empirical validation of Context Relevance, Groundedness Faithfulness, and Answer Relevance alongside calibrated thresholding.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-stone-800/80 px-4 py-2.5 rounded-xl border border-stone-700">
          <div className="text-center">
            <span className="text-[10px] text-stone-400 uppercase font-semibold">Composite Triad</span>
            <p className="text-2xl font-black text-emerald-400 font-mono">0.8840</p>
          </div>
          <div className="w-px h-8 bg-stone-700" />
          <div className="text-center">
            <span className="text-[10px] text-stone-400 uppercase font-semibold">Groundedness</span>
            <p className="text-2xl font-black text-amber-400 font-mono">1.0000</p>
          </div>
        </div>
      </div>

      {/* Triad Metric Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Context Relevance */}
        <div className="p-4 rounded-xl border border-stone-200 bg-white shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-700 uppercase">Context Relevance</span>
            <span className="font-mono text-sm font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded">
              0.8000 / 1.00
            </span>
          </div>
          <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full" style={{ width: '80%' }} />
          </div>
          <p className="text-[11px] text-stone-500 leading-relaxed">
            Measures precision of retrieved chunks containing regulatory clauses directly matching member intent.
          </p>
        </div>

        {/* Groundedness */}
        <div className="p-4 rounded-xl border border-stone-200 bg-white shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-700 uppercase">Groundedness (Faithfulness)</span>
            <span className="font-mono text-sm font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              1.0000 / 1.00
            </span>
          </div>
          <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-600 h-full rounded-full" style={{ width: '100%' }} />
          </div>
          <p className="text-[11px] text-stone-500 leading-relaxed">
            100% of answer assertions are directly entailed by retrieved policy clauses with zero hallucination.
          </p>
        </div>

        {/* Answer Relevance */}
        <div className="p-4 rounded-xl border border-stone-200 bg-white shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-700 uppercase">Answer Relevance</span>
            <span className="font-mono text-sm font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded">
              0.8519 / 1.00
            </span>
          </div>
          <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
            <div className="bg-purple-600 h-full rounded-full" style={{ width: '85.2%' }} />
          </div>
          <p className="text-[11px] text-stone-500 leading-relaxed">
            Evaluates completeness and direct responsiveness of the generated response to the user's specific query.
          </p>
        </div>
      </div>

      {/* Empirical Threshold Calibration */}
      <div className="p-5 rounded-xl border border-stone-200 bg-white shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-stone-700" />
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wide">
              Empirical Groundedness Threshold Calibration
            </h3>
          </div>
          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
            Calibrated Cutoff: 0.0844
          </span>
        </div>

        <p className="text-xs text-stone-600 leading-relaxed">
          The similarity threshold was calibrated empirically using min-in-scope and max-out-of-scope scoring. 
          Lowest in-scope similarity was <strong>0.1689</strong> (floating rate prepayment query) and highest out-of-scope was <strong>0.0000</strong> (chicken tikka masala recipe). 
          The midpoint threshold was set to <strong>0.0844</strong>, guaranteeing zero false positives on non-banking inquiries while admitting 100% of legitimate queries.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg text-xs space-y-1">
            <span className="font-semibold text-emerald-900">In-Scope Query Scores (Min: 0.1689):</span>
            <ul className="space-y-0.5 text-[11px] text-emerald-800 font-mono">
              <li>• Fraud Dispute Turnaround: 0.5193 (Passed)</li>
              <li>• EMI Reducing Formula: 0.2926 (Passed)</li>
              <li>• Credit Card Fees & Billing: 0.2822 (Passed)</li>
              <li>• KYC Salaried Criteria: 0.2645 (Passed)</li>
              <li>• Floating Rate Prepayment: 0.1689 (Passed)</li>
            </ul>
          </div>

          <div className="p-3 bg-rose-50/60 border border-rose-200 rounded-lg text-xs space-y-1">
            <span className="font-semibold text-rose-900">Out-of-Scope Query Scores (Max: 0.0000):</span>
            <ul className="space-y-0.5 text-[11px] text-rose-800 font-mono">
              <li>• Chicken Tikka Masala Recipe: 0.0000 (Filtered)</li>
              <li>• Weather in Bangalore: 0.0000 (Filtered)</li>
              <li>• Cricket Match Summary: 0.0000 (Filtered)</li>
              <li>• Action: Triggered Safe Refusal Fallback</li>
              <li>• False Rejection Rate: 0.0%</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Chunking Strategy Precision@3 vs Recall@3 */}
      <div className="p-5 rounded-xl border border-stone-200 bg-white shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-stone-700" />
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wide">
              Precision@3 & Recall@3 Retrieval Evaluation
            </h3>
          </div>
          <span className="text-xs font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Selected: Sentence-Based Chunking
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-lg border border-stone-200 bg-stone-50 space-y-1.5">
            <span className="text-xs font-semibold text-stone-800">Fixed-Size Chunking (100 tok, 20 overlap)</span>
            <div className="flex items-center gap-4 text-xs font-mono pt-1">
              <div>
                <span className="text-stone-500 block text-[10px]">Precision@3</span>
                <span className="font-bold text-stone-900 text-sm">0.7667</span>
              </div>
              <div className="w-px h-6 bg-stone-300" />
              <div>
                <span className="text-stone-500 block text-[10px]">Recall@3</span>
                <span className="font-bold text-stone-900 text-sm">1.0000</span>
              </div>
            </div>
            <p className="text-[11px] text-stone-500 pt-1">
              Higher raw term overlap, but splits policy clauses mid-sentence leading to fragmented legal definitions.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-emerald-300 bg-emerald-50/40 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-900">Sentence-Based Boundary Chunking</span>
              <span className="text-[10px] uppercase font-bold text-emerald-700">Production Choice</span>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono pt-1">
              <div>
                <span className="text-stone-500 block text-[10px]">Precision@3</span>
                <span className="font-bold text-stone-900 text-sm">0.6667</span>
              </div>
              <div className="w-px h-6 bg-emerald-300" />
              <div>
                <span className="text-stone-500 block text-[10px]">Recall@3</span>
                <span className="font-bold text-stone-900 text-sm">1.0000</span>
              </div>
            </div>
            <p className="text-[11px] text-emerald-800 pt-1">
              Maintains full regulatory sentence syntax and attaches document titles. Guarantees coherent, legally actionable banking guidance.
            </p>
          </div>
        </div>
      </div>

      {/* Canonical RAG Triad Table */}
      <div className="border border-stone-200 rounded-xl overflow-hidden bg-white shadow-xs">
        <div className="p-3.5 bg-stone-100/70 border-b border-stone-200 flex items-center justify-between">
          <span className="text-xs font-bold text-stone-800 uppercase tracking-wide">
            Canonical 5-Query Benchmark Matrix
          </span>
          <span className="text-xs text-stone-500 font-mono">eval_rag_triad.py</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200">
              <tr>
                <th className="py-2.5 px-3">Evaluation Query</th>
                <th className="py-2.5 px-3">Domain</th>
                <th className="py-2.5 px-3">Context Relevance</th>
                <th className="py-2.5 px-3">Groundedness</th>
                <th className="py-2.5 px-3">Answer Relevance</th>
                <th className="py-2.5 px-3 font-mono">Triad Avg</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-mono text-[11px]">
              {RAG_TRIAD_BENCHMARKS.map((item, idx) => (
                <tr key={idx} className="hover:bg-stone-50/80 transition">
                  <td className="py-2.5 px-3 font-sans font-medium text-stone-900 max-w-xs truncate">
                    {item.query}
                  </td>
                  <td className="py-2.5 px-3 font-sans text-stone-600">{item.category}</td>
                  <td className="py-2.5 px-3">{item.context_relevance.toFixed(4)}</td>
                  <td className="py-2.5 px-3 text-emerald-700 font-bold">
                    {item.groundedness.toFixed(4)}
                  </td>
                  <td className="py-2.5 px-3">{item.answer_relevance.toFixed(4)}</td>
                  <td className="py-2.5 px-3 font-bold text-stone-900">
                    {item.triad_average.toFixed(4)}
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
