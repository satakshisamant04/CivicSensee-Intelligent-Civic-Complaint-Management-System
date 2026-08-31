import React, { useState, useEffect } from 'react';
import { AnalyticsSummary, Complaint } from '../types/index.js';
import { fetchAnalyticsApi, fetchComplaints } from '../services/api.js';
import { PriorityBadge, StatusBadge } from './StatusBadge.js';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
  TrendingUp,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface AdminOverviewProps {
  onNavigateTab: (tab: string) => void;
  onSelectComplaint: (complaint: Complaint) => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  onNavigateTab,
  onSelectComplaint
}) => {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [highPriorityList, setHighPriorityList] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [analyticsRes, complaintsRes] = await Promise.all([
        fetchAnalyticsApi(),
        fetchComplaints({ priority: 'HIGH', limit: 5 })
      ]);
      setAnalytics(analyticsRes.analytics);
      setHighPriorityList(complaintsRes.complaints);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (isLoading || !analytics) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Aggregating municipal intelligence metrics...</p>
      </div>
    );
  }

  const priorityPieData = analytics.byPriority.map(p => ({
    name: p.name,
    value: p.count,
    color: p.color
  }));

  return (
    <div id="admin-overview-dashboard" className="space-y-6">
      {/* Header & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Municipal Command & Triage Dashboard
          </h1>
          <p className="text-sm text-slate-600">
            Real-time civic intelligence, machine learning priority dispatch, and municipal resolution metrics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-mono bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
            Live Database Sync
          </span>
          <button
            onClick={loadData}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors"
            title="Refresh Metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Urgent Triage Notification Banner */}
      {analytics.highPriority > 0 && (
        <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-2xl p-4 sm:p-5 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
              <ShieldAlert className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">
                {analytics.highPriority} Urgent High-Priority Civic Hazards Detected
              </h3>
              <p className="text-xs text-red-100">
                Critical complaints (power hazards, pipe bursts, road craters) require prioritized work-order dispatch.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('high-priority')}
            className="shrink-0 bg-white text-red-700 hover:bg-red-50 font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>Open High-Priority Triage Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[11px] font-bold uppercase text-slate-400">Total Registered</div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">{analytics.totalComplaints}</div>
          <div className="text-[11px] text-slate-500">Across all wards</div>
        </div>

        <div className="bg-red-50/70 p-4 rounded-2xl border border-red-200 shadow-xs space-y-1">
          <div className="text-[11px] font-bold uppercase text-red-700">High Priority</div>
          <div className="text-2xl font-extrabold text-red-700 font-mono">{analytics.highPriority}</div>
          <div className="text-[11px] text-red-600 font-medium">⚡ Requires urgent dispatch</div>
        </div>

        <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 shadow-xs space-y-1">
          <div className="text-[11px] font-bold uppercase text-amber-700">Medium Priority</div>
          <div className="text-2xl font-extrabold text-amber-700 font-mono">{analytics.mediumPriority}</div>
          <div className="text-[11px] text-amber-600">Standard scheduled queue</div>
        </div>

        <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 shadow-xs space-y-1">
          <div className="text-[11px] font-bold uppercase text-emerald-700">Low Priority</div>
          <div className="text-2xl font-extrabold text-emerald-700 font-mono">{analytics.lowPriority}</div>
          <div className="text-[11px] text-emerald-600">Routine maintenance</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[11px] font-bold uppercase text-slate-400">Resolved</div>
          <div className="text-2xl font-extrabold text-emerald-600 font-mono">{analytics.resolved}</div>
          <div className="text-[11px] text-slate-500">
            {analytics.totalComplaints ? Math.round((analytics.resolved / analytics.totalComplaints) * 100) : 0}% completion
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[11px] font-bold uppercase text-slate-400">Pending Triage</div>
          <div className="text-2xl font-extrabold text-blue-600 font-mono">{analytics.pending}</div>
          <div className="text-[11px] text-slate-500">Avg {analytics.avgResolutionDays} days resolution</div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Complaints by Category Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Complaints by Civic Category</h3>
              <p className="text-xs text-slate-500">Distribution and high-priority breakdown per municipal department</p>
            </div>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-mono">
              10 Categories
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.byCategory} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <XAxis dataKey="name" angle={-25} textAnchor="end" interval={0} tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '10px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="count" name="Total Complaints" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="highPriorityCount" name="High Priority" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 1 Col: Priority Distribution Donut */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">ML Priority Distribution</h3>
            <p className="text-xs text-slate-500">Urgency recommendation split</p>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {priorityPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 border-t border-slate-100 pt-3 text-xs">
            {analytics.byPriority.map(p => (
              <div key={p.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="font-medium text-slate-700">{p.name}</span>
                </div>
                <div className="font-mono text-slate-900 font-bold">
                  {p.count} <span className="text-slate-400 font-normal">({p.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2nd Row: 7-Day Inflow vs Resolution & High Priority Fast Triage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trend */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">7-Day Complaint Inflow vs Resolution</h3>
              <p className="text-xs text-slate-500">Daily registration rate compared with field completions</p>
            </div>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSubmitted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '10px', color: '#fff', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area type="monotone" dataKey="submitted" name="New Submissions" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSubmitted)" />
                <Area type="monotone" dataKey="resolved" name="Field Resolutions" stroke="#10b981" fillOpacity={1} fill="url(#colorResolved)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Urgent High Priority Queue Preview */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>Urgent High-Priority Stream</span>
              </h3>
              <p className="text-xs text-slate-500">Requires rapid municipal officer review</p>
            </div>
            <button
              onClick={() => onNavigateTab('high-priority')}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto max-h-60">
            {highPriorityList.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No outstanding high-priority complaints in queue.
              </div>
            ) : (
              highPriorityList.map(c => (
                <div
                  key={c.id}
                  onClick={() => onSelectComplaint(c)}
                  className="p-3 bg-red-50/40 hover:bg-red-50 border border-red-150 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all group"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-red-800">{c.id}</span>
                      <span className="text-[10px] font-bold bg-white text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                        {c.category}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium truncate">{c.location.area}</span>
                    </div>
                    <div className="text-xs font-semibold text-slate-900 truncate group-hover:text-red-700 transition-colors">
                      {c.title}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <StatusBadge status={c.status} size="sm" />
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-red-600" />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Powered by Scikit-learn TF-IDF Engine</span>
            <button
              onClick={() => onNavigateTab('model-eval')}
              className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Inspect ML Model Performance</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
