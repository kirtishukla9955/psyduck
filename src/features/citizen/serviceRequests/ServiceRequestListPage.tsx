import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { serviceRequestService } from '@/api/serviceFactory';
import { DepartmentBadge } from '@/features/conflicts/DepartmentBadge';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { PlusCircle, ArrowRight, FileQuestion } from 'lucide-react';

export const ServiceRequestListPage: React.FC = () => {
  const navigate = useNavigate();

  const { data: requests, isLoading } = useQuery({
    queryKey: ['serviceRequests'],
    queryFn: () => serviceRequestService.getServiceRequests(),
  });

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[{ label: 'Citizen Portal', href: '/citizen/dashboard' }, { label: 'Service Requests' }]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Citizen Service Delivery</h1>
          <p className="text-xs text-neutral-500">
            Submit applications for Fard/RoR copies, cadastral demarcation, or title discrepancy clarifications
          </p>
        </div>

        <Link
          to="/citizen/service-requests/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded text-xs font-semibold shadow-subtle transition-colors flex-shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Service Request</span>
        </Link>
      </div>

      {isLoading ? (
        <LoadingSkeleton type="card" count={3} />
      ) : requests && requests.length > 0 ? (
        <div className="space-y-3">
          {requests.map((sr) => (
            <div
              key={sr.id}
              onClick={() => navigate(`/citizen/service-requests/${sr.id}`)}
              className="bg-white rounded-card border border-neutral-200 p-5 shadow-subtle hover:border-neutral-300 hover:shadow-elevated transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-neutral-900">{sr.id}</span>
                  <span className="text-xs font-mono text-secondary bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    ULPIN: {sr.parcelUlpin}
                  </span>
                  <span className="text-[11px] capitalize bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded font-medium">
                    {sr.category.replace(/_/g, ' ')}
                  </span>
                </div>

                <p className="text-xs text-neutral-700 max-w-2xl line-clamp-1">{sr.description}</p>

                <div className="flex items-center gap-4 text-[11px] text-neutral-400 pt-1">
                  <span>Submitted: {new Date(sr.submittedDate).toLocaleDateString()}</span>
                  {sr.assignedDepartment && (
                    <div className="flex items-center gap-1">
                      <span>Nodal:</span>
                      <DepartmentBadge department={sr.assignedDepartment} size="sm" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-neutral-100">
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${
                    sr.status === 'resolved'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-amber-50 text-amber-800'
                  }`}
                >
                  {sr.status.replace(/_/g, ' ')}
                </span>
                <span className="text-xs font-semibold text-primary flex items-center gap-1">
                  <span>View</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Service Requests"
          description="You have not submitted any service requests yet."
          actionLabel="Create Service Request"
          onAction={() => navigate('/citizen/service-requests/new')}
        />
      )}
    </div>
  );
};
