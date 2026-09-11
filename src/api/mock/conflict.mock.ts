import {
  ConflictService,
  ConflictFilterParams,
  ConflictActionRequest,
  ConflictActionResult,
} from '../contracts/conflict.contract';
import { mockStore } from './mockStore';
import { Conflict, ConflictEvidence, AuditEvent, ConflictStatus, DepartmentCode } from '@/types';
import { ApiError } from '../contracts/common';

const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

export class MockConflictService implements ConflictService {
  async getConflicts(params?: ConflictFilterParams): Promise<Conflict[]> {
    await delay();
    let list = [...mockStore.getConflicts()];

    if (!params) return list;

    if (params.query) {
      const q = params.query.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.id.toLowerCase().includes(q) ||
          c.ulpin.toLowerCase().includes(q) ||
          (c.location && c.location.toLowerCase().includes(q)) ||
          (c.description && c.description.toLowerCase().includes(q))
      );
    }

    if (params.status && params.status !== 'all') {
      list = list.filter((c) => c.status === params.status);
    }

    if (params.department && params.department !== 'all') {
      const dept = params.department as DepartmentCode;
      list = list.filter(
        (c) => c.assignedDepartment === dept || c.sourceDepartments.includes(dept)
      );
    }

    if (params.severity && params.severity !== 'all') {
      list = list.filter((c) => c.severity === params.severity);
    }

    if (params.type && params.type !== 'all') {
      list = list.filter((c) => c.conflictType === params.type);
    }

    if (params.slaState && params.slaState !== 'all') {
      const now = new Date().getTime();
      list = list.filter((c) => {
        const deadline = new Date(c.slaDeadline).getTime();
        const diffHours = (deadline - now) / (1000 * 60 * 60);

        if (params.slaState === 'breached') return diffHours < 0 && c.status !== 'resolved';
        if (params.slaState === 'nearing')
          return diffHours >= 0 && diffHours <= 72 && c.status !== 'resolved';
        if (params.slaState === 'healthy')
          return diffHours > 72 || c.status === 'resolved';
        return true;
      });
    }

    if (params.sortBy) {
      const order = params.sortOrder === 'desc' ? -1 : 1;
      list.sort((a, b) => {
        if (params.sortBy === 'slaDeadline') {
          return (new Date(a.slaDeadline).getTime() - new Date(b.slaDeadline).getTime()) * order;
        }
        if (params.sortBy === 'priority') {
          return (a.priority - b.priority) * order;
        }
        if (params.sortBy === 'detectedDate') {
          return (new Date(a.detectedDate).getTime() - new Date(b.detectedDate).getTime()) * order;
        }
        return 0;
      });
    }

    return list;
  }

  async getConflictById(id: string): Promise<Conflict | null> {
    await delay();
    return mockStore.getConflictById(id);
  }

  async getConflictEvidence(id: string): Promise<ConflictEvidence | null> {
    await delay();
    return mockStore.getConflictEvidence(id);
  }

  async getAuditTrail(id: string): Promise<AuditEvent[]> {
    await delay();
    return mockStore.getAuditTrail(id);
  }

  async performAction(id: string, request: ConflictActionRequest): Promise<ConflictActionResult> {
    await delay(200);
    const conflict = mockStore.getConflictById(id);
    if (!conflict) {
      throw new ApiError({
        code: 'CONFLICT_NOT_FOUND',
        message: `Conflict with ID ${id} was not found.`,
      });
    }

    const previousStatus = conflict.status;
    let newStatus: ConflictStatus = previousStatus;
    let actionLabel = 'Action Performed';

    switch (request.action) {
      case 'assign':
        newStatus = 'assigned';
        conflict.assignedOfficerId = request.assignToOfficerId || request.actorId;
        conflict.assignedOfficerName = request.assignToOfficerName || request.actorName || 'Assigned Officer';
        if (request.department) {
          conflict.assignedDepartment = request.department;
        }
        actionLabel = `Assigned to ${conflict.assignedOfficerName}`;
        break;

      case 'request_verification':
        newStatus = 'verification';
        actionLabel = 'Verification & Demarcation Requested';
        break;

      case 'add_note':
        actionLabel = 'Investigation Note Added';
        break;

      case 'escalate':
        conflict.priority = Math.max(1, conflict.priority - 1);
        if (conflict.severity === 'medium') conflict.severity = 'high';
        else if (conflict.severity === 'high') conflict.severity = 'critical';
        actionLabel = 'Escalated to Zonal Authority';
        break;

      case 'resolve':
        newStatus = 'resolved';
        actionLabel = 'Conflict Reconciled & Resolved';
        break;

      case 'reject':
        newStatus = 'rejected';
        actionLabel = 'Conflict Dismissed / Rejected';
        break;
    }

    conflict.status = newStatus;
    mockStore.updateConflict(conflict);

    const appendedEvent: AuditEvent = {
      id: `evt_${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorId: request.actorId,
      actorRole: request.actorRole,
      department: request.department || conflict.assignedDepartment,
      action: actionLabel,
      statusChangeFrom: previousStatus !== newStatus ? previousStatus : undefined,
      statusChangeTo: previousStatus !== newStatus ? newStatus : undefined,
      note: request.note || undefined,
    };

    mockStore.appendAuditEvent(conflict.id, appendedEvent);

    return {
      conflict,
      appendedEvent,
    };
  }
}
