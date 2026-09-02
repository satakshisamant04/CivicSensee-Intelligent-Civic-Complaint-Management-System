import React from 'react';
import { PriorityLevel, ComplaintStatus } from '../types/index.js';
import { AlertTriangle, Clock, CheckCircle2, XCircle, ArrowRightCircle, ShieldAlert } from 'lucide-react';

interface PriorityBadgeProps {
  priority: PriorityLevel;
  confidence?: number;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  confidence,
  size = 'md',
  showIcon = true
}) => {
  const configs = {
    HIGH: {
      bg: 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800 ring-red-500/20',
      pill: 'bg-red-600 text-white',
      dot: 'bg-red-500',
      icon: ShieldAlert,
      label: 'HIGH PRIORITY'
    },
    MEDIUM: {
      bg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 ring-amber-500/20',
      pill: 'bg-amber-600 text-white',
      dot: 'bg-amber-500',
      icon: AlertTriangle,
      label: 'MEDIUM PRIORITY'
    },
    LOW: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 ring-emerald-500/20',
      pill: 'bg-emerald-600 text-white',
      dot: 'bg-emerald-500',
      icon: Clock,
      label: 'LOW PRIORITY'
    }
  };

  const c = configs[priority] || configs.MEDIUM;
  const IconComponent = c.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 font-semibold gap-1',
    md: 'text-xs px-2.5 py-1 font-semibold gap-1.5',
    lg: 'text-sm px-3 py-1.5 font-bold gap-2'
  };

  return (
    <span
      id={`priority-badge-${priority.toLowerCase()}`}
      className={`inline-flex items-center rounded-md border ring-1 ring-inset ${c.bg} ${sizeClasses[size]}`}
    >
      {showIcon && <IconComponent className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
      <span className="tracking-wide uppercase">{priority}</span>
      {confidence !== undefined && (
        <span className="ml-1 opacity-75 font-mono text-[10px]">
          {Math.round(confidence * 100)}%
        </span>
      )}
    </span>
  );
};

interface StatusBadgeProps {
  status: ComplaintStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const configs: Record<ComplaintStatus, { bg: string; icon: React.ComponentType<{ className?: string }> }> = {
    'Submitted': {
      bg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700',
      icon: Clock
    },
    'Under Review': {
      bg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      icon: ArrowRightCircle
    },
    'Assigned': {
      bg: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      icon: ArrowRightCircle
    },
    'In Progress': {
      bg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      icon: Clock
    },
    'Resolved': {
      bg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      icon: CheckCircle2
    },
    'Rejected': {
      bg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      icon: XCircle
    }
  };

  const c = configs[status] || configs.Submitted;
  const IconComponent = c.icon;

  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      id={`status-badge-${status.toLowerCase().replace(/\s+/g, '-')}`}
      className={`inline-flex items-center gap-1.5 rounded-md border font-medium ${c.bg} ${sizeClass}`}
    >
      <IconComponent className="w-3 h-3" />
      <span>{status}</span>
    </span>
  );
};
