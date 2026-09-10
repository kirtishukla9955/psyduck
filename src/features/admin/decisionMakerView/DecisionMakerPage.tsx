import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/api/serviceFactory';
import { useStateConfig } from '@/hooks/useStateConfig';
import { DepartmentBadge } from '@/features/conflicts/DepartmentBadge';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import {
  TrendingUp,
  BarChart3,
  MapPin,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  Filter,
} from 'lucide-react';

export const DecisionMakerPage: React.FC = () => {
  const navigate = useNavigate();
  const { config } = useStateConfig();
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['decisionMaker', 'analytics'],
    queryFn: () => dashboardService.getDecisionMakerAnalytics(),
  });

  if (isLoading) {
    return <LoadingSkeleton type="metrics" count={4} />;
  }

  const hotspots = analytics?.disputeHotspots || [];
  const workloads = analytics?.departmentWorkloads || [];
  const trends = analytics?.monthlyTrends || [];

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[{ label: 'Admin Portal', href: '/admin/dashboard' }, { label: 'Decision-Maker Analytics' }]}
      />

      {/* Analytical Header */}
      <div className="bg-white rounded-card border border-neutral-200 p-6 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-gis">
            Executive Land Governance Intelligence
          </span>
          <h1 className="text-xl md:text-2xl font-bold text-neutral-900 mt-1">
            Statewide Cadastral Reconciliation & SLA Oversight
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Macro analysis of departmental compliance, dispute clusters, and title synchronization velocity
          </p>
        </div>

        {/* District Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-neutral-400" />
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="text-xs border border-neutral-300 rounded px-2.5 py-1.5 bg-white text-neutral-800 focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Pilot Districts</option>
            {config.districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Macro Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-card border border-neutral-200 p-5 shadow-subtle">
          <span className="text-xs font-semibold text-neutral-500 block">
            Overall Statutory SLA Compliance
          </span>
          <div className="text-3xl font-bold text-emerald-700 mt-2">
            {analytics?.overallComplianceRate}%
          </div>
          <span className="text-[11px] text-emerald-600 font-medium block mt-1">
            ▲ +2.1% improvement post Trust Engine rollout
          </span>
        </div>

        <div className="bg-white rounded-card border border-neutral-200 p-5 shadow-subtle">
          <span className="text-xs font-semibold text-neutral-500 block">
            Mean Conflict Resolution Turnaround
          </span>
          <div className="text-3xl font-bold text-neutral-900 mt-2">
            {analytics?.avgResolutionDays} Days
          </div>
          <span className="text-[11px] text-neutral-500 block mt-1">
            Target benchmark: &lt; 10.0 business days
          </span>
        </div>

        <div className="bg-white rounded-card border border-neutral-200 p-5 shadow-subtle">
          <span className="text-xs font-semibold text-neutral-500 block">
            Total Parcels Seamlessly Reconciled
          </span>
          <div className="text-3xl font-bold text-primary mt-2">
            {analytics?.totalParcelsReconciled.toLocaleString()}
          </div>
          <span className="text-[11px] text-neutral-500 block mt-1">
            ULPINs actively verified across all 4 departments
          </span>
        </div>
      </div>

      {/* Dispute Hotspots & Monthly Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Dispute Hotspots Table */}
        <div className="lg:col-span-7 bg-white rounded-card border border-neutral-200 p-5 shadow-subtle">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Dispute & Discrepancy Hotspots</h3>
              <p className="text-xs text-neutral-500">
                Geographic concentrations flagged for targeted departmental inspection
              </p>
            </div>
            <Link
              to="/admin/conflicts"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Open Filtered Queue →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-500 font-semibold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Location / Cadastral Cluster</th>
                  <th className="py-2.5 px-3">Primary Discrepancy</th>
                  <th className="py-2.5 px-3 text-center">Cases Flagged</th>
                  <th className="py-2.5 px-3 text-right">Risk Index</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {hotspots.map((h, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-neutral-50 cursor-pointer"
                    onClick={() =>
                      navigate(`/admin/conflicts?query=${encodeURIComponent(h.district)}`)
                    }
                  >
                    <td className="py-3 px-3 font-semibold text-neutral-800 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-secondary flex-shrink-0" />
                      <span>{h.district}</span>
                    </td>
                    <td className="py-3 px-3 text-neutral-600">{h.primaryType}</td>
                    <td className="py-3 px-3 text-center font-bold text-neutral-900">
                      {h.conflictCount}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                          h.riskLevel === 'high'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : h.riskLevel === 'medium'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {h.riskLevel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monthly Trend Bar Visualization */}
        <div className="lg:col-span-5 bg-white rounded-card border border-neutral-200 p-5 shadow-subtle space-y-4">
          <div className="pb-3 border-b border-neutral-100">
            <h3 className="text-sm font-bold text-neutral-900">
              6-Month Resolution vs. Inflow Velocity
            </h3>
            <p className="text-xs text-neutral-500">Automated detections vs resolved closures</p>
          </div>

          <div className="space-y-3">
            {trends.map((t) => (
              <div key={t.month} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-neutral-700">
                  <span>{t.month}</span>
                  <span className="text-neutral-500">
                    {t.resolved} resolved / {t.detected} detected ({t.breached} SLA breaches)
                  </span>
                </div>
                {/* Visual Bar */}
                <div className="w-full bg-neutral-100 h-3 rounded-full overflow-hidden flex">
                  <div
                    className="bg-emerald-600 h-full"
                    style={{ width: `${(t.resolved / (t.detected + 5)) * 100}%` }}
                    title={`Resolved: ${t.resolved}`}
                  />
                  <div
                    className="bg-rose-500 h-full"
                    style={{ width: `${(t.breached / (t.detected + 5)) * 100}%` }}
                    title={`Breached: ${t.breached}`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
              <span>Resolved in SLA</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
              <span>SLA Breached</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
