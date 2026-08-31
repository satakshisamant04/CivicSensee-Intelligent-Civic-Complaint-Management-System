import React from 'react';
import { ExplainabilityDetails, PriorityLevel } from '../types/index.js';
import { BrainCircuit, CheckCircle2, TrendingUp, Info } from 'lucide-react';

interface ExplainabilityCardProps {
  explainability: ExplainabilityDetails;
  priority: PriorityLevel;
  category: string;
  daysPending?: number;
  previousComplaints?: number;
  compact?: boolean;
}

export const ExplainabilityCard: React.FC<ExplainabilityCardProps> = ({
  explainability,
  priority,
  category,
  daysPending = 0,
  previousComplaints = 0,
  compact = false
}) => {
  const { primaryDrivers, probabilities, modelConfidence } = explainability;

  return (
    <div
      id="ml-explainability-card"
      className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4"
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Why <span className={priority === 'HIGH' ? 'text-red-600' : priority === 'MEDIUM' ? 'text-amber-600' : 'text-emerald-600'}>{priority}</span> priority?
            </h4>
            <p className="text-xs text-slate-500">
              ML Model Intelligence Recommendation ({Math.round(modelConfidence * 100)}% confidence)
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
          TF-IDF + Softmax
        </span>
      </div>

      {/* Supporting Factors List */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
          <span>Contributing Urgency Factors</span>
        </div>
        <ul className="space-y-1.5 text-xs text-slate-600">
          {primaryDrivers && primaryDrivers.length > 0 ? (
            primaryDrivers.map((factor, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-slate-50 p-2 rounded-lg border border-slate-150">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>{factor}</span>
              </li>
            ))
          ) : (
            <li className="text-slate-500 italic">Standard municipal infrastructure maintenance factors.</li>
          )}
        </ul>
      </div>

      {!compact && probabilities && (
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
            <span>Model Probability Distribution</span>
            <span className="text-[11px] text-slate-400">Sum = 1.0</span>
          </div>

          <div className="space-y-1.5">
            <div>
              <div className="flex justify-between text-[11px] font-medium text-slate-700 mb-0.5">
                <span className="text-red-700 font-semibold">HIGH</span>
                <span className="font-mono">{Math.round((probabilities.HIGH || 0) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-red-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(4, Math.round((probabilities.HIGH || 0) * 100))}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-medium text-slate-700 mb-0.5">
                <span className="text-amber-700 font-semibold">MEDIUM</span>
                <span className="font-mono">{Math.round((probabilities.MEDIUM || 0) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(4, Math.round((probabilities.MEDIUM || 0) * 100))}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-medium text-slate-700 mb-0.5">
                <span className="text-emerald-700 font-semibold">LOW</span>
                <span className="font-mono">{Math.round((probabilities.LOW || 0) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(4, Math.round((probabilities.LOW || 0) * 100))}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Advisory Note */}
      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 bg-blue-50/60 p-2 rounded border border-blue-100">
        <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
        <span>ML output serves as an operational prioritization recommendation for municipal triage officers.</span>
      </div>
    </div>
  );
};
