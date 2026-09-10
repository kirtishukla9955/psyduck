import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { transactionService } from '@/api/serviceFactory';
import { StatusBadge } from '@/components/StatusBadge';
import { SLAIndicator } from '@/components/SLAIndicator';
import { DepartmentBadge } from '@/features/conflicts/DepartmentBadge';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { FileCheck2, ArrowRight, Filter, AlertTriangle } from 'lucide-react';
import { TransactionStatus } from '@/types';

export const TransactionListPage: React.FC = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['transactions', statusFilter],
    queryFn: () =>
      transactionService.getTransactions({
        status: statusFilter as TransactionStatus | 'all',
      }),
  });

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[{ label: 'Citizen Portal', href: '/citizen/dashboard' }, { label: 'Transactions & Mutations' }]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Mutation & Transaction Tracking</h1>
          <p className="text-xs text-neutral-500">
            Monitor real-time departmental approvals, statutory SLA timelines, and reconciliation stages
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-neutral-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-neutral-300 rounded px-2.5 py-1.5 bg-white text-neutral-800 focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="in_review">In Review</option>
            <option value="action_required">Action Required</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton type="card" count={3} />
      ) : transactions && transactions.length > 0 ? (
        <div className="space-y-4">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              onClick={() => navigate(`/citizen/transactions/${tx.id}`)}
              className="bg-white rounded-card border border-neutral-200 p-5 shadow-subtle hover:border-neutral-300 hover:shadow-elevated transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-neutral-900">{tx.id}</span>
                  <span className="text-xs font-mono text-secondary bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    ULPIN: {tx.parcelUlpin}
                  </span>
                  <span className="text-[11px] capitalize bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded font-medium">
                    {tx.type.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="text-xs text-neutral-600 flex flex-wrap items-center gap-4">
                  <div>
                    Department:{' '}
                    <DepartmentBadge department={tx.currentDepartment} size="sm" />
                  </div>
                  <div>
                    Current Stage: <span className="font-semibold text-neutral-800">{tx.currentStage}</span>
                  </div>
                </div>

                {tx.notes && (
                  <p className="text-xs text-neutral-500 line-clamp-1 italic">{tx.notes}</p>
                )}
              </div>

              <div className="flex flex-row md:flex-col items-end justify-between md:justify-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-neutral-100">
                <StatusBadge status={tx.status} />
                <SLAIndicator deadline={tx.slaDueDate} isResolved={tx.status === 'resolved'} size="sm" />
                <span className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                  <span>Track Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Transactions Found"
          description="There are currently no active mutation or title transactions matching this filter."
        />
      )}
    </div>
  );
};
