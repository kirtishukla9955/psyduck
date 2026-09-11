import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  AlertOctagon,
  HelpCircle,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { ConflictStatus, ConflictSeverity, TransactionStatus } from '@/types';

type BadgeType = ConflictStatus | ConflictSeverity | TransactionStatus | 'healthy' | 'nearing' | 'breached';

interface StatusBadgeProps {
  status: BadgeType;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'md',
  className = '',
}) => {
  const getBadgeConfig = () => {
    switch (status) {
      // Success / Resolved
      case 'resolved':
      case 'healthy':
        return {
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
          bgClass: 'bg-status-success-bg text-status-success border-emerald-200',
          defaultLabel: status === 'resolved' ? 'Resolved' : 'On Track',
        };

      // Warning / Under Review / Nearing
      case 'under_review':
      case 'verification':
      case 'in_review':
      case 'nearing':
      case 'medium':
        return {
          icon: <Clock className="w-3.5 h-3.5" />,
          bgClass: 'bg-status-warning-bg text-status-warning border-amber-200',
          defaultLabel:
            status === 'nearing'
              ? 'Nearing Deadline'
              : status === 'medium'
              ? 'Medium'
              : 'In Review',
        };

      // Error / Critical / Breached / Rejected
      case 'breached':
      case 'critical':
      case 'high':
      case 'action_required':
      case 'rejected':
        return {
          icon: status === 'critical' ? <AlertOctagon className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />,
          bgClass: 'bg-status-error-bg text-status-error border-red-200',
          defaultLabel:
            status === 'breached'
              ? 'SLA Breached'
              : status === 'action_required'
              ? 'Action Required'
              : status === 'critical'
              ? 'Critical'
              : status === 'high'
              ? 'High'
              : 'Rejected',
        };

      // Info / Detected / Assigned / Submitted / Low
      case 'detected':
      case 'assigned':
      case 'decision':
      case 'submitted':
      case 'low':
      default:
        return {
          icon: <ShieldCheck className="w-3.5 h-3.5" />,
          bgClass: 'bg-status-info-bg text-status-info border-blue-200',
          defaultLabel:
            status === 'detected'
              ? 'Detected'
              : status === 'assigned'
              ? 'Assigned'
              : status === 'submitted'
              ? 'Submitted'
              : status === 'low'
              ? 'Low'
              : String(status),
        };
    }
  };

  const config = getBadgeConfig();
  const displayLabel = label || config.defaultLabel;
  const paddingClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.bgClass} ${paddingClass} ${className}`}
      role="status"
      aria-label={displayLabel}
    >
      {config.icon}
      <span>{displayLabel}</span>
    </span>
  );
};
