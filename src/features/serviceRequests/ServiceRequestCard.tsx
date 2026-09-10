import React from 'react';
import { Link } from 'react-router-dom';
import { ServiceRequest } from '@/types';
import { DepartmentBadge } from '@/features/conflicts/DepartmentBadge';
import { ArrowRight, Calendar, FileText, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface ServiceRequestCardProps {
  request: ServiceRequest;
  className?: string;
}

export const ServiceRequestCard: React.FC<ServiceRequestCardProps> = ({
  request,
  className = '',
}) => {
  const getStatusBadge = () => {
    switch (request.status) {
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>Resolved</span>
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
            <Clock className="w-3 h-3" />
            <span>Under Processing</span>
          </span>
        );
      case 'submitted':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            <Clock className="w-3 h-3" />
            <span>Submitted</span>
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-600 bg-neutral-100 px-2.5 py-0.5 rounded-full border border-neutral-200">
            <span>Closed</span>
          </span>
        );
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'mutation_request':
        return 'Mutation / Record of Rights Updation';
      case 'fard_issuance':
        return 'Issuance of Certified Copy (Fard)';
      case 'demarcation_request':
        return 'Field Boundary Demarcation';
      case 'encumbrance_certificate':
        return 'Encumbrance Certificate Verification';
      case 'grievance_redressal':
        return 'Ownership Title Dispute / Grievance';
      case 'patta_transfer':
        return 'Patta Transfer & Subdivision';
      default:
        return category.replace(/_/g, ' ').toUpperCase();
    }
  };

  return (
    <div
      className={`bg-white rounded-card border border-neutral-200 p-5 shadow-subtle hover:border-neutral-300 hover:shadow-elevated transition-all flex flex-col justify-between ${className}`}
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-neutral-800">{request.id}</span>
            <span className="text-[11px] font-bold text-secondary bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              {request.parcelUlpin}
            </span>
          </div>
          {getStatusBadge()}
        </div>

        <h4 className="text-sm font-semibold text-neutral-900 mb-1">
          {getCategoryLabel(request.category)}
        </h4>

        <p className="text-xs text-neutral-600 line-clamp-2 mb-3 leading-relaxed">
          {request.description}
        </p>

        {request.assignedDepartment && (
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] text-neutral-400">Assigned Department:</span>
            <DepartmentBadge department={request.assignedDepartment} size="sm" />
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
        <span className="text-[11px] text-neutral-400 flex items-center gap-1">
          <Calendar className="w-3 h-3 text-neutral-400" />
          <span>Filed: {new Date(request.submittedDate).toLocaleDateString()}</span>
        </span>

        <Link
          to={`/citizen/service-requests/${request.id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-dark transition-colors"
        >
          <span>View Timeline</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
