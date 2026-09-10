import React from 'react';
import { Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

interface SLAIndicatorProps {
  deadline: string; // ISO date string
  isResolved?: boolean;
  status?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export type SLAStatus = 'healthy' | 'nearing' | 'breached' | 'resolved';

export function calculateSLA(deadlineStr: string, isResolved = false): {
  status: SLAStatus;
  label: string;
  diffHours: number;
} {
  if (isResolved) {
    return { status: 'resolved', label: 'SLA Met / Case Resolved', diffHours: 0 };
  }

  const deadline = new Date(deadlineStr).getTime();
  const now = new Date().getTime();
  const diffMs = deadline - now;
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs < 0) {
    const overdueDays = Math.abs(diffDays) === 0 ? 1 : Math.abs(diffDays);
    return {
      status: 'breached',
      label: `Breached by ${overdueDays}d`,
      diffHours,
    };
  }

  if (diffHours <= 72) {
    return {
      status: 'nearing',
      label: diffHours <= 24 ? `Due in ${diffHours}h` : `Due in ${diffDays}d (${diffHours}h)`,
      diffHours,
    };
  }

  return {
    status: 'healthy',
    label: `${diffDays} days remaining`,
    diffHours,
  };
}

export const SLAIndicator: React.FC<SLAIndicatorProps> = ({
  deadline,
  isResolved = false,
  size = 'md',
  className = '',
}) => {
  const { status, label } = calculateSLA(deadline, isResolved);

  const getStyle = () => {
    switch (status) {
      case 'resolved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'breached':
        return 'bg-rose-50 text-rose-700 border-rose-200 font-semibold';
      case 'nearing':
        return 'bg-amber-50 text-amber-800 border-amber-200 font-medium';
      case 'healthy':
      default:
        return 'bg-neutral-100 text-neutral-700 border-neutral-200';
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'resolved':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
      case 'breached':
        return <AlertCircle className="w-3.5 h-3.5 text-rose-600 animate-pulse" />;
      case 'nearing':
        return <Clock className="w-3.5 h-3.5 text-amber-600" />;
      case 'healthy':
      default:
        return <Clock className="w-3.5 h-3.5 text-neutral-500" />;
    }
  };

  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${getStyle()} ${padding} ${className}`}
      data-testid="sla-indicator"
      data-status={status}
    >
      {getIcon()}
      <span>{label}</span>
    </span>
  );
};
