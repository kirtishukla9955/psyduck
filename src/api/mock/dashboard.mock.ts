import {
  DashboardService,
  DepartmentWorkload,
  DecisionMakerAnalytics,
} from '../contracts/dashboard.contract';
import { DashboardMetric, DepartmentCode, Role } from '@/types';
import { mockStore } from './mockStore';

const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

export class MockDashboardService implements DashboardService {
  async getMetrics(params?: { role?: Role; department?: DepartmentCode }): Promise<DashboardMetric[]> {
    await delay();
    const conflicts = mockStore.getConflicts();
    const transactions = mockStore.getTransactions();
    const serviceRequests = mockStore.getServiceRequests();

    const activeConflicts = conflicts.filter((c) => c.status !== 'resolved' && c.status !== 'rejected');
    const now = new Date().getTime();
    const slaBreaches = activeConflicts.filter(
      (c) => new Date(c.slaDeadline).getTime() < now
    );
    const nearingSla = activeConflicts.filter((c) => {
      const diffHours = (new Date(c.slaDeadline).getTime() - now) / (1000 * 60 * 60);
      return diffHours >= 0 && diffHours <= 72;
    });
    const resolvedToday = conflicts.filter((c) => c.status === 'resolved');

    return [
      {
        key: 'active_conflicts',
        label: 'Total Active Conflicts',
        value: activeConflicts.length,
        trend: { direction: 'down', changePct: 4.5 },
      },
      {
        key: 'sla_breaches',
        label: 'SLA Breaches',
        value: slaBreaches.length,
        trend: { direction: 'down', changePct: 12.0 },
      },
      {
        key: 'nearing_sla',
        label: 'Nearing SLA (<72h)',
        value: nearingSla.length,
        trend: { direction: 'flat', changePct: 0.0 },
      },
      {
        key: 'resolved_conflicts',
        label: 'Resolved Cases',
        value: resolvedToday.length,
        trend: { direction: 'up', changePct: 18.2 },
      },
      {
        key: 'active_transactions',
        label: 'Active Transactions',
        value: transactions.filter((t) => t.status !== 'resolved').length,
      },
      {
        key: 'pending_requests',
        label: 'Citizen Requests Pending',
        value: serviceRequests.filter((s) => s.status !== 'resolved').length,
      },
    ];
  }

  async getDepartmentWorkloads(): Promise<DepartmentWorkload[]> {
    await delay();
    return [
      {
        department: 'REVENUE',
        activeCases: 14,
        slaBreaches: 2,
        nearingSla: 4,
        resolvedThisMonth: 38,
      },
      {
        department: 'REGISTRATION',
        activeCases: 9,
        slaBreaches: 1,
        nearingSla: 2,
        resolvedThisMonth: 51,
      },
      {
        department: 'SURVEY_SETTLEMENT',
        activeCases: 11,
        slaBreaches: 3,
        nearingSla: 3,
        resolvedThisMonth: 24,
      },
      {
        department: 'URBAN_DEV',
        activeCases: 6,
        slaBreaches: 0,
        nearingSla: 1,
        resolvedThisMonth: 19,
      },
    ];
  }

  async getDecisionMakerAnalytics(): Promise<DecisionMakerAnalytics> {
    await delay();
    const workloads = await this.getDepartmentWorkloads();

    return {
      overallComplianceRate: 93.4,
      avgResolutionDays: 6.8,
      totalParcelsReconciled: 28419,
      disputeHotspots: [
        {
          district: 'Sector 17 / Sector 22, Chandigarh',
          conflictCount: 18,
          primaryType: 'Owner Name Mismatch',
          riskLevel: 'high',
        },
        {
          district: 'Maraimalai Nagar, Chengalpattu',
          conflictCount: 24,
          primaryType: 'Mutation SLA Overdue',
          riskLevel: 'high',
        },
        {
          district: 'Peelamedu, Coimbatore',
          conflictCount: 12,
          primaryType: 'Zoning & Land Use Conflict',
          riskLevel: 'medium',
        },
        {
          district: 'Industrial Area Phase II, Chandigarh',
          conflictCount: 7,
          primaryType: 'Cadastral Boundary Inconsistency',
          riskLevel: 'medium',
        },
        {
          district: 'Melur Taluk, Madurai',
          conflictCount: 5,
          primaryType: 'Patta Subdivision Sync',
          riskLevel: 'low',
        },
      ],
      monthlyTrends: [
        { month: 'Apr 2026', detected: 42, resolved: 38, breached: 6 },
        { month: 'May 2026', detected: 49, resolved: 44, breached: 5 },
        { month: 'Jun 2026', detected: 61, resolved: 58, breached: 7 },
        { month: 'Jul 2026', detected: 55, resolved: 54, breached: 4 },
        { month: 'Aug 2026', detected: 68, resolved: 65, breached: 6 },
        { month: 'Sep 2026', detected: 34, resolved: 31, breached: 3 },
      ],
      departmentWorkloads: workloads,
    };
  }
}
