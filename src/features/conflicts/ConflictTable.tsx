import React from 'react';
import { Link } from 'react-router-dom';
import { Conflict } from '@/types';
import { StatusBadge } from '@/components/StatusBadge';
import { SLAIndicator } from '@/components/SLAIndicator';
import { DepartmentBadge } from './DepartmentBadge';
import { ArrowUpRight } from 'lucide-react';

interface ConflictTableProps {
  conflicts: Conflict[];
  onSelectConflict?: (conflict: Conflict) => void;
  className?: string;
}

export const ConflictTable: React.FC<ConflictTableProps> = ({
  conflicts,
  onSelectConflict,
  className = '',
}) => {
  return (
    <div className={`overflow-x-auto bg-white rounded-card border border-neutral-200 shadow-subtle ${className}`}>
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-neutral-100/70 border-b border-neutral-200 text-neutral-600 font-semibold uppercase tracking-wider text-[11px]">
            <th className="py-3 px-4">Conflict ID & ULPIN</th>
            <th className="py-3 px-4">Discrepancy Type</th>
            <th className="py-3 px-4">Depts Involved</th>
            <th className="py-3 px-4">Severity</th>
            <th className="py-3 px-4">SLA Deadline</th>
            <th className="py-3 px-4">Assigned / Dept</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200">
          {conflicts.map((c) => (
            <tr
              key={c.id}
              className="hover:bg-neutral-50/80 transition-colors cursor-pointer group"
              onClick={() => onSelectConflict?.(c)}
            >
              <td className="py-3.5 px-4">
                <div className="font-bold text-neutral-900 group-hover:text-primary transition-colors">
                  {c.id}
                </div>
                <div className="text-[11px] font-mono text-secondary">{c.ulpin}</div>
                {c.location && (
                  <div className="text-[11px] text-neutral-400 mt-0.5 line-clamp-1">{c.location}</div>
                )}
              </td>

              <td className="py-3.5 px-4 font-medium text-neutral-800">
                <span className="capitalize">{c.conflictType.replace(/_/g, ' ')}</span>
              </td>

              <td className="py-3.5 px-4">
                <div className="flex flex-wrap gap-1">
                  {c.sourceDepartments.map((dept) => (
                    <DepartmentBadge key={dept} department={dept} size="sm" />
                  ))}
                </div>
              </td>

              <td className="py-3.5 px-4">
                <StatusBadge status={c.severity} size="sm" />
              </td>

              <td className="py-3.5 px-4">
                <SLAIndicator deadline={c.slaDeadline} isResolved={c.status === 'resolved'} size="sm" />
              </td>

              <td className="py-3.5 px-4">
                <div className="font-medium text-neutral-800">
                  {c.assignedOfficerName || 'Unassigned'}
                </div>
                {c.assignedDepartment && (
                  <div className="text-[10px] text-neutral-500">{c.assignedDepartment}</div>
                )}
              </td>

              <td className="py-3.5 px-4">
                <StatusBadge status={c.status} size="sm" />
              </td>

              <td className="py-3.5 px-4 text-right">
                <Link
                  to={`/admin/conflicts/${c.id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-dark p-1 rounded hover:bg-neutral-100 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span>Resolve</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
