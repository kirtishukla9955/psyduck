import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, HelpCircle } from 'lucide-react';
import { OwnershipVerificationStatus } from '@/types';
import { useTranslation } from 'react-i18next';

interface VerificationBadgeProps {
  status: OwnershipVerificationStatus;
  size?: 'sm' | 'md' | 'lg';
  showDescription?: boolean;
  className?: string;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  status,
  size = 'md',
  showDescription = false,
  className = '',
}) => {
  const { t } = useTranslation();

  const getDetails = () => {
    switch (status) {
      case 'verified':
        return {
          icon: <CheckCircle2 className={size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />,
          bgClass: 'bg-status-success-bg text-status-success border-emerald-300',
          title: t('verification.verified', 'Verified & Reconciled'),
          desc: 'All 4 departments reconciled. No conflicts detected.',
        };
      case 'conflict_detected':
        return {
          icon: <AlertTriangle className={size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />,
          bgClass: 'bg-status-error-bg text-status-error border-red-300',
          title: t('verification.conflict_detected', 'Conflict Detected Across Departments'),
          desc: 'Cross-departmental mismatch flagged by Land Trust Engine.',
        };
      case 'pending':
        return {
          icon: <Clock className={size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />,
          bgClass: 'bg-status-warning-bg text-status-warning border-amber-300',
          title: t('verification.pending', 'Verification In Progress'),
          desc: 'Cadastral or mutation field inspection in progress.',
        };
      case 'unavailable':
      default:
        return {
          icon: <HelpCircle className={size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />,
          bgClass: 'bg-neutral-100 text-neutral-600 border-neutral-300',
          title: t('verification.unavailable', 'Record Unavailable'),
          desc: 'No digital title record linked to this identifier.',
        };
    }
  };

  const config = getDetails();
  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs'
      : size === 'lg'
      ? 'px-3.5 py-1.5 text-sm font-semibold'
      : 'px-2.5 py-1 text-xs font-medium';

  return (
    <div className={`inline-flex flex-col ${className}`}>
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border ${config.bgClass} ${sizeClasses}`}
        role="status"
        aria-label={config.title}
      >
        {config.icon}
        <span>{config.title}</span>
      </span>
      {showDescription && (
        <span className="text-xs text-neutral-500 mt-1 pl-1">{config.desc}</span>
      )}
    </div>
  );
};
