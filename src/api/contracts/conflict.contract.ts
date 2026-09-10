import {
  Conflict,
  ConflictEvidence,
  AuditEvent,
  ConflictStatus,
  ConflictSeverity,
  ConflictType,
  DepartmentCode,
} from '@/types';

export interface ConflictFilterParams {
  query?: string;
  status?: ConflictStatus | 'all';
  department?: DepartmentCode | 'all';
  severity?: ConflictSeverity | 'all';
  slaState?: 'healthy' | 'nearing' | 'breached' | 'all';
  type?: ConflictType | 'all';
  from?: string;
  to?: string;
  sortBy?: 'slaDeadline' | 'priority' | 'detectedDate' | 'severity';
  sortOrder?: 'asc' | 'desc';
}

export interface ConflictActionRequest {
  action: 'assign' | 'request_verification' | 'add_note' | 'escalate' | 'resolve' | 'reject';
  actorId: string;
  actorRole: string;
  actorName?: string;
  department?: DepartmentCode;
  note?: string;
  assignToOfficerId?: string;
  assignToOfficerName?: string;
}

export interface ConflictActionResult {
  conflict: Conflict;
  appendedEvent: AuditEvent;
}

export interface ConflictService {
  getConflicts(params?: ConflictFilterParams): Promise<Conflict[]>;
  getConflictById(id: string): Promise<Conflict | null>;
  getConflictEvidence(id: string): Promise<ConflictEvidence | null>;
  getAuditTrail(id: string): Promise<AuditEvent[]>;
  performAction(id: string, request: ConflictActionRequest): Promise<ConflictActionResult>;
}
