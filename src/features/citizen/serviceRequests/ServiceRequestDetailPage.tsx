import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { serviceRequestService } from '@/api/serviceFactory';
import { DepartmentBadge } from '@/features/conflicts/DepartmentBadge';
import { Timeline, TimelineItem } from '@/components/Timeline';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { CheckCircle2, Clock, Calendar, ArrowRight } from 'lucide-react';

export const ServiceRequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const reqId = id || 'SR-2026-0081';

  const { data: request, isLoading, error, refetch } = useQuery({
    queryKey: ['serviceRequest', reqId],
    queryFn: () => serviceRequestService.getServiceRequestById(reqId),
  });

  if (isLoading) {
    return <LoadingSkeleton type="detail" />;
  }

  if (error || !request) {
    return (
      <ErrorState
        title="Request Not Found"
        message={`Unable to locate service request reference ${reqId}.`}
        onRetry={() => refetch()}
      />
    );
  }

  const timelineItems: TimelineItem[] = request.timeline.map((evt) => ({
    id: evt.id,
    title: evt.action,
    subtitle: evt.statusChangeTo ? `Status: ${evt.statusChangeTo}` : undefined,
    description: evt.note,
    timestamp: evt.timestamp,
    actor: evt.actorId,
    actorRole: evt.actorRole,
    department: evt.department,
    status: evt.statusChangeTo === 'resolved' ? 'completed' : 'current',
  }));

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Citizen Portal', href: '/citizen/dashboard' },
          { label: 'Service Requests', href: '/citizen/service-requests' },
          { label: request.id },
        ]}
      />

      <div className="bg-white rounded-card border border-neutral-200 p-6 shadow-subtle">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                Request Application:
              </span>
              <span className="text-sm font-bold text-neutral-900">{request.id}</span>
            </div>
            <h1 className="text-xl font-bold text-neutral-900 capitalize">
              {request.category.replace(/_/g, ' ')}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`text-xs px-3 py-1 rounded-full font-semibold capitalize ${
                request.status === 'resolved'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}
            >
              {request.status.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
          <div>
            <span className="text-neutral-500 block">Associated ULPIN:</span>
            <Link
              to={`/citizen/parcels/${request.parcelUlpin}`}
              className="font-mono text-secondary font-semibold hover:underline"
            >
              {request.parcelUlpin}
            </Link>
          </div>

          <div>
            <span className="text-neutral-500 block">Assigned Nodal Department:</span>
            {request.assignedDepartment ? (
              <DepartmentBadge department={request.assignedDepartment} size="sm" />
            ) : (
              <span className="text-neutral-600">Pending Assignment</span>
            )}
          </div>

          <div>
            <span className="text-neutral-500 block">Submission Date:</span>
            <span className="font-semibold text-neutral-800">
              {new Date(request.submittedDate).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-neutral-100">
          <span className="text-xs font-semibold text-neutral-700 block mb-1">
            Citizen Statement:
          </span>
          <p className="text-xs text-neutral-800 bg-neutral-50 p-3 rounded border border-neutral-100 leading-relaxed">
            {request.description}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-card border border-neutral-200 p-6 shadow-subtle">
        <h3 className="text-sm font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-100">
          Departmental Action Log
        </h3>
        <Timeline items={timelineItems} />
      </div>
    </div>
  );
};
