import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { conflictService, parcelService } from '@/api/serviceFactory';
import { useAuth } from '@/hooks/useAuth';
import { usePermission } from '@/hooks/usePermission';
import { useStateConfig } from '@/hooks/useStateConfig';
import { StatusBadge } from '@/components/StatusBadge';
import { SLAIndicator } from '@/components/SLAIndicator';
import { DepartmentBadge } from '@/features/conflicts/DepartmentBadge';
import { DataComparison } from '@/features/conflicts/DataComparison';
import { AuditTrail } from '@/features/conflicts/AuditTrail';
import { ParcelMap } from '@/gis/ParcelMap';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import {
  ShieldAlert,
  Clock,
  UserCheck,
  FileCheck2,
  AlertOctagon,
  ArrowRight,
  Send,
  CheckCircle2,
  XCircle,
  HelpCircle,
  MessageSquare,
  Compass,
} from 'lucide-react';
import { ConflictStatus } from '@/types';

const WORKFLOW_STEPS: ConflictStatus[] = [
  'detected',
  'assigned',
  'under_review',
  'verification',
  'decision',
  'resolved',
];

export const ConflictDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const conflictId = id || 'CONF-CH-2026-0042';

  const { user } = useAuth();
  const { canAct } = usePermission();
  const { getWorkflowStageLabel, formatArea } = useStateConfig();
  const queryClient = useQueryClient();

  const [noteText, setNoteText] = useState('');
  const [showActionModal, setShowActionModal] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Queries
  const { data: conflict, isLoading: conflictLoading, error: conflictError, refetch } = useQuery({
    queryKey: ['conflict', conflictId],
    queryFn: () => conflictService.getConflictById(conflictId),
  });

  const { data: evidence, isLoading: evidenceLoading } = useQuery({
    queryKey: ['evidence', conflictId],
    queryFn: () => conflictService.getConflictEvidence(conflictId),
  });

  const { data: auditEvents, isLoading: auditLoading } = useQuery({
    queryKey: ['auditTrail', conflictId],
    queryFn: () => conflictService.getAuditTrail(conflictId),
  });

  const { data: parcel } = useQuery({
    queryKey: ['parcel', conflict?.ulpin],
    queryFn: () => (conflict?.ulpin ? parcelService.getParcelByUlpin(conflict.ulpin) : null),
    enabled: !!conflict?.ulpin,
  });

  // Action Mutation
  const actionMutation = useMutation({
    mutationFn: ({
      action,
      note,
    }: {
      action: 'assign' | 'request_verification' | 'add_note' | 'escalate' | 'resolve' | 'reject';
      note?: string;
    }) =>
      conflictService.performAction(conflictId, {
        action,
        actorId: user?.id || 'officer',
        actorRole: user?.role || 'REVENUE_OFFICER',
        actorName: user?.name,
        department: user?.department,
        note,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['conflict', conflictId] });
      queryClient.invalidateQueries({ queryKey: ['auditTrail', conflictId] });
      queryClient.invalidateQueries({ queryKey: ['conflicts'] });
      setNoteText('');
      setShowActionModal(null);
      setSuccessToast(`Action successfully executed: ${data.appendedEvent.action}`);
      setTimeout(() => setSuccessToast(null), 5000);
    },
  });

  if (conflictLoading) {
    return <LoadingSkeleton type="detail" />;
  }

  if (conflictError || !conflict) {
    return (
      <ErrorState
        title="Conflict Case Not Found"
        message={`Unable to retrieve record for case ID ${conflictId}.`}
        onRetry={() => refetch()}
      />
    );
  }

  const currentStepIndex = WORKFLOW_STEPS.indexOf(conflict.status);

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Admin Portal', href: '/admin/dashboard' },
          { label: 'Conflict Queue', href: '/admin/conflicts' },
          { label: conflict.id },
        ]}
      />

      {/* Success Notification Banner */}
      {successToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-card flex items-center gap-2 text-xs text-emerald-800 font-semibold animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-card border border-neutral-200 p-6 shadow-subtle">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                Case ID:
              </span>
              <span className="text-sm font-bold text-neutral-900">{conflict.id}</span>
              <StatusBadge status={conflict.severity} size="sm" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-neutral-900">
              Discrepancy Investigation for ULPIN {conflict.ulpin}
            </h1>
            <p className="text-xs text-neutral-500 mt-1 capitalize">
              Type: {conflict.conflictType.replace(/_/g, ' ')} | Location: {conflict.location || 'Pilot Cadastral Zone'}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <StatusBadge status={conflict.status} size="md" />
            <SLAIndicator
              deadline={conflict.slaDeadline}
              isResolved={conflict.status === 'resolved'}
            />
          </div>
        </div>

        {/* 6-Stage Resolution Workflow Stepper */}
        <div className="pt-6">
          <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
            Resolution Workflow Stages
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {WORKFLOW_STEPS.map((step, idx) => {
              const isPast = idx < currentStepIndex || conflict.status === 'resolved';
              const isCurrent = idx === currentStepIndex && conflict.status !== 'resolved';

              return (
                <div
                  key={step}
                  className={`p-2.5 rounded border text-center transition-all ${
                    isCurrent
                      ? 'bg-primary text-white border-primary shadow-subtle'
                      : isPast
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-neutral-50 text-neutral-400 border-neutral-200'
                  }`}
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider opacity-75">
                    Step {idx + 1}
                  </div>
                  <div className="text-xs font-semibold mt-0.5 capitalize">
                    {getWorkflowStageLabel(step)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Grid: Reconciliation Evidence + Mini Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 Cols: Reconciliation Evidence */}
        <div className="lg:col-span-8 space-y-6">
          {evidenceLoading ? (
            <LoadingSkeleton type="card" count={2} />
          ) : evidence ? (
            <div>
              <h2 className="text-sm font-bold text-neutral-900 mb-3 flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-primary" />
                <span>Departmental Evidence & Reconciliation Comparison</span>
              </h2>
              <DataComparison
                records={evidence.records}
                discrepancySummary={evidence.discrepancySummary}
                aiFlags={evidence.aiFlags}
              />
            </div>
          ) : (
            <p className="text-xs text-neutral-500">No evidence records uploaded.</p>
          )}

          {/* Audit Trail & Chain of Custody */}
          <AuditTrail events={auditEvents || []} />
        </div>

        {/* Right 4 Cols: Parcel Context Mini Map & Role-Gated Actions */}
        <div className="lg:col-span-4 space-y-6 sticky top-4">
          {/* Parcel Context */}
          <div className="bg-white rounded-card border border-neutral-200 p-4 shadow-subtle">
            <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
              Cadastral Parcel Context
            </h3>
            <ParcelMap
              height={220}
              interactive={false}
              selectedParcelUlpin={conflict.ulpin}
              highlightedParcels={[{ ulpin: conflict.ulpin, kind: 'conflict' }]}
            />
            {parcel && (
              <div className="mt-3 text-xs space-y-1 text-neutral-600">
                <div className="flex justify-between">
                  <span>Area:</span>
                  <span className="font-semibold text-neutral-900">{formatArea(parcel.areaValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Zoning:</span>
                  <span className="font-medium text-neutral-800">{parcel.landUseClassification}</span>
                </div>
                <div className="pt-2 border-t border-neutral-100 flex justify-end">
                  <Link
                    to={`/citizen/parcels/${conflict.ulpin}`}
                    className="text-xs text-primary font-semibold hover:underline"
                  >
                    View Citizen Parcel View →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Role-Gated Resolution Actions Panel */}
          <div className="bg-white rounded-card border border-neutral-200 p-5 shadow-subtle space-y-4">
            <div className="pb-3 border-b border-neutral-100">
              <h3 className="text-sm font-bold text-neutral-900">Official Workflow Actions</h3>
              <p className="text-xs text-neutral-500">
                Actions permitted under your role: <span className="font-semibold text-neutral-800 capitalize">{user?.role.replace(/_/g, ' ')}</span>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              {/* Assign to Self */}
              {canAct(conflict, 'assign') && conflict.status !== 'resolved' && (
                <button
                  type="button"
                  disabled={actionMutation.isPending}
                  onClick={() =>
                    actionMutation.mutate({
                      action: 'assign',
                      note: `Case claimed by ${user?.name} (${user?.role})`,
                    })
                  }
                  className="w-full py-2 px-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <UserCheck className="w-3.5 h-3.5 text-primary" />
                  <span>Assign to Self</span>
                </button>
              )}

              {/* Request Field Verification */}
              {canAct(conflict, 'request_verification') && conflict.status !== 'resolved' && (
                <button
                  type="button"
                  disabled={actionMutation.isPending}
                  onClick={() =>
                    actionMutation.mutate({
                      action: 'request_verification',
                      note: 'Formal request sent to Survey & Settlement for on-site demarcation and inspection.',
                    })
                  }
                  className="w-full py-2 px-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Compass className="w-3.5 h-3.5 text-gis" />
                  <span>Request Field Demarcation</span>
                </button>
              )}

              {/* Escalate (Supervisor / Admin only) */}
              {canAct(conflict, 'escalate') && conflict.status !== 'resolved' && (
                <button
                  type="button"
                  disabled={actionMutation.isPending}
                  onClick={() =>
                    actionMutation.mutate({
                      action: 'escalate',
                      note: 'Escalated by supervisor for cross-department hearing.',
                    })
                  }
                  className="w-full py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <AlertOctagon className="w-3.5 h-3.5 text-amber-700" />
                  <span>Escalate to Zonal Authority</span>
                </button>
              )}

              {/* Add Note Form */}
              <div className="pt-2 border-t border-neutral-100">
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Add Official Investigation Note:
                </label>
                <textarea
                  rows={2}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Enter endorsement, hearing outcome, or memo reference..."
                  className="w-full text-xs p-2 rounded border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="button"
                  disabled={!noteText.trim() || actionMutation.isPending}
                  onClick={() =>
                    actionMutation.mutate({
                      action: 'add_note',
                      note: noteText,
                    })
                  }
                  className="mt-1.5 w-full py-1.5 bg-neutral-800 hover:bg-neutral-900 text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Append Note to Audit Trail</span>
                </button>
              </div>

              {/* Resolve Button (Role Gated) */}
              {canAct(conflict, 'resolve') && conflict.status !== 'resolved' ? (
                <button
                  type="button"
                  disabled={actionMutation.isPending}
                  onClick={() =>
                    actionMutation.mutate({
                      action: 'resolve',
                      note: 'Departmental reconciliation completed. RoR and Registration indices updated per sanctioned order.',
                    })
                  }
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-subtle flex items-center justify-center gap-1.5 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Reconcile & Resolve Conflict</span>
                </button>
              ) : conflict.status === 'resolved' ? (
                <div className="p-3 bg-emerald-50 rounded border border-emerald-200 text-emerald-800 text-xs text-center font-semibold">
                  ✓ Case Officially Resolved & Reconciled
                </div>
              ) : (
                <div className="p-2.5 bg-neutral-50 rounded border border-neutral-200 text-neutral-500 text-[11px] text-center">
                  Resolution gated: Only authorized responsible officers can formally resolve.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
