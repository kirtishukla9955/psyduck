import React from 'react';
import { DepartmentCode } from '@/types';
import { useStateConfig } from '@/hooks/useStateConfig';
import { Landmark, FileText, Compass, Building } from 'lucide-react';

interface DepartmentBadgeProps {
  department: DepartmentCode;
  showFullLabel?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const DepartmentBadge: React.FC<DepartmentBadgeProps> = ({
  department,
  showFullLabel = false,
  size = 'md',
  className = '',
}) => {
  const { getDeptLabel } = useStateConfig();

  const getDeptConfig = () => {
    switch (department) {
      case 'REVENUE':
        return {
          shortLabel: 'Revenue',
          icon: <Landmark className="w-3.5 h-3.5" />,
          colorClass: 'bg-amber-50 text-amber-800 border-amber-200',
        };
      case 'REGISTRATION':
        return {
          shortLabel: 'Registration',
          icon: <FileText className="w-3.5 h-3.5" />,
          colorClass: 'bg-indigo-50 text-indigo-800 border-indigo-200',
        };
      case 'SURVEY_SETTLEMENT':
        return {
          shortLabel: 'Survey & Settlement',
          icon: <Compass className="w-3.5 h-3.5" />,
          colorClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        };
      case 'URBAN_DEV':
      default:
        return {
          shortLabel: 'Urban Development',
          icon: <Building className="w-3.5 h-3.5" />,
          colorClass: 'bg-cyan-50 text-cyan-800 border-cyan-200',
        };
    }
  };

  const config = getDeptConfig();
  const label = showFullLabel ? getDeptLabel(department) : config.shortLabel;
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border ${config.colorClass} ${padding} ${className}`}
      title={getDeptLabel(department)}
    >
      {config.icon}
      <span>{label}</span>
    </span>
  );
};
