import React, { useState, useEffect } from 'react';
import { Complaint, ComplaintCategory, ComplaintStatus, PriorityLevel } from '../types/index.js';
import { fetchComplaints } from '../services/api.js';
import { PriorityBadge, StatusBadge } from './StatusBadge.js';
import {
  Search,
  Filter,
  PlusCircle,
  Clock,
  MapPin,
  Eye,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface CitizenMyComplaintsProps {
  citizenEmail: string;
  onSelectComplaint: (complaint: Complaint) => void;
  onNavigateSubmit: () => void;
}

export const CitizenMyComplaints: React.FC<CitizenMyComplaintsProps> = ({
  citizenEmail,
  onSelectComplaint,
  onNavigateSubmit
}) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  const loadComplaints = async () => {
    try {
      setIsLoading(true);
      const res = await fetchComplaints({
        citizenEmail,
        search: searchTerm,
        status: statusFilter,
        priority: priorityFilter,
        limit: 50
      });
      setComplaints(res.complaints);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, [citizenEmail, statusFilter, priorityFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadComplaints();
  };

  return (
    <div id="citizen-my-complaints-section" className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            My Registered Complaints
          </h1>
          <p className="text-sm text-slate-600">
            Track and monitor issues logged under your citizen profile ({citizenEmail}).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadComplaints}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            id="citizen-new-complaint-btn"
            onClick={onNavigateSubmit}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-colors shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Submit New Complaint</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by title, ID, area, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </form>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Priorities</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Complaints Grid / List */}
      {isLoading ? (
        <div className="py-16 text-center text-xs text-slate-500 space-y-2">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Loading complaints history...</p>
        </div>
      ) : complaints.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">No Complaints Found</h3>
            <p className="text-xs text-slate-500 mt-1">
              You haven't submitted any matching civic complaints yet.
            </p>
          </div>
          <button
            onClick={onNavigateSubmit}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2 rounded-xl"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Submit Your First Complaint</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {complaints.map((c) => (
            <div
              key={c.id}
              onClick={() => onSelectComplaint(c)}
              className="bg-white hover:bg-slate-50/80 rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-3.5 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    {c.id}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <PriorityBadge priority={c.priority} confidence={c.confidence} size="sm" />
                    <StatusBadge status={c.status} size="sm" />
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                  {c.title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                  {c.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>{c.location.area}</span>
                </div>
                <div className="flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
