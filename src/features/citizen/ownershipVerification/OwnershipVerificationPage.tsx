import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { parcelService, conflictService } from '@/api/serviceFactory';
import { useStateConfig } from '@/hooks/useStateConfig';
import { VerificationBadge } from '@/components/VerificationBadge';
import { DepartmentBadge } from '@/features/conflicts/DepartmentBadge';
import { DataComparison } from '@/features/conflicts/DataComparison';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import {
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  FileCheck2,
  ArrowRight,
  Info,
  Calendar,
  UserCheck,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const OwnershipVerificationPage: React.FC = () => {
  const { ulpin } = useParams<{ ulpin: string }>();
  const { t } = useTranslation();
  const { getRorTerm } = useStateConfig();
  const targetUlpin = ulpin || 'CH-SEC17-0402';

  const { data: verification, isLoading: verLoading, error: verError, refetch } = useQuery({
    queryKey: ['verification', targetUlpin],
    queryFn: () => parcelService.getOwnershipVerification(targetUlpin),
  });

  const { data: evidence, isLoading: evLoading } = useQuery({
    queryKey: ['evidence', verification?.conflictId],
    queryFn: () => (verification?.conflictId ? conflictService.getConflictEvidence(verification.conflictId) : null),
    enabled: !!verification?.conflictId,
  });

  if (verLoading) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton type="detail" />
      </div>
    );
  }

  if (verError || !verification) {
    return (
      <ErrorState
        title="Verification Record Not Found"
        message={`Unable to locate ownership reconciliation record for ${targetUlpin}.`}
        onRetry={() => refetch()}
      />
    );
  }

  const getNextSteps = () => {
    switch (verification.status) {
      case 'verified':
        return {
          title: 'All Departmental Records Synchronized',
          description: t('verification.nextStepsVerified'),
          action: null,
        };
      case 'conflict_detected':
        return {
          title: 'Cross-Department Discrepancy Flagged',
          description: t('verification.nextStepsConflict'),
          actionLabel: 'Submit Service Request / Inquiry',
          actionHref: `/citizen/service-requests/new?ulpin=${targetUlpin}`,
        };
      case 'pending':
        return {
          title: 'Field Demarcation & Survey in Progress',
          description: t('verification.nextStepsPending'),
          actionLabel: 'Track Status in Transactions',
          actionHref: '/citizen/transactions',
        };
      case 'unavailable':
      default:
        return {
          title: 'ULPIN Linking Required',
          description: t('verification.nextStepsUnavailable'),
          actionLabel: 'Learn How to Link Your Parcel',
          actionHref: '/help',
        };
    }
  };

  const nextSteps = getNextSteps();

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Citizen Portal', href: '/citizen/dashboard' },
          { label: 'Parcel Details', href: `/citizen/parcels/${targetUlpin}` },
          { label: 'Ownership Verification' },
        ]}
      />

      {/* Header Banner */}
      <div className="bg-white rounded-card border border-neutral-200 p-6 shadow-subtle">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-secondary">
              Land Trust Engine Verification Report
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-neutral-900 mt-1">
              Title & Ownership Verification for {targetUlpin}
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              Continuous cross-referencing of {getRorTerm()} and Sub-Registrar deed indexes
            </p>
          </div>

          <div className="flex-shrink-0">
            <VerificationBadge status={verification.status} size="lg" />
          </div>
        </div>

        {/* Ownership Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
          <div className="p-3 bg-neutral-50 rounded border border-neutral-100">
            <span className="text-neutral-500 block mb-1">Recorded Titleholder:</span>
            <span className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-primary" />
              <span>{verification.recordedOwner.name}</span>
            </span>
          </div>

          <div className="p-3 bg-neutral-50 rounded border border-neutral-100">
            <span className="text-neutral-500 block mb-1">Source Department:</span>
            <DepartmentBadge department={verification.verificationSource} showFullLabel />
          </div>

          <div className="p-3 bg-neutral-50 rounded border border-neutral-100">
            <span className="text-neutral-500 block mb-1">Last Reconciled Timestamp:</span>
            <span className="text-sm font-semibold text-neutral-800 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-neutral-500" />
              <span>
                {verification.lastVerifiedAt
                  ? new Date(verification.lastVerifiedAt).toLocaleDateString()
                  : 'Recent sync'}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Discrepancy Evidence Comparison (if conflict detected) */}
      {verification.status === 'conflict_detected' && evidence && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <h2 className="text-base font-bold text-neutral-900">
              Departmental Reconciliation Breakdown
            </h2>
          </div>

          <DataComparison
            records={evidence.records}
            discrepancySummary={evidence.discrepancySummary}
          />
        </div>
      )}

      {/* "What You Should Do Next" Guidance Panel */}
      <div className="bg-white rounded-card border border-neutral-200 p-6 shadow-subtle space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
          <Info className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-bold text-neutral-900">{t('verification.nextStepsTitle')}</h3>
        </div>

        <div className="bg-neutral-50 rounded p-4 border border-neutral-200">
          <h4 className="text-sm font-semibold text-neutral-900 mb-1">{nextSteps.title}</h4>
          <p className="text-xs text-neutral-600 leading-relaxed">{nextSteps.description}</p>
        </div>

        {nextSteps.actionLabel && nextSteps.actionHref && (
          <div className="pt-2">
            <Link
              to={nextSteps.actionHref}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded text-xs font-semibold transition-colors"
            >
              <span>{nextSteps.actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
