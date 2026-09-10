import {
  Parcel,
  OwnershipVerification,
  DepartmentRecord,
  Conflict,
  ConflictEvidence,
  AuditEvent,
  Transaction,
  ServiceRequest,
  Notification,
  User,
  Citizen,
} from '@/types';
import {
  INITIAL_PARCELS,
  INITIAL_VERIFICATIONS,
  INITIAL_DEPT_RECORDS,
  INITIAL_CONFLICTS,
  INITIAL_EVIDENCES,
  INITIAL_AUDIT_TRAILS,
  INITIAL_TRANSACTIONS,
  INITIAL_SERVICE_REQUESTS,
  INITIAL_NOTIFICATIONS,
  MOCK_USERS,
  MOCK_CITIZENS,
} from './mockData';

// Storage keys
const STORAGE_KEY = 'land_stack_mock_state_v1';

interface MockStoreState {
  users: User[];
  citizens: Citizen[];
  parcels: Parcel[];
  verifications: Record<string, OwnershipVerification>;
  deptRecords: Record<string, DepartmentRecord[]>;
  conflicts: Conflict[];
  evidences: Record<string, ConflictEvidence>;
  auditTrails: Record<string, AuditEvent[]>;
  transactions: Transaction[];
  serviceRequests: ServiceRequest[];
  notifications: Notification[];
}

const getInitialState = (): MockStoreState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Failed to read mock state from localStorage', e);
  }

  return {
    users: MOCK_USERS,
    citizens: MOCK_CITIZENS,
    parcels: INITIAL_PARCELS,
    verifications: INITIAL_VERIFICATIONS,
    deptRecords: INITIAL_DEPT_RECORDS,
    conflicts: INITIAL_CONFLICTS,
    evidences: INITIAL_EVIDENCES,
    auditTrails: INITIAL_AUDIT_TRAILS,
    transactions: INITIAL_TRANSACTIONS,
    serviceRequests: INITIAL_SERVICE_REQUESTS,
    notifications: INITIAL_NOTIFICATIONS,
  };
};

class MockStore {
  private state: MockStoreState = getInitialState();

  private persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('Failed to save mock state to localStorage', e);
    }
  }

  public resetToDefaults() {
    this.state = {
      users: MOCK_USERS,
      citizens: MOCK_CITIZENS,
      parcels: INITIAL_PARCELS,
      verifications: INITIAL_VERIFICATIONS,
      deptRecords: INITIAL_DEPT_RECORDS,
      conflicts: INITIAL_CONFLICTS,
      evidences: INITIAL_EVIDENCES,
      auditTrails: INITIAL_AUDIT_TRAILS,
      transactions: INITIAL_TRANSACTIONS,
      serviceRequests: INITIAL_SERVICE_REQUESTS,
      notifications: INITIAL_NOTIFICATIONS,
    };
    this.persist();
  }

  // Users & Citizens
  public getUsers() {
    return this.state.users;
  }

  public getCitizens() {
    return this.state.citizens;
  }

  public getCitizenById(id: string) {
    return this.state.citizens.find((c) => c.id === id) || this.state.citizens[0];
  }

  // Parcels
  public getParcels() {
    return this.state.parcels;
  }

  public getParcelByUlpin(ulpin: string) {
    return this.state.parcels.find((p) => p.ulpin.toLowerCase() === ulpin.trim().toLowerCase()) || null;
  }

  public getVerification(ulpin: string) {
    return (
      this.state.verifications[ulpin] || {
        parcelUlpin: ulpin,
        status: 'unavailable',
        recordedOwner: { name: 'Unknown', sourceDepartment: 'REVENUE' },
        verificationSource: 'REVENUE',
        summaryNote: 'No verified record exists for this parcel identifier.',
      }
    );
  }

  public getDeptRecords(ulpin: string) {
    return this.state.deptRecords[ulpin] || [];
  }

  // Conflicts
  public getConflicts() {
    return this.state.conflicts;
  }

  public getConflictById(id: string) {
    return this.state.conflicts.find((c) => c.id === id) || null;
  }

  public getConflictEvidence(id: string) {
    return this.state.evidences[id] || null;
  }

  public getAuditTrail(conflictId: string): AuditEvent[] {
    return this.state.auditTrails[conflictId] || [];
  }

  public appendAuditEvent(conflictId: string, event: AuditEvent) {
    if (!this.state.auditTrails[conflictId]) {
      this.state.auditTrails[conflictId] = [];
    }
    this.state.auditTrails[conflictId].push(event);
    this.persist();
  }

  public updateConflict(conflict: Conflict) {
    const idx = this.state.conflicts.findIndex((c) => c.id === conflict.id);
    if (idx >= 0) {
      this.state.conflicts[idx] = conflict;
      // If resolved, update parcel verification status and unblock linked transaction
      if (conflict.status === 'resolved') {
        const v = this.state.verifications[conflict.ulpin];
        if (v) {
          v.status = 'verified';
          v.summaryNote = 'Conflict resolved via formal departmental order. Cross-departmental records reconciled and verified.';
          v.lastVerifiedAt = new Date().toISOString();
        }

        // Unblock active transaction for this ULPIN if present
        const tx = this.state.transactions.find((t) => t.parcelUlpin === conflict.ulpin && t.status === 'action_required');
        if (tx) {
          tx.status = 'resolved';
          tx.currentStage = 'Reconciliation Completed & Mutation Sanctioned';
          tx.notes = `Case ${conflict.id} resolved. Title endorsed into digital Record of Rights.`;
          tx.history.push({
            id: `tx_h_${Date.now()}`,
            timestamp: new Date().toISOString(),
            actorId: conflict.assignedOfficerId || 'user_rev_01',
            actorRole: 'REVENUE_OFFICER',
            department: 'REVENUE',
            action: 'Mutation Approved & Sanctioned',
            statusChangeFrom: 'action_required',
            statusChangeTo: 'resolved',
            note: 'Formal departmental reconciliation order executed. RoR updated.',
          });
        }

        // Push real-time citizen alert notification
        this.state.notifications.unshift({
          id: `notif_${Date.now()}`,
          userId: 'user_cit_01',
          type: 'verification',
          message: `Reconciliation completed for parcel ${conflict.ulpin}. Title verified and mutation sanctioned.`,
          relatedUlpin: conflict.ulpin,
          createdAt: new Date().toISOString(),
          read: false,
          link: `/citizen/parcels/${conflict.ulpin}`,
        });
      }
      this.persist();
    }
  }

  // Transactions
  public getTransactions() {
    return this.state.transactions;
  }

  public getTransactionById(id: string) {
    return this.state.transactions.find((t) => t.id === id) || null;
  }

  // Service Requests
  public getServiceRequests() {
    return this.state.serviceRequests;
  }

  public getServiceRequestById(id: string) {
    return this.state.serviceRequests.find((sr) => sr.id === id) || null;
  }

  public addServiceRequest(req: ServiceRequest) {
    this.state.serviceRequests.unshift(req);
    this.persist();
    return req;
  }

  // Notifications
  public getNotifications(userId: string) {
    return this.state.notifications.filter((n) => n.userId === userId);
  }

  public markNotificationAsRead(id: string) {
    const notif = this.state.notifications.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
      this.persist();
    }
    return notif;
  }

  public markAllNotificationsAsRead(userId: string) {
    this.state.notifications.forEach((n) => {
      if (n.userId === userId) {
        n.read = true;
      }
    });
    this.persist();
  }
}

export const mockStore = new MockStore();
