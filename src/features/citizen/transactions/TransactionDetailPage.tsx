import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { transactionService } from '@/api/serviceFactory';
import { StatusBadge } from '@/components/StatusBadge';
import { SLAIndicator } from '@/components/SLAIndicator';
import { DepartmentBadge } from '@/features/conflicts/DepartmentBadge';
import { Timeline, TimelineItem } from '@/components/Timeline';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import {
  FileText,
  Calendar,
  AlertTriangle,
  ArrowRight,
  User,
  ShieldAlert,
} from 'lucide-react';

export const TransactionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const txId = id || 'TX-CH-2026-089';

  const { data: transaction, isLoading, error, refetch } = useQuery({
    queryKey: ['transaction', txId],
    queryFn: () => transactionService.getTransactionById(txId),
  });

  if (isLoading) {
    return <LoadingSkeleton type="detail" />;
  }

  if (error || !transaction) {
    return (
      <ErrorState
        title="Transaction Not Found"
        message={`Unable to retrieve transaction details for reference ${txId}.`}
        onRetry={() => refetch()}
      />
    );
  }

  const timelineItems: TimelineItem[] = transaction.history.map((h) => ({
    id: h.id,
    title: h.action,
    description: h.note,
    timestamp: h.timestamp,
    actor: h.actorId,
    actorRole: h.actorRole,
    department: h.department,
    status: h.statusChangeTo === 'resolved' ? 'completed' : 'current',
  }));

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Citizen Portal', href: '/citizen/dashboard' },
          { label: 'Transactions', href: '/citizen/transactions' },
          { label: transaction.id },
        ]}
      />

      {/* Header Info */}
      <div className="bg-white rounded-card border border-neutral-200 p-6 shadow-subtle">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                Mutation Reference:
              </span>
              <span className="text-sm font-bold text-neutral-900">{transaction.id}</span>
            </div>
            <h1 className="text-xl font-bold text-neutral-900">
              Transaction for ULPIN: {transaction.parcelUlpin}
            </h1>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <StatusBadge status={transaction.status} size="md" />
            <SLAIndicator
              deadline={transaction.slaDueDate}
              isResolved={transaction.status === 'resolved'}
            />
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
          <div>
            <span className="text-neutral-500 block">Transaction Type:</span>
            <span className="font-semibold text-neutral-800 capitalize">
              {transaction.type.replace(/_/g, ' ')}
            </span>
          </div>

          <div>
            <span className="text-neutral-500 block">Nodal Department:</span>
            <DepartmentBadge department={transaction.currentDepartment} size="sm" />
          </div>

          <div>
            <span className="text-neutral-500 block">Current Workflow Stage:</span>
            <span className="font-semibold text-neutral-800">{transaction.currentStage}</span>
          </div>
        </div>
      </div>

      {/* Conflict Block Warning (if action required or blocked) */}
      {transaction.status === 'action_required' && (
        <div className="bg-rose-50 border border-rose-200 rounded-card p-4 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-bold text-rose-900">
              Transaction Suspended Due to Cross-Department Conflict
            </h3>
            <p className="text-xs text-rose-700 mt-1 leading-relaxed">
              {transaction.notes ||
                'A title discrepancy has been flagged by the automated Land Trust Engine. The mutation process is paused until departmental reconciliation completes.'}
            </p>
            <div className="mt-3">
              <Link
                to={`/citizen/parcels/${transaction.parcelUlpin}/verification`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-900 hover:text-rose-800 underline"
              >
                <span>Inspect Conflict Reconciliation Report</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Timeline Section */}
      <div className="bg-white rounded-card border border-neutral-200 p-6 shadow-subtle">
        <h3 className="text-sm font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-100">
          Official Processing Timeline & Endorsements
        </h3>
        <Timeline items={timelineItems} />
      </div>
    </div>
  );
};
