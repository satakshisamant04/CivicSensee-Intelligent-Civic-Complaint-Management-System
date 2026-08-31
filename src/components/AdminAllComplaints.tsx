import React, { useState, useEffect } from 'react';
import { Complaint, ComplaintCategory, ComplaintStatus, PriorityLevel } from '../types/index.js';
import { fetchComplaints, updateComplaintStatusApi, deleteComplaintApi } from '../services/api.js';
import { PriorityBadge, StatusBadge } from './StatusBadge.js';
import {
  Search,
  Filter,
  Download,
  Trash2,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface AdminAllComplaintsProps {
  onSelectComplaint: (complaint: Complaint) => void;
}

export const AdminAllComplaints: React.FC<AdminAllComplaintsProps> = ({
  onSelectComplaint
}) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'createdAt' | 'priority' | 'confidence' | 'daysPending'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [inlineUpdatingId, setInlineUpdatingId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const res = await fetchComplaints({
        search,
        category: categoryFilter,
        priority: priorityFilter,
        status: statusFilter,
        sortBy,
        sortOrder,
        page,
        limit: 10
      });
      setComplaints(res.complaints);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [categoryFilter, priorityFilter, statusFilter, sortBy, sortOrder, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  const handleInlineStatusChange = async (id: string, newStatus: ComplaintStatus) => {
    try {
      setInlineUpdatingId(id);
      await updateComplaintStatusApi(id, newStatus, `Status transitioned to ${newStatus} from Table view`, 'Admin Console');
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setInlineUpdatingId(null);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to permanently delete complaint ${id}?`)) return;
    try {
      await deleteComplaintApi(id);
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const exportCSV = () => {
    const headers = ['ID', 'Title', 'Category', 'Priority', 'ML Confidence', 'Status', 'Area', 'City', 'Days Pending', 'Previous Complaints', 'Citizen', 'Created At'];
    const rows = complaints.map(c => [
      c.id,
      `"${c.title.replace(/"/g, '""')}"`,
      c.category,
      c.priority,
      `${Math.round(c.confidence * 100)}%`,
      c.status,
      `"${c.location.area}"`,
      c.location.city,
      c.daysPending,
      c.previousComplaints,
      `"${c.citizenName}"`,
      c.createdAt
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `civicsense_complaints_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const categories: ComplaintCategory[] = [
    'Streetlight', 'Garbage', 'Road/Pothole', 'Water Supply',
    'Drainage', 'Electricity', 'Public Transport', 'Traffic',
    'Sewage', 'Other'
  ];

  const statuses: ComplaintStatus[] = ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Rejected'];

  return (
    <div id="all-complaints-management-section" className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            All Civic Complaints Registry
          </h1>
          <p className="text-sm text-slate-600">
            Search, filter by ML prediction, update statuses, and dispatch municipal work orders ({total} total records).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={loadData}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors"
            title="Refresh Table"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              id="admin-search-input"
              placeholder="Search by ID, title, keyword, or area..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </form>

          {/* Category Filter */}
          <div>
            <select
              id="filter-category-select"
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Categories (10)</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              id="filter-priority-select"
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              id="filter-status-select"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Statuses</option>
              {statuses.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Sort by:</span>
            <button
              onClick={() => {
                setSortBy('createdAt');
                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
              }}
              className={`px-2 py-0.5 rounded font-medium ${sortBy === 'createdAt' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'}`}
            >
              Date {sortBy === 'createdAt' && (sortOrder === 'desc' ? '↓' : '↑')}
            </button>
            <button
              onClick={() => {
                setSortBy('priority');
                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
              }}
              className={`px-2 py-0.5 rounded font-medium ${sortBy === 'priority' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'}`}
            >
              Priority {sortBy === 'priority' && (sortOrder === 'desc' ? '↓' : '↑')}
            </button>
            <button
              onClick={() => {
                setSortBy('confidence');
                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
              }}
              className={`px-2 py-0.5 rounded font-medium ${sortBy === 'confidence' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'}`}
            >
              ML Confidence {sortBy === 'confidence' && (sortOrder === 'desc' ? '↓' : '↑')}
            </button>
            <button
              onClick={() => {
                setSortBy('daysPending');
                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
              }}
              className={`px-2 py-0.5 rounded font-medium ${sortBy === 'daysPending' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'}`}
            >
              Days Pending {sortBy === 'daysPending' && (sortOrder === 'desc' ? '↓' : '↑')}
            </button>
          </div>

          <div>
            Showing {(page - 1) * 10 + 1} - {Math.min(total, page * 10)} of {total}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center space-y-2">
            <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500">Querying database records...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-2">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No complaints matched current filters.</p>
            <p className="text-xs text-slate-400">Try adjusting search term or clearing priority filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Complaint ID</th>
                  <th className="py-3.5 px-4">Title & Details</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">ML Priority</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Status Dispatch</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150">
                {complaints.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => onSelectComplaint(c)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700 whitespace-nowrap">
                      {c.id}
                    </td>

                    <td className="py-3.5 px-4 max-w-xs sm:max-w-sm">
                      <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {c.title}
                      </div>
                      <div className="text-slate-500 text-[11px] line-clamp-1 mt-0.5">
                        {c.description}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {new Date(c.createdAt).toLocaleDateString()} • {c.daysPending}d pending • {c.previousComplaints} prior
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {c.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <PriorityBadge priority={c.priority} confidence={c.confidence} size="sm" />
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-700">
                      <div className="font-medium">{c.location.area}</div>
                      <div className="text-[10px] text-slate-400">{c.location.city}</div>
                    </td>

                    <td
                      className="py-3.5 px-4 whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <select
                        value={c.status}
                        disabled={inlineUpdatingId === c.id}
                        onChange={(e) => handleInlineStatusChange(c.id, e.target.value as ComplaintStatus)}
                        className={`text-xs font-semibold rounded-lg px-2.5 py-1 border transition-colors ${
                          c.status === 'Resolved'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : c.status === 'In Progress'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : c.status === 'Assigned'
                            ? 'bg-purple-50 text-purple-800 border-purple-300'
                            : 'bg-slate-100 text-slate-800 border-slate-300'
                        }`}
                      >
                        {statuses.map(st => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </td>

                    <td
                      className="py-3.5 px-4 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectComplaint(c)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Inspect Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(c.id, e)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Complaint"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div>
            Page <strong className="text-slate-900">{page}</strong> of <strong className="text-slate-900">{totalPages}</strong>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
