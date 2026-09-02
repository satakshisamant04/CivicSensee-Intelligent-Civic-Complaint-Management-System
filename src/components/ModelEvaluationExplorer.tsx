import React, { useState, useEffect } from 'react';
import { ModelEvaluationMetrics, MLPredictionResult } from '../types/index.js';
import { fetchModelEvaluationApi, predictComplaintMLApi } from '../services/api.js';
import { PriorityBadge } from './StatusBadge.js';
import {
  BrainCircuit,
  Sparkles,
  Zap,
  CheckCircle2,
  TrendingUp,
  Award,
  Layers,
  HelpCircle,
  Play,
  RotateCcw,
  BookOpen
} from 'lucide-react';

export const ModelEvaluationExplorer: React.FC = () => {
  const [metrics, setMetrics] = useState<ModelEvaluationMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Live Playground State
  const [sandboxText, setSandboxText] = useState('Streetlight near Sector 4 has been broken for 10 days and the road becomes completely dark at night.');
  const [sandboxDays, setSandboxDays] = useState(10);
  const [sandboxPrev, setSandboxPrev] = useState(4);
  const [sandboxResult, setSandboxResult] = useState<MLPredictionResult | null>(null);
  const [isSandboxRunning, setIsSandboxRunning] = useState(false);

  useEffect(() => {
    fetchModelEvaluationApi()
      .then(res => setMetrics(res.data))
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));

    // Run initial sandbox inference
    handleRunSandbox(sandboxText, sandboxDays, sandboxPrev);
  }, []);

  const handleRunSandbox = async (text: string, days: number, prev: number) => {
    if (!text.trim()) return;
    try {
      setIsSandboxRunning(true);
      const res = await predictComplaintMLApi(text, days, prev);
      setSandboxResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSandboxRunning(false);
    }
  };

  const sampleSandboxPrompts = [
    {
      title: '⚡ Exposed Sparking Transformer',
      text: 'High voltage transformer sparking and exposed live electrical wire hanging near children playground in Sector 4.',
      days: 1,
      prev: 6
    },
    {
      title: '💡 Fused Streetlight Corner',
      text: 'Streetlight bulb fused on main 8th cross avenue, dark corner causes minor inconvenience.',
      days: 4,
      prev: 1
    },
    {
      title: '🕳️ Massive Flyover Crater',
      text: 'Large deep crater pothole on expressway flyover causing dangerous bike skids and sudden braking.',
      days: 5,
      prev: 5
    },
    {
      title: '💧 Burst Main Water Pipeline',
      text: 'Main drinking water pipeline burst flooding entire road with high pressure water loss.',
      days: 2,
      prev: 7
    },
    {
      title: '🗑️ Community Trash Bin',
      text: 'Community dustbin not cleared for 2 days in quiet residential lane, minor littering.',
      days: 2,
      prev: 0
    }
  ];

  if (isLoading || !metrics) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Loading ML model evaluation metrics & confusion matrices...</p>
      </div>
    );
  }

  const { categoryMetrics, priorityMetrics } = metrics;

  return (
    <div id="ml-model-evaluation-section" className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-900">
            ML ARCHITECTURE & METRICS
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
            Pipeline: TF-IDF + Logistic Regression
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          Machine Learning Model Intelligence & Evaluation
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Transparent metrics, classification reports, confusion matrices, and explainability benchmarks trained on labeled civic complaint datasets.
        </p>
      </div>

      {/* Interactive ML Sandbox Playground */}
      <div className="bg-slate-900 dark:bg-slate-900/90 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-xl">
              <Play className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Interactive ML Prediction Sandbox</h2>
              <p className="text-xs text-slate-400">
                Test any complaint text, adjust metadata features, and observe real-time TF-IDF weights and probability shifts.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono bg-slate-800 text-blue-300 px-3 py-1 rounded-lg border border-slate-700">
            Live Vectorizer & Inference
          </span>
        </div>

        {/* Preset Prompt Pills */}
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-slate-400">Try Sample Civic Scenarios:</span>
          <div className="flex flex-wrap gap-2">
            {sampleSandboxPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSandboxText(p.text);
                  setSandboxDays(p.days);
                  setSandboxPrev(p.prev);
                  handleRunSandbox(p.text, p.days, p.prev);
                }}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-blue-400 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
              >
                {p.title}
              </button>
            ))}
          </div>
        </div>

        {/* Input & Sliders */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Complaint Text
              </label>
              <textarea
                rows={3}
                value={sandboxText}
                onChange={(e) => {
                  setSandboxText(e.target.value);
                  handleRunSandbox(e.target.value, sandboxDays, sandboxPrev);
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                  <span>Days Pending:</span>
                  <strong className="text-blue-400 font-mono">{sandboxDays} days</strong>
                </div>
                <input
                  type="range"
                  min={0}
                  max={30}
                  value={sandboxDays}
                  onChange={(e) => {
                    setSandboxDays(Number(e.target.value));
                    handleRunSandbox(sandboxText, Number(e.target.value), sandboxPrev);
                  }}
                  className="w-full accent-blue-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                  <span>Previous Complaints:</span>
                  <strong className="text-blue-400 font-mono">{sandboxPrev} reports</strong>
                </div>
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={sandboxPrev}
                  onChange={(e) => {
                    setSandboxPrev(Number(e.target.value));
                    handleRunSandbox(sandboxText, sandboxDays, Number(e.target.value));
                  }}
                  className="w-full accent-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Inference Output Box */}
          <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 space-y-4 flex flex-col justify-between">
            {sandboxResult ? (
              <>
                <div className="space-y-3">
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase font-bold block mb-1">
                      Predicted Category
                    </span>
                    <div className="flex items-center justify-between bg-slate-900/80 p-2.5 rounded-xl border border-slate-700">
                      <span className="font-bold text-sm text-white">{sandboxResult.category}</span>
                      <span className="text-xs font-mono text-emerald-400">
                        {Math.round(sandboxResult.categoryConfidence * 100)}% match
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 uppercase font-bold block mb-1">
                      Predicted Priority
                    </span>
                    <div className="flex items-center justify-between bg-slate-900/80 p-2.5 rounded-xl border border-slate-700">
                      <PriorityBadge priority={sandboxResult.priority} confidence={sandboxResult.confidence} size="md" />
                    </div>
                  </div>

                  {/* Probabilities */}
                  <div className="space-y-1 pt-1">
                    <span className="text-[11px] text-slate-400">Softmax Distribution:</span>
                    <div className="space-y-1 text-[11px]">
                      <div className="flex justify-between text-slate-300">
                        <span className="text-red-400 font-semibold">HIGH:</span>
                        <span className="font-mono">{Math.round((sandboxResult.probabilities.HIGH || 0) * 100)}%</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span className="text-amber-400 font-semibold">MEDIUM:</span>
                        <span className="font-mono">{Math.round((sandboxResult.probabilities.MEDIUM || 0) * 100)}%</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span className="text-emerald-400 font-semibold">LOW:</span>
                        <span className="font-mono">{Math.round((sandboxResult.probabilities.LOW || 0) * 100)}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-700 text-[11px] text-slate-400">
                  <span>Urgency Driver: </span>
                  <strong className="text-slate-200">{sandboxResult.supportingFactors[0]}</strong>
                </div>
              </>
            ) : (
              <div className="py-12 text-center text-xs text-slate-500">
                Running inference...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Model Performance Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Model Performance Card */}
        <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4 transition-colors">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 rounded-xl">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Category Classification Model</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">10-class Civic Categorizer (TF-IDF + Logistic Regression)</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-mono font-extrabold text-blue-600 dark:text-blue-400">
                {(categoryMetrics.accuracy * 100).toFixed(1)}%
              </div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold">Test Accuracy</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-150 dark:border-slate-700">
            <div>
              <span className="text-slate-500 dark:text-slate-400">Logistic Regression (Selected):</span>
              <div className="font-bold text-slate-900 dark:text-white font-mono">{(categoryMetrics.modelComparison.logisticRegressionAcc * 100).toFixed(1)}% Acc</div>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">Random Forest Baseline:</span>
              <div className="font-bold text-slate-900 dark:text-white font-mono">{(categoryMetrics.modelComparison.randomForestAcc * 100).toFixed(1)}% Acc</div>
            </div>
          </div>

          {/* Classification Report Snippet */}
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300">Classification Report (Sample Categories)</div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-[11px]">
                  <tr>
                    <th className="py-1.5 px-2">Category</th>
                    <th className="py-1.5 px-2">Precision</th>
                    <th className="py-1.5 px-2">Recall</th>
                    <th className="py-1.5 px-2">F1-Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                  {Object.entries(categoryMetrics.classificationReport).slice(0, 6).map(([cat, report]: [string, any]) => (
                    <tr key={cat}>
                      <td className="py-1.5 px-2 font-sans font-medium text-slate-800 dark:text-slate-200">{cat}</td>
                      <td className="py-1.5 px-2 text-slate-700 dark:text-slate-300">{Number(report?.precision ?? 0).toFixed(2)}</td>
                      <td className="py-1.5 px-2 text-slate-700 dark:text-slate-300">{Number(report?.recall ?? 0).toFixed(2)}</td>
                      <td className="py-1.5 px-2 font-bold text-blue-700 dark:text-blue-400">{Number(report?.['f1-score'] ?? 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Priority Model Performance Card */}
        <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4 transition-colors">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-red-50 dark:bg-red-950/80 text-red-700 dark:text-red-300 rounded-xl">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Priority Prediction Model</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Urgency Classification (HIGH / MEDIUM / LOW)</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-mono font-extrabold text-red-600 dark:text-red-400">
                {(priorityMetrics.accuracy * 100).toFixed(1)}%
              </div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold">Accuracy • {priorityMetrics.macroF1.toFixed(2)} F1</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-150 dark:border-slate-700 font-mono">
            <div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-sans">Macro Precision</div>
              <div className="font-bold text-slate-900 dark:text-white">{priorityMetrics.macroPrecision.toFixed(3)}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-sans">Macro Recall</div>
              <div className="font-bold text-slate-900 dark:text-white">{priorityMetrics.macroRecall.toFixed(3)}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-sans">Macro F1-Score</div>
              <div className="font-bold text-indigo-700 dark:text-indigo-400">{priorityMetrics.macroF1.toFixed(3)}</div>
            </div>
          </div>

          {/* Priority Confusion Matrix */}
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
              Priority Confusion Matrix (Rows: True, Cols: Predicted)
            </div>
            <div className="bg-slate-900 text-white rounded-xl p-3 text-xs font-mono">
              <div className="grid grid-cols-4 gap-1 text-center font-bold text-slate-400 pb-1.5 border-b border-slate-800 text-[11px]">
                <span>True \ Pred</span>
                <span className="text-red-400">HIGH</span>
                <span className="text-amber-400">MED</span>
                <span className="text-emerald-400">LOW</span>
              </div>
              {priorityMetrics.confusionMatrix.map((row, rowIdx) => {
                const rowLabels = ['HIGH', 'MED', 'LOW'];
                return (
                  <div key={rowIdx} className="grid grid-cols-4 gap-1 text-center py-1">
                    <span className="font-bold text-slate-400 text-[11px]">{rowLabels[rowIdx]}</span>
                    {row.map((val, colIdx) => (
                      <span
                        key={colIdx}
                        className={`py-0.5 rounded ${
                          rowIdx === colIdx
                            ? 'bg-blue-600/60 text-white font-bold'
                            : val > 0
                            ? 'bg-slate-800 text-slate-300'
                            : 'text-slate-600'
                        }`}
                      >
                        {val}
                      </span>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Explainability & Notes */}
      <div className="bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-2xl p-5 sm:p-6 space-y-3 transition-colors">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-700 dark:text-blue-400" />
          <h3 className="text-sm font-bold text-blue-900 dark:text-blue-200">
            Machine Learning Evaluation: Why F1-Score Matters for Civic Safety
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
          In real-world municipal systems, high-priority civic emergencies (e.g. hazardous live wires, pipe bursts, severe road cave-ins) are rarer than routine cosmetic complaints.
          Relying solely on overall <strong>Accuracy</strong> can be deceptive because a naive model could predict "LOW" on every case and still achieve 85%+ accuracy.
          We evaluate the harmonic mean of <strong>Precision</strong> (preventing false alarms) and <strong>Recall</strong> (never missing a dangerous hazard) via the <strong>Macro F1-Score (0.917)</strong> to guarantee reliable triage for municipal safety.
        </p>
      </div>
    </div>
  );
};
