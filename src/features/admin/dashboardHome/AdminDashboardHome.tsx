import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { dashboardService, conflictService } from '@/api/serviceFactory';
import { useAuth } from '@/hooks/useAuth';
import { usePermission } from '@/hooks/usePermission';
import { StatusBadge } from '@/components/StatusBadge';
import { SLAIndicator } from '@/components/SLAIndicator';
import { DepartmentBadge } from '@/features/conflicts/DepartmentBadge';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import {
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  TrendingUp,
  Building,
  User,
} from 'lucide-react';

export const AdminDashboardHome: React.FC = () => {
  const { user } = useAuth();
  const { can } = usePermission();
  const navigate = useNavigate();

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['dashboard', 'metrics', user?.role, user?.department],
    queryFn: () => dashboardService.getMetrics({ role: user?.role, department: user?.department }),
  });

  const { data: workloads, isLoading: workLoading } = useQuery({
    queryKey: ['dashboard', 'workloads'],
    queryFn: () => dashboardService.getDepartmentWorkloads(),
  });

  const { data: priorityConflicts, isLoading: conflictsLoading } = useQuery({
    queryKey: ['conflicts', 'priority'],
    queryFn: () => conflictService.getConflicts({ sortBy: 'priority', sortOrder: 'asc' }),
  });

  const activePriority = priorityConflicts?.filter((c) => c.status !== 'resolved').slice(0, 4) || [];

  return (
    <div className="space-y-6">
      {/* Officer Scope Banner */}
      <div className="bg-neutral-900 text-white rounded-card p-6 shadow-elevated flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gis-light">
              Official Dashboard
            </span>
            {user?.department && (
              <span className="text-[11px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded font-mono">
                Department: {user.department}
              </span>
            )}
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight mt-1">
            Welcome, {user?.name}
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Role: <span className="font-semibold text-neutral-200 capitalize">{user?.role.replace(/_/g, ' ')}</span> | Land Trust Engine v2.0 Live Monitor
          </p>
        </div>

        <div className="flex items-center gap-2">
          {can('dashboard:decision_maker_view') && (
            <Link
              to="/admin/decision-maker"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded border border-neutral-700 transition-colors"
            >
              <BarChart3 className="w-3.5 h-3.5 text-gis-light" />
              <span>Analytical View</span>
            </Link>
          )}

          <Link
            to="/admin/conflicts"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-semibold rounded shadow-subtle transition-colors"
          >
            <span>Open Conflict Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 1. Headline Metrics Grid */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
          Headline Operational Indicators
        </h2>
        {metricsLoading ? (
          <LoadingSkeleton type="metrics" count={4} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {metrics?.map((m) => (
              <div
                key={m.key}
                className="bg-white rounded-card border border-neutral-200 p-4 shadow-subtle flex flex-col justify-between"
              >
                <div className="text-[11px] font-medium text-neutral-500 leading-tight">
                  {m.label}
                </div>
                <div className="text-2xl font-bold text-neutral-900 mt-2">{m.value}</div>
                {m.trend && (
                  <div
                    className={`text-[10px] mt-1 flex items-center gap-0.5 font-semibold ${
                      m.trend.direction === 'down' ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    <span>{m.trend.direction === 'down' ? '▼' : '▲'}</span>
                    <span>{m.trend.changePct}% vs last month</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Department Workload & SLA Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-white rounded-card border border-neutral-200 p-5 shadow-subtle">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
            <h3 className="text-sm font-bold text-neutral-900">
              Department Workload & SLA Status
            </h3>
            <span className="text-[11px] text-neutral-400">4 Synchronized Departments</span>
          </div>

          {workLoading ? (
            <LoadingSkeleton type="list" count={4} />
          ) : (
            <div className="space-y-3">
              {workloads?.map((wl) => (
                <div
                  key={wl.department}
                  className="p-3.5 rounded border border-neutral-100 bg-neutral-50/60 flex items-center justify-between gap-3"
                >
                  <div>
                    <DepartmentBadge department={wl.department} />
                    <div className="text-xs text-neutral-500 mt-1">
                      Active: <span className="font-bold text-neutral-800">{wl.activeCases}</span> | Resolved this month: <span className="font-semibold text-emerald-700">{wl.resolvedThisMonth}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {wl.slaBreaches > 0 ? (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                        {wl.slaBreaches} Breached
                      </span>
                    ) : (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Zero Breaches
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. Priority Cases Pending Immediate Resolution */}
        <div className="lg:col-span-6 bg-white rounded-card border border-neutral-200 p-5 shadow-subtle">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Priority Case Queue</h3>
              <p className="text-xs text-neutral-500">Cases requiring urgent cross-department review</p>
            </div>
            <Link
              to="/admin/conflicts"
              className="text-xs font-semibold text-primary hover:underline"
            >
              View All
            </Link>
          </div>

          {conflictsLoading ? (
            <LoadingSkeleton type="list" count={3} />
          ) : activePriority.length > 0 ? (
            <div className="space-y-3">
              {activePriority.map((c) => (
                <div
                  key={c.id}
                  onClick={() => navigate(`/admin/conflicts/${c.id}`)}
                  className="p-3 rounded border border-neutral-200 hover:border-primary bg-white hover:bg-neutral-50 transition-all cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-neutral-900">{c.id}</span>
                      <span className="font-mono text-[11px] text-secondary">{c.ulpin}</span>
                      <StatusBadge status={c.severity} size="sm" />
                    </div>
                    <div className="text-xs text-neutral-600 line-clamp-1">
                      {c.description || c.conflictType}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <SLAIndicator deadline={c.slaDeadline} size="sm" />
                    <span className="text-[11px] font-semibold text-primary flex items-center gap-0.5">
                      <span>Action</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-neutral-500 py-6 text-center">No high-priority conflicts active.</p>
          )}
        </div>
      </div>
    </div>
  );
};
