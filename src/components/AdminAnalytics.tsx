import React, { useState, useEffect } from 'react';
import { AnalyticsSummary } from '../types/index.js';
import { fetchAnalyticsApi } from '../services/api.js';
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
  LineChart,
  Line
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Award,
  Clock,
  ShieldCheck,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

export const AdminAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const res = await fetchAnalyticsApi();
      setAnalytics(res.analytics);
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
        <p className="text-xs text-slate-500 font-medium">Computing analytics data...</p>
      </div>
    );
  }

  const categoryResolutionData = analytics.categoryResolutionRate.map(item => ({
    name: item.category,
    rate: item.rate,
    total: item.total
  }));

  return (
    <div id="analytics-statistics-section" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Municipal Operations & Analytics
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Historical performance indicators, category SLA resolution rates, and civic trend analysis.
          </p>
        </div>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors shadow-2xs self-start cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 transition-colors">
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Overall Resolution SLA</span>
            <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
            {analytics.totalComplaints ? Math.round((analytics.resolved / analytics.totalComplaints) * 100) : 0}%
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {analytics.resolved} of {analytics.totalComplaints} total complaints resolved
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 transition-colors">
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Triage-to-Fix Time</span>
            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
            {analytics.avgResolutionDays} <span className="text-base font-normal text-slate-500 dark:text-slate-400">Days</span>
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            ↓ 42% faster with ML priority dispatch
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 transition-colors">
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Active Field Work Orders</span>
            <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">
            {analytics.inProgress}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Currently assigned or in active repair
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 transition-colors">
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Critical High Hazards</span>
            <ShieldCheck className="w-4 h-4 text-red-600 dark:text-red-400" />
          </div>
          <div className="text-3xl font-extrabold text-red-600 dark:text-red-400 font-mono">
            {analytics.highPriority}
          </div>
          <p className="text-xs text-red-600 dark:text-red-400 font-medium">
            Under expedited emergency protocol
          </p>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Resolution Rates */}
        <div className="bg-white dark:bg-slate-900/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Resolution Rate by Category (%)</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Percentage of complaints resolved across civic domains</p>
            </div>
            <BarChart3 className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryResolutionData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <XAxis dataKey="name" angle={-25} textAnchor="end" interval={0} tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '10px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="rate" name="Resolution Rate (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Complaints Status Breakdown */}
        <div className="bg-white dark:bg-slate-900/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Operational Status Pipeline</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Distribution across workflow stages</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.byStatus} layout="vertical" margin={{ top: 10, right: 20, left: 30, bottom: 10 }}>
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '10px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" name="Count" fill="#8b5cf6" radius={[0, 4, 4, 0]}>
                  {analytics.byStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
