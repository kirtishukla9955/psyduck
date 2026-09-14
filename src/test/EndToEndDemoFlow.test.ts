import { describe, it, expect, beforeEach } from 'vitest';
import { mockStore } from '@/api/mock/mockStore';
import { MockParcelService } from '@/api/mock/parcel.mock';
import { MockConflictService } from '@/api/mock/conflict.mock';
import { MockTransactionService } from '@/api/mock/transaction.mock';
import { MockNotificationService } from '@/api/mock/notification.mock';

describe('dharaa End-to-End Demo Loop: Citizen → Officer → Citizen', () => {
  const parcelService = new MockParcelService();
  const conflictService = new MockConflictService();
  const transactionService = new MockTransactionService();
  const notificationService = new MockNotificationService();

  beforeEach(() => {
    mockStore.resetToDefaults();
  });

  it('verifies the full end-to-end reconciliation lifecycle across P3 and P4 for ULPIN CH-SEC17-0402', async () => {
    const targetUlpin = 'CH-SEC17-0402';
    const targetConflictId = 'CONF-CH-2026-0042';
    const targetTransactionId = 'TX-CH-2026-089';

    // 1. Citizen Journey - Inspect Parcel & Ownership Verification
    const initialParcel = await parcelService.getParcelByUlpin(targetUlpin);
    expect(initialParcel).not.toBeNull();
    expect(initialParcel?.ulpin).toBe(targetUlpin);
    expect(initialParcel?.essentialLayers?.ror).toBeDefined();
    expect(initialParcel?.essentialLayers?.registration).toBeDefined();
    expect(initialParcel?.aiFlags?.length).toBeGreaterThan(0);

    const initialVerification = await parcelService.getOwnershipVerification(targetUlpin);
    expect(initialVerification).not.toBeNull();
    expect(initialVerification?.status).toBe('conflict_detected');
    expect(initialVerification?.conflictId).toBe(targetConflictId);

    // Citizen checks active transaction: should be blocked / action_required
    const initialTx = await transactionService.getTransactionById(targetTransactionId);
    expect(initialTx).not.toBeNull();
    expect(initialTx?.status).toBe('action_required');

    // 2. Officer Journey - Load Conflict, Evidence & AI Flags
    const conflict = await conflictService.getConflictById(targetConflictId);
    expect(conflict).not.toBeNull();
    expect(conflict?.ulpin).toBe(targetUlpin);
    expect(conflict?.status).toBe('assigned');

    const evidence = await conflictService.getConflictEvidence(targetConflictId);
    expect(evidence).not.toBeNull();
    expect(evidence?.records.length).toBeGreaterThan(0);
    expect(evidence?.aiFlags?.length).toBeGreaterThan(0);

    // Initial Audit Trail check
    const initialAudit = await conflictService.getAuditTrail(targetConflictId);
    const initialAuditCount = initialAudit.length;

    // 3. Officer Action - Revenue Officer reconciles & resolves conflict
    const actionResult = await conflictService.performAction(targetConflictId, {
      action: 'resolve',
      actorId: 'user_rev_01',
      actorRole: 'REVENUE_OFFICER',
      actorName: 'Sh. Anupam Verma',
      department: 'REVENUE',
      note: 'Departmental records reconciled per sanctioned order. Jamabandi title aligned.',
    });

    expect(actionResult.conflict.status).toBe('resolved');
    expect(actionResult.appendedEvent.action).toBe('Conflict Reconciled & Resolved');

    // Audit Trail updated
    const updatedAudit = await conflictService.getAuditTrail(targetConflictId);
    expect(updatedAudit.length).toBe(initialAuditCount + 1);
    expect(updatedAudit[updatedAudit.length - 1].action).toBe('Conflict Reconciled & Resolved');

    // 4. Citizen Return Journey - Verification & Transaction now reflect Resolution
    const updatedVerification = await parcelService.getOwnershipVerification(targetUlpin);
    expect(updatedVerification).not.toBeNull();
    expect(updatedVerification?.status).toBe('verified');
    expect(updatedVerification?.summaryNote).toContain('reconciled');

    const updatedTx = await transactionService.getTransactionById(targetTransactionId);
    expect(updatedTx?.status).toBe('resolved');
    expect(updatedTx?.currentStage).toContain('Reconciliation Completed');

    // Citizen Notifications - contains newly dispatched title verification alert
    const citizenNotifications = await notificationService.getNotifications('user_cit_01');
    const resolutionNotif = citizenNotifications.find(
      (n) => n.relatedUlpin === targetUlpin && n.message.includes('Reconciliation completed')
    );
    expect(resolutionNotif).toBeDefined();
    expect(resolutionNotif?.read).toBe(false);
  });
});
