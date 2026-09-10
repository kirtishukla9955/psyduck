import { DashboardMetric, DepartmentCode, Role } from '@/types';

export interface DepartmentWorkload {
  department: DepartmentCode;
  activeCases: number;
  slaBreaches: number;
  nearingSla: number;
  resolvedThisMonth: number;
}

export interface DecisionMakerAnalytics {
  overallComplianceRate: number; // e.g. 92.4%
  avgResolutionDays: number;
  totalParcelsReconciled: number;
  disputeHotspots: {
    district: string;
    conflictCount: number;
    primaryType: string;
    riskLevel: 'low' | 'medium' | 'high';
  }[];
  monthlyTrends: {
    month: string;
    detected: number;
    resolved: number;
    breached: number;
  }[];
  departmentWorkloads: DepartmentWorkload[];
}

export interface DashboardService {
  getMetrics(params?: { role?: Role; department?: DepartmentCode }): Promise<DashboardMetric[]>;
  getDepartmentWorkloads(): Promise<DepartmentWorkload[]>;
  getDecisionMakerAnalytics(): Promise<DecisionMakerAnalytics>;
}
