import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { conflictService } from '@/api/serviceFactory';
import { useAuth } from '@/hooks/useAuth';
import { usePermission } from '@/hooks/usePermission';
import { ConflictTable } from '@/features/conflicts/ConflictTable';
import { ConflictFilters } from '@/features/conflicts/ConflictFilters';
import { ConflictFilterParams } from '@/api/contracts/conflict.contract';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ShieldAlert, ArrowUpDown } from 'lucide-react';
import { Conflict } from '@/types';

export const ConflictQueuePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { canView } = usePermission();

  const [filters, setFilters] = useState<ConflictFilterParams>({
    query: '',
    status: 'all',
    department: user?.role === 'DEPARTMENT_SUPERVISOR' || user?.role === 'SYSTEM_ADMIN' ? 'all' : (user?.department || 'all'),
    severity: 'all',
    slaState: 'all',
    type: 'all',
    sortBy: 'priority',
    sortOrder: 'asc',
  });

  const { data: conflicts, isLoading, error, refetch } = useQuery({
    queryKey: ['conflicts', filters],
    queryFn: () => conflictService.getConflicts(filters),
  });

  // Filter scoped by role/department permissions
  const visibleConflicts = useMemo(() => {
    if (!conflicts) return [];
    return conflicts.filter((c) => canView(c));
  }, [conflicts, canView]);

  const handleReset = () => {
    setFilters({
      query: '',
      status: 'all',
      department: user?.role === 'DEPARTMENT_SUPERVISOR' || user?.role === 'SYSTEM_ADMIN' ? 'all' : (user?.department || 'all'),
      severity: 'all',
      slaState: 'all',
      type: 'all',
      sortBy: 'priority',
      sortOrder: 'asc',
    });
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[{ label: 'Admin Portal', href: '/admin/dashboard' }, { label: 'Conflict Operations Queue' }]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">
            Departmental Conflict & Reconciliation Queue
          </h1>
          <p className="text-xs text-neutral-500">
            Cross-departmental title mismatches, boundary overlaps, and statutory SLA breaches flagged by Land Trust Engine
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-neutral-600">
          <span className="font-semibold text-neutral-800">
            {visibleConflicts.length}
          </span>{' '}
          cases visible under your role
        </div>
      </div>

      {/* Multi-Filters */}
      <ConflictFilters
        filters={filters}
        onChange={(newFilters) => setFilters(newFilters)}
        onReset={handleReset}
      />

      {/* Operations Table */}
      {isLoading ? (
        <div className="bg-white rounded-card border border-neutral-200 p-4">
          <table className="w-full">
            <LoadingSkeleton type="table" count={5} />
          </table>
        </div>
      ) : visibleConflicts.length > 0 ? (
        <ConflictTable
          conflicts={visibleConflicts}
          onSelectConflict={(c) => navigate(`/admin/conflicts/${c.id}`)}
        />
      ) : (
        <EmptyState
          title="No Conflicts Found"
          description="No departmental conflicts or discrepancies match the active filters and your department scope."
          actionLabel="Reset Filters"
          onAction={handleReset}
        />
      )}
    </div>
  );
};
