import React, { useState } from 'react';
import { Complaint, ComplaintStatus } from '../types/index.js';
import { PriorityBadge, StatusBadge } from './StatusBadge.js';
import { ExplainabilityCard } from './ExplainabilityCard.js';
import {
  X,
  MapPin,
  Calendar,
  User,
  Phone,
  Mail,
  Shield,
  Building,
  CheckCircle2,
  Clock,
  Send,
  AlertCircle
} from 'lucide-react';

interface ComplaintDetailsModalProps {
  complaint: Complaint | null;
  onClose: () => void;
  onUpdateStatus?: (id: string, status: ComplaintStatus, note?: string) => Promise<void>;
  isAdmin?: boolean;
}

export const ComplaintDetailsModal: React.FC<ComplaintDetailsModalProps> = ({
  complaint,
  onClose,
  onUpdateStatus,
  isAdmin = false
}) => {
  if (!complaint) return null;

  const [selectedStatus, setSelectedStatus] = useState<ComplaintStatus>(complaint.status);
  const [updateNote, setUpdateNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleStatusChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateStatus) return;

    try {
      setIsUpdating(true);
      setErrorMsg('');
      await onUpdateStatus(complaint.id, selectedStatus, updateNote.trim() || undefined);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
      setUpdateNote('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const statuses: ComplaintStatus[] = ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Rejected'];

  return (
    <div
      id="complaint-details-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="complaint-details-modal-card"
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 transition-colors"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/50">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-200/80 dark:bg-slate-800 px-2.5 py-0.5 rounded border border-slate-300 dark:border-slate-700">
                {complaint.id}
              </span>
              <PriorityBadge priority={complaint.priority} confidence={complaint.confidence} />
              <StatusBadge status={complaint.status} />
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Category: <strong className="text-slate-800 dark:text-slate-200">{complaint.category}</strong>
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
              {complaint.title}
            </h2>
          </div>
          <button
            id="close-modal-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Description */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Citizen Description
            </h3>
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
              "{complaint.description}"
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-150 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
              <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
              <div>
                <div className="font-semibold text-slate-900 dark:text-white">{complaint.location.area}, {complaint.location.city}</div>
                {complaint.location.landmark && (
                  <div className="text-slate-500 dark:text-slate-400 text-[11px]">Landmark: {complaint.location.landmark}</div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-150 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
              <Calendar className="w-4 h-4 text-blue-500 shrink-0" />
              <div>
                <div className="font-semibold text-slate-900 dark:text-white">
                  {new Date(complaint.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Existed {complaint.daysPending} days • {complaint.previousComplaints} prior reports
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-150 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
              <User className="w-4 h-4 text-indigo-500 shrink-0" />
              <div>
                <div className="font-semibold text-slate-900 dark:text-white">{complaint.citizenName}</div>
                <div className="text-slate-500 dark:text-slate-400 text-[11px]">{complaint.citizenEmail}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-150 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
              <Building className="w-4 h-4 text-emerald-500 shrink-0" />
              <div>
                <div className="font-semibold text-slate-900 dark:text-white">{complaint.assignedDepartment || 'General Municipal Works'}</div>
                <div className="text-slate-500 dark:text-slate-400 text-[11px]">Assigned: {complaint.assignedOfficer || 'Pending Field Dispatch'}</div>
              </div>
            </div>
          </div>

          {/* ML Explainability Card */}
          <ExplainabilityCard
            explainability={complaint.explainability}
            priority={complaint.priority}
            category={complaint.category}
            daysPending={complaint.daysPending}
            previousComplaints={complaint.previousComplaints}
          />

          {/* Admin Status Management Panel */}
          {isAdmin && onUpdateStatus && (
            <div className="bg-slate-900 text-white rounded-xl p-4 sm:p-5 space-y-4 border border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-400" />
                  <h4 className="text-sm font-bold">Municipal Status Action & Dispatch</h4>
                </div>
                {updateSuccess && (
                  <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium animate-pulse">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Updated Successfully
                  </span>
                )}
              </div>

              {errorMsg && (
                <div className="text-xs text-rose-300 bg-rose-950/60 border border-rose-800 p-2 rounded flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" /> {errorMsg}
                </div>
              )}

              <form onSubmit={handleStatusChange} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-300 font-medium mb-1">
                      Update Operational Status
                    </label>
                    <select
                      id="status-select-input"
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value as ComplaintStatus)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    >
                      {statuses.map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 font-medium mb-1">
                      Official Note / Dispatch Log
                    </label>
                    <input
                      type="text"
                      id="status-note-input"
                      placeholder="e.g. Dispatched Repair Crew Unit #4"
                      value={updateNote}
                      onChange={(e) => setUpdateNote(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    id="save-status-btn"
                    disabled={isUpdating}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isUpdating ? 'Saving...' : 'Apply Status Update'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Timeline */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Complaint Progress Timeline ({complaint.timeline.length} events)</span>
            </h3>

            <div className="space-y-3 relative pl-4 border-l-2 border-slate-200 dark:border-slate-700 ml-2">
              {complaint.timeline.map((event, idx) => (
                <div key={idx} className="relative group">
                  <div className="absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full bg-white dark:bg-slate-900 border-2 border-blue-600" />
                  <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-xs space-y-1">
                    <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200">
                      <span className="text-blue-700 dark:text-blue-400">{event.status}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                        {new Date(event.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300">{event.note}</p>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500">By: {event.updatedBy}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Citizen ID: {complaint.citizenEmail}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
