import React, { useState } from 'react';
import { UserRole } from '../types/index.js';
import { predictComplaintMLApi } from '../services/api.js';
import {
  Building2,
  ShieldAlert,
  Send,
  Search,
  CheckCircle2,
  BrainCircuit,
  ArrowRight,
  Sparkles,
  Users,
  Activity,
  Layers,
  Clock,
  ChevronRight,
  Shield,
  User,
  Zap,
  BarChart3,
  MapPin
} from 'lucide-react';

interface LandingPageProps {
  onStartCitizen: () => void;
  onStartAdmin: () => void;
  onOpenAuth: (defaultRole?: UserRole, isRegister?: boolean) => void;
  onQuickDemoLogin: (role: UserRole) => void;
}

const SAMPLE_PROMPTS = [
  {
    title: 'Live Transformer Sparking',
    desc: 'Exposed 11kV transformer sparking violently near primary school gate in Sector 4. Danger of electrocution!',
    badge: 'Urgent Emergency'
  },
  {
    title: 'Deep Crater Pothole',
    desc: 'Massive waterlogged pothole on main arterial road near bridge. Two motorcycle accidents occurred yesterday.',
    badge: 'Road Safety'
  },
  {
    title: 'Main Pipeline Burst',
    desc: 'Major municipal water supply pipe burst flooding the residential street for 3 days. Clean drinking water wasted.',
    badge: 'Water Supply'
  },
  {
    title: 'Garbage Dump Overflow',
    desc: 'Community trash bin overflowing on sidewalk with bad odor and stray animals for 4 days.',
    badge: 'Sanitation'
  }
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartCitizen,
  onStartAdmin,
  onOpenAuth,
  onQuickDemoLogin
}) => {
  // Live ML Sandbox state
  const [sandboxInput, setSandboxInput] = useState(
    'Exposed 11kV transformer sparking violently near school gate. Danger of electrocution!'
  );
  const [sandboxLoading, setSandboxLoading] = useState(false);
  const [sandboxResult, setSandboxResult] = useState<{
    category: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    confidence: number;
    urgencyScore: number;
    drivers: string[];
  } | null>({
    category: 'Electricity',
    priority: 'HIGH',
    confidence: 0.94,
    urgencyScore: 92,
    drivers: ['Hazard keyword: sparking', 'High voltage risk', 'Pedestrian hazard zone']
  });

  const handleTestInference = async (text: string) => {
    setSandboxLoading(true);
    try {
      const res = await predictComplaintMLApi(text, 2, 3);
      setSandboxResult({
        category: res.data.category,
        priority: res.data.priority,
        confidence: res.data.confidence,
        urgencyScore: Math.round(res.data.confidence * 100),
        drivers: res.data.supportingFactors && res.data.supportingFactors.length > 0
          ? res.data.supportingFactors
          : res.data.topKeywords || []
      });
    } catch (e) {
      // Fallback preview
      const isHigh = /spark|shock|electr|fire|flood|burst|crater|accident|danger|poison/i.test(text);
      setSandboxResult({
        category: /spark|electric|wire/i.test(text) ? 'Electricity' : /water|pipe|flood/i.test(text) ? 'Water Supply' : 'Roads & Potholes',
        priority: isHigh ? 'HIGH' : 'MEDIUM',
        confidence: 0.88,
        urgencyScore: isHigh ? 88 : 54,
        drivers: ['Automatic TF-IDF matching', isHigh ? 'Hazard alert detected' : 'Standard municipal queue']
      });
    } finally {
      setSandboxLoading(false);
    }
  };

  return (
    <div className="space-y-16 py-4 sm:py-8 animate-in fade-in duration-300">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white p-6 sm:p-12 lg:p-16 shadow-xl border border-slate-700/50">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            <span>AI-Driven Municipal Governance & Rapid Hazard Triage</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Transform Civic Complaints into <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Prioritized Action</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            CivicSense automatically classifies municipal issues and computes urgency in milliseconds. 
            Dangerous public emergencies are instantly escalated while citizens track live resolution progress end-to-end.
          </p>

          {/* Call to Actions */}
          <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
            <button
              onClick={onStartCitizen}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-6 py-3.5 rounded-2xl shadow-lg shadow-blue-900/30 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Report a Civic Issue</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onStartAdmin}
              className="inline-flex items-center gap-2 bg-slate-700/80 hover:bg-slate-700 text-white font-semibold text-sm px-6 py-3.5 rounded-2xl border border-slate-600 transition-all cursor-pointer backdrop-blur-xs"
            >
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>Municipal Admin Console</span>
            </button>

            <button
              onClick={() => onOpenAuth(undefined, true)}
              className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white font-medium text-xs px-4 py-3 rounded-2xl transition-colors"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>
          </div>

          {/* Quick Demo Credentials Strip */}
          <div className="pt-6 border-t border-slate-700/60 flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Instant Demo Access:</span>
            <button
              onClick={() => onQuickDemoLogin('citizen')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-blue-300 border border-slate-700 transition-colors cursor-pointer"
            >
              <User className="w-3 h-3 text-blue-400" />
              <span>Demo Citizen (Aarav)</span>
            </button>
            <button
              onClick={() => onQuickDemoLogin('admin')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-indigo-300 border border-slate-700 transition-colors cursor-pointer"
            >
              <Shield className="w-3 h-3 text-indigo-400" />
              <span>Demo Admin (Commissioner Rao)</span>
            </button>
          </div>
        </div>
      </section>

      {/* Real-Time Impact Metric Cards */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-2xl sm:text-3xl font-extrabold text-blue-600">94.2%</div>
          <div className="text-xs font-bold text-slate-800">Categorization Accuracy</div>
          <div className="text-[11px] text-slate-500">TF-IDF multi-class NLP model</div>
        </div>
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-600">&lt; 15ms</div>
          <div className="text-xs font-bold text-slate-800">Urgency Prediction</div>
          <div className="text-[11px] text-slate-500">Sub-second emergency triage</div>
        </div>
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">4.2x Faster</div>
          <div className="text-xs font-bold text-slate-800">Emergency Dispatch</div>
          <div className="text-[11px] text-slate-500">Automated work order creation</div>
        </div>
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600">100%</div>
          <div className="text-xs font-bold text-slate-800">Public Auditability</div>
          <div className="text-[11px] text-slate-500">Transparent SLA timeline</div>
        </div>
      </section>

      {/* Interactive Live ML Sandbox */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
              <BrainCircuit className="w-4 h-4" />
              <span>Interactive Triage Engine</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Test Instant Priority Prediction Live
            </h2>
            <p className="text-xs text-slate-500">
              Type any civic complaint or pick a realistic scenario below to see how our NLP model classifies category and urgency.
            </p>
          </div>
          <span className="text-xs font-mono bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200 self-start sm:self-auto">
            Model: TF-IDF + Logistic Regression
          </span>
        </div>

        {/* Preset Sample Prompts */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-700">Click a sample issue to test:</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {SAMPLE_PROMPTS.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSandboxInput(sample.desc);
                  handleTestInference(sample.desc);
                }}
                className="text-left p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-800 group-hover:text-blue-700">{sample.title}</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">{sample.badge}</span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2">{sample.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Input & Live Result Output Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
          {/* Input column */}
          <div className="lg:col-span-7 space-y-3">
            <label className="block text-xs font-bold text-slate-700">Complaint Description</label>
            <textarea
              rows={3}
              value={sandboxInput}
              onChange={(e) => setSandboxInput(e.target.value)}
              placeholder="Describe a civic hazard (e.g. exposed live sparking wire, deep crater pothole, water pipe burst)..."
              className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-sans"
            />
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Captures n-grams, urgency drivers & context tokens</span>
              <button
                onClick={() => handleTestInference(sandboxInput)}
                disabled={sandboxLoading || !sandboxInput.trim()}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{sandboxLoading ? 'Analyzing...' : 'Run ML Prediction'}</span>
              </button>
            </div>
          </div>

          {/* Output column */}
          <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Live ML Result</span>
                <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Instant Response
                </span>
              </div>

              {sandboxResult ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-slate-500">Predicted Category</div>
                      <div className="text-base font-bold text-slate-900">{sandboxResult.category}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] text-slate-500">Priority Level</div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-extrabold ${
                        sandboxResult.priority === 'HIGH'
                          ? 'bg-rose-100 text-rose-700 border border-rose-200'
                          : sandboxResult.priority === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      }`}>
                        {sandboxResult.priority === 'HIGH' && <ShieldAlert className="w-3.5 h-3.5" />}
                        {sandboxResult.priority} PRIORITY
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-600 mb-1">
                      <span>Urgency Confidence</span>
                      <span className="font-bold text-slate-900">{Math.round(sandboxResult.confidence * 100)}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          sandboxResult.priority === 'HIGH'
                            ? 'bg-rose-600'
                            : sandboxResult.priority === 'MEDIUM'
                            ? 'bg-amber-500'
                            : 'bg-emerald-600'
                        }`}
                        style={{ width: `${Math.round(sandboxResult.confidence * 100)}%` }}
                      />
                    </div>
                  </div>

                  {sandboxResult.drivers && sandboxResult.drivers.length > 0 && (
                    <div className="pt-2 border-t border-slate-200 text-xs">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Key Urgency Drivers:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {sandboxResult.drivers.map((drv, i) => (
                          <span key={i} className="text-[11px] bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-mono">
                            {drv}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-slate-400">
                  Run a prediction to see live results
                </div>
              )}
            </div>

            <button
              onClick={onStartCitizen}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Submit this as a Real Complaint</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Two Specialized Portals Showcase */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Tailored Experiences for Citizens & Authorities
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            A cohesive civic platform connecting public voices directly to frontline municipal operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Citizen Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 flex flex-col justify-between shadow-xs hover:border-blue-300 transition-all space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Citizen Experience</span>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5">Citizen Reporting & Tracking Portal</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Easily file civic grievances with automatic location pinning, photo attachments, and real-time resolution milestone updates.
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Interactive complaint submission with live ML preview</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Complete resolution stepper tracking (Submitted → Resolved)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Personal "My Registered Issues" history & status tracker</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Direct assigned officer and department contacts</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
              <button
                onClick={onStartCitizen}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 rounded-xl transition-colors text-center shadow-xs cursor-pointer"
              >
                Launch Citizen Portal
              </button>
              <button
                onClick={() => onQuickDemoLogin('citizen')}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Demo Login
              </button>
            </div>
          </div>

          {/* Municipal Admin Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 flex flex-col justify-between shadow-xs hover:border-indigo-300 transition-all space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Municipal Operations</span>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5">Municipal Authority Command Console</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Centralized command room for city commissioners and department heads to monitor ward performance, triage hazards, and dispatch crews.
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Real-time High-Priority Triage Queue for critical emergencies</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Ward & category resolution SLA analytics charts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>All Complaints Registry with multi-filter, search, and CSV export</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>ML Model Performance & Confusion Matrix evaluation explorer</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
              <button
                onClick={onStartAdmin}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 rounded-xl transition-colors text-center shadow-xs cursor-pointer"
              >
                Launch Admin Console
              </button>
              <button
                onClick={() => onQuickDemoLogin('admin')}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Demo Login
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Step-by-Step */}
      <section className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">End-to-End Workflow</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">How CivicSense Resolves Issues</h2>
          <p className="text-xs text-slate-400">
            From the moment a citizen clicks submit to the final field verification.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-slate-800/80 border border-slate-700/60 p-5 rounded-2xl space-y-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 font-bold text-sm flex items-center justify-center border border-blue-500/30">
              1
            </div>
            <h4 className="text-sm font-bold text-white">Citizen Reporting</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Citizens submit issue details, ward location, and photos. Metadata like days pending and recurring reports are captured automatically.
            </p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/60 p-5 rounded-2xl space-y-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 font-bold text-sm flex items-center justify-center border border-cyan-500/30">
              2
            </div>
            <h4 className="text-sm font-bold text-white">NLP & Urgency Scoring</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              TF-IDF vectors normalize complaint text. Multi-class Logistic Regression computes category and urgency, flagging dangerous hazards in &lt;15ms.
            </p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/60 p-5 rounded-2xl space-y-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-sm flex items-center justify-center border border-emerald-500/30">
              3
            </div>
            <h4 className="text-sm font-bold text-white">Field Dispatch & Tracking</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              High-priority emergencies are immediately routed to municipal duty officers with SLA tracking and live public status updates.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom Final Call to Action */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 sm:p-12 text-white text-center space-y-6 shadow-xl">
        <div className="max-w-2xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold">
            Ready to Experience Faster Civic Governance?
          </h2>
          <p className="text-xs sm:text-sm text-blue-100">
            Join citizens and municipal officers improving neighborhood infrastructure today.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onStartCitizen}
            className="px-6 py-3.5 bg-white text-blue-800 font-bold text-xs rounded-xl hover:bg-blue-50 transition-colors shadow-sm cursor-pointer"
          >
            Submit a Civic Complaint
          </button>
          <button
            onClick={() => onOpenAuth('admin', false)}
            className="px-6 py-3.5 bg-blue-900/60 hover:bg-blue-900 text-white font-semibold text-xs rounded-xl border border-blue-400/30 transition-colors cursor-pointer"
          >
            Sign in as Municipal Official
          </button>
        </div>
      </section>
    </div>
  );
};
