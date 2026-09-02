import React, { useState, useEffect } from 'react';
import { Complaint, ComplaintStatus } from '../types/index.js';
import { fetchComplaintById, fetchComplaints } from '../services/api.js';
import { PriorityBadge, StatusBadge } from './StatusBadge.js';
import { ExplainabilityCard } from './ExplainabilityCard.js';
import {
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  Building,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

interface TrackComplaintViewProps {
  initialComplaintId?: string;
  onSelectComplaint?: (complaint: Complaint) => void;
}

const STATUS_STEPS: { status: ComplaintStatus; label: string; desc: string }[] = [
  { status: 'Submitted', label: '1. Submitted', desc: 'Complaint registered and categorized by ML Engine' },
  { status: 'Under Review', label: '2. Under Review', desc: 'Triage officer verified severity & urgency' },
  { status: 'Assigned', label: '3. Assigned', desc: 'Dispatched to specialized municipal department' },
  { status: 'In Progress', label: '4. In Progress', desc: 'Field crew operating on site' },
  { status: 'Resolved', label: '5. Resolved', desc: 'Maintenance completed and verified' }
];

export const TrackComplaintView: React.FC<TrackComplaintViewProps> = ({
  initialComplaintId = '',
  onSelectComplaint
}) => {
  const [searchId, setSearchId] = useState(initialComplaintId);
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);

  const handleSearch = async (idToSearch?: string) => {
    const targetId = (idToSearch || searchId).trim();
    if (!targetId) {
      setErrorMsg('Please enter a Complaint ID (e.g. CIV-2026-00124)');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMsg('');
      const res = await fetchComplaintById(targetId);
      setComplaint(res.complaint);
    } catch (err: any) {
      setComplaint(null);
      setErrorMsg(err.message || `No complaint found with ID '${targetId}'.`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialComplaintId) {
      setSearchId(initialComplaintId);
      handleSearch(initialComplaintId);
    }
    // Fetch a few sample IDs for quick clicks
    fetchComplaints({ limit: 4 })
      .then(res => setRecentComplaints(res.complaints))
      .catch(() => {});
  }, [initialComplaintId]);

  const getStepStatus = (stepIndex: number, currentStatus: ComplaintStatus) => {
    const statusOrder: ComplaintStatus[] = ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved'];
    const currentIndex = statusOrder.indexOf(currentStatus);

    if (currentStatus === 'Rejected') {
      return stepIndex === 0 ? 'completed' : 'rejected';
    }

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div id="track-complaint-section" className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Track Complaint Status
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Enter your unique Complaint ID to view live operational progress, assigned field department, and ML priority evaluation.
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="bg-white dark:bg-slate-900/90 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex flex-col sm:flex-row gap-2.5"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              id="track-complaint-search-input"
              placeholder="Enter Complaint ID (e.g. CIV-2026-00124)"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="w-full pl-10 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl py-2.5 px-3.5 text-sm text-slate-900 dark:text-slate-100 font-mono placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all uppercase"
            />
          </div>
          <button
            type="submit"
            id="track-search-btn"
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
          >
            {isLoading ? 'Searching...' : 'Track Status'}
          </button>
        </form>

        {/* Quick Sample IDs */}
        {recentComplaints.length > 0 && !complaint && (
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-500 dark:text-slate-400">
            <span>Quick sample IDs to test:</span>
            {recentComplaints.map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setSearchId(c.id);
                  handleSearch(c.id);
                }}
                className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-700 dark:hover:text-blue-400 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded cursor-pointer transition-colors"
              >
                {c.id} ({c.category})
              </button>
            ))}
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs p-4 rounded-xl flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Result Display */}
      {complaint && (
        <div id="tracked-complaint-result" className="space-y-6">
          {/* Main Status Header Card */}
          <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-5 transition-colors">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-2.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                    {complaint.id}
                  </span>
                  <PriorityBadge priority={complaint.priority} confidence={complaint.confidence} />
                  <StatusBadge status={complaint.status} />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {complaint.title}
                </h2>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 dark:text-slate-500 block">Filed on</span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 font-mono">
                  {new Date(complaint.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>

            {/* Stepper Progress Bar */}
            <div className="space-y-3 pt-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Resolution Workflow Stage
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 relative">
                {STATUS_STEPS.map((step, idx) => {
                  const state = getStepStatus(idx, complaint.status);
                  return (
                    <div
                      key={step.status}
                      className={`p-3 rounded-xl border transition-all ${
                        state === 'completed'
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300'
                          : state === 'current'
                          ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-400 dark:border-blue-700 text-blue-900 dark:text-blue-300 ring-2 ring-blue-500/20'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs mb-1">
                        {state === 'completed' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        ) : state === 'current' ? (
                          <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-spin" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-[9px]">
                            {idx + 1}
                          </div>
                        )}
                        <span>{step.label}</span>
                      </div>
                      <p className="text-[11px] leading-tight text-slate-600 dark:text-slate-400 opacity-90">
                        {step.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Summary Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">{complaint.location.area}, {complaint.location.city}</div>
                  <div className="text-slate-500 dark:text-slate-400 text-[11px]">{complaint.location.landmark || 'No specific landmark'}</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <Building className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">{complaint.assignedDepartment}</div>
                  <div className="text-slate-500 dark:text-slate-400 text-[11px]">Officer: {complaint.assignedOfficer || 'Pending Field Dispatch'}</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">{complaint.category} Department</div>
                  <div className="text-slate-500 dark:text-slate-400 text-[11px]">ML Confidence: {Math.round(complaint.confidence * 100)}%</div>
                </div>
              </div>
            </div>
          </div>

          {/* 2-Column: Explainability & Detailed Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: ML Intelligence Rationale */}
            <div>
              <ExplainabilityCard
                explainability={complaint.explainability}
                priority={complaint.priority}
                category={complaint.category}
                daysPending={complaint.daysPending}
                previousComplaints={complaint.previousComplaints}
              />
            </div>

            {/* Right: Operational Event Timeline */}
            <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4 transition-colors">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span>Operational Activity Log ({complaint.timeline.length} events)</span>
              </h3>

              <div className="space-y-3 relative pl-4 border-l-2 border-slate-200 dark:border-slate-700 ml-2">
                {complaint.timeline.map((event, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full bg-white dark:bg-slate-900 border-2 border-blue-600 dark:border-blue-400" />
                    <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs space-y-1">
                      <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200">
                        <span className="text-blue-700 dark:text-blue-400">{event.status}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{event.note}</p>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500">Officer / Action: {event.updatedBy}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
