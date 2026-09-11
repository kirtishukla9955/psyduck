import React from 'react';
import { Link } from 'react-router-dom';
import { Conflict } from '@/types';
import { StatusBadge } from '@/components/StatusBadge';
import { SLAIndicator } from '@/components/SLAIndicator';
import { DepartmentBadge } from './DepartmentBadge';
import { ArrowRight, MapPin, Calendar, AlertOctagon } from 'lucide-react';

interface ConflictCardProps {
  conflict: Conflict;
  className?: string;
}

export const ConflictCard: React.FC<ConflictCardProps> = ({ conflict, className = '' }) => {
  const getSeverityBadge = () => {
    switch (conflict.severity) {
      case 'critical':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'high':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low':
        return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  const getConflictTypeLabel = () => {
    switch (conflict.conflictType) {
      case 'owner_name_mismatch':
        return 'Owner Name Mismatch';
      case 'mutation_sla_breach':
        return 'Mutation SLA Breach';
      case 'outdated_record':
        return 'Outdated Department Record';
      case 'spatial_inconsistency':
        return 'Spatial / Cadastral Overlap';
      case 'cross_department_mismatch':
        return 'Cross-Department Discrepancy';
      case 'land_use_inconsistency':
        return 'Land-Use Classification Drift';
      default:
        return conflict.conflictType;
    }
  };

  return (
    <div
      className={`bg-white rounded-card border border-neutral-200 p-4 shadow-subtle hover:border-neutral-300 hover:shadow-elevated transition-all flex flex-col justify-between ${className}`}
    >
      <div>
        {/* Top bar: ID, Severity & Status */}
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-neutral-900 font-mono">{conflict.id}</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${getSeverityBadge()}`}
            >
              {conflict.severity}
            </span>
          </div>
          <StatusBadge status={conflict.status} />
        </div>

        {/* Conflict Type & Description */}
        <h4 className="text-sm font-semibold text-neutral-900 mb-1 flex items-center gap-1.5">
          <AlertOctagon className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{getConflictTypeLabel()}</span>
        </h4>
        {conflict.description && (
          <p className="text-xs text-neutral-600 line-clamp-2 mb-3 leading-relaxed">
            {conflict.description}
          </p>
        )}

        {/* ULPIN & Location */}
        <div className="bg-neutral-50 rounded-lg p-2.5 border border-neutral-100 mb-3 space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-neutral-500 font-medium">ULPIN:</span>
            <span className="font-mono font-bold text-secondary">{conflict.ulpin}</span>
          </div>
          {conflict.location && (
            <div className="flex items-center gap-1 text-neutral-600 text-[11px] truncate">
              <MapPin className="w-3 h-3 text-neutral-400 flex-shrink-0" />
              <span className="truncate">{conflict.location}</span>
            </div>
          )}
        </div>

        {/* Involved Departments */}
        <div className="mb-3">
          <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
            Department Records:
          </span>
          <div className="flex flex-wrap gap-1">
            {conflict.sourceDepartments.map((dept) => (
              <DepartmentBadge key={dept} department={dept} size="sm" />
            ))}
          </div>
        </div>
      </div>

      {/* Footer: SLA & Action Button */}
      <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <SLAIndicator deadline={conflict.slaDeadline} isResolved={conflict.status === 'resolved'} />
        </div>

        <Link
          to={`/admin/conflicts/${conflict.id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-dark transition-colors"
        >
          <span>Investigate</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
