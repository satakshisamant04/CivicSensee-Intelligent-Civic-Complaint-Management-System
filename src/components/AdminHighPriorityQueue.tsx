import React, { useState, useEffect } from 'react';
import { Complaint, ComplaintStatus } from '../types/index.js';
import { fetchComplaints, updateComplaintStatusApi } from '../services/api.js';
import { PriorityBadge, StatusBadge } from './StatusBadge.js';
import {
  ShieldAlert,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Building
} from 'lucide-react';

interface AdminHighPriorityQueueProps {
  onSelectComplaint: (complaint: Complaint) => void;
}

export const AdminHighPriorityQueue: React.FC<AdminHighPriorityQueueProps> = ({
  onSelectComplaint
}) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadHighPriority = async () => {
    try {
      setIsLoading(true);
      const res = await fetchComplaints({ priority: 'HIGH', limit: 50 });
      setComplaints(res.complaints);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHighPriority();
  }, []);

  const handleQuickStatusUpdate = async (id: string, newStatus: ComplaintStatus, note: string) => {
    try {
      setUpdatingId(id);
      await updateComplaintStatusApi(id, newStatus, note, 'Supervisor Triage Console');
      await loadHighPriority();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div id="high-priority-triage-section" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-red-200 dark:border-red-900">
              URGENT HAZARD QUEUE
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            High Priority Triage & Rapid Dispatch
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Civic complaints classified as HIGH priority by the machine learning engine requiring immediate municipal authority intervention.
          </p>
        </div>

        <button
          onClick={loadHighPriority}
          className="inline-flex items-center gap-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors shadow-2xs self-start cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue ({complaints.length})</span>
        </button>
      </div>

      {/* Triage Cards Stream */}
      {isLoading ? (
        <div className="py-20 text-center space-y-2">
          <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Filtering high-priority complaints...</p>
        </div>
      ) : complaints.length === 0 ? (
        <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3 transition-colors">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Queue is Clear!</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            There are currently no unresolved High Priority complaints waiting for triage.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map((c) => (
            <div
              key={c.id}
              className="bg-white dark:bg-slate-900/90 rounded-2xl border border-red-200/80 dark:border-red-900/60 shadow-xs hover:shadow-md transition-all p-5 sm:p-6 space-y-4 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-red-600 dark:bg-red-500" />

              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-red-800 dark:text-red-300 bg-red-50 dark:bg-red-950/80 px-2.5 py-0.5 rounded border border-red-200 dark:border-red-900">
                      {c.id}
                    </span>
                    <PriorityBadge priority="HIGH" confidence={c.confidence} size="sm" />
                    <StatusBadge status={c.status} size="sm" />
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Category: <strong className="text-slate-900 dark:text-white">{c.category}</strong>
                    </span>
                  </div>

                  <h3
                    onClick={() => onSelectComplaint(c)}
                    className="text-base sm:text-lg font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                  >
                    {c.title}
                  </h3>
                </div>

                <button
                  onClick={() => onSelectComplaint(c)}
                  className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold self-start bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  <span>Full Inspector View</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Description Quote */}
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                "{c.description}"
              </p>

              {/* Factors & Explainability Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                    <span>Why did ML flag this as HIGH Priority?</span>
                  </div>
                  <ul className="space-y-1 text-slate-600 dark:text-slate-300">
                    {c.explainability.primaryDrivers.slice(0, 2).map((driver, idx) => (
                      <li key={idx} className="flex items-center gap-1.5 bg-red-50/50 dark:bg-red-950/40 px-2 py-1 rounded border border-red-100 dark:border-red-900/40">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 dark:bg-red-400 shrink-0" />
                        <span className="font-medium text-red-950 dark:text-red-200">{driver}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-150 dark:border-slate-700 flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{c.location.area}</div>
                      <div className="text-slate-500 dark:text-slate-400 text-[10px]">{c.location.city}</div>
                    </div>
                  </div>

                  <div className="p-2 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-150 dark:border-slate-700 flex items-start gap-2">
                    <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{c.daysPending} days pending</div>
                      <div className="text-slate-500 dark:text-slate-400 text-[10px]">{c.previousComplaints} prior reports</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons Bar */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                  <Building className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  <span>Assigned: <strong className="text-slate-700 dark:text-slate-300">{c.assignedDepartment}</strong></span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {c.status !== 'Assigned' && c.status !== 'In Progress' && c.status !== 'Resolved' && (
                    <button
                      disabled={updatingId === c.id}
                      onClick={() => handleQuickStatusUpdate(c.id, 'Assigned', 'Dispatched Quick Response Field Crew')}
                      className="inline-flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-2xs"
                    >
                      <Send className="w-3 h-3" />
                      <span>Dispatch Field Crew</span>
                    </button>
                  )}

                  {c.status === 'Assigned' && (
                    <button
                      disabled={updatingId === c.id}
                      onClick={() => handleQuickStatusUpdate(c.id, 'In Progress', 'Crew on site conducting emergency repairs')}
                      className="inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-2xs"
                    >
                      <Clock className="w-3 h-3" />
                      <span>Mark In Progress</span>
                    </button>
                  )}

                  {c.status !== 'Resolved' && (
                    <button
                      disabled={updatingId === c.id}
                      onClick={() => handleQuickStatusUpdate(c.id, 'Resolved', 'Emergency hazard mitigated and tested safe')}
                      className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-2xs"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Mark Resolved</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
