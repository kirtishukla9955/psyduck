import React from 'react';
import { Link } from 'react-router-dom';
import { Parcel } from '@/types';
import { useStateConfig } from '@/hooks/useStateConfig';
import { MapPin, ArrowRight, ShieldCheck } from 'lucide-react';

interface ParcelCardProps {
  parcel: Parcel;
  actionHref?: string;
  actionLabel?: string;
  className?: string;
}

export const ParcelCard: React.FC<ParcelCardProps> = ({
  parcel,
  actionHref = `/citizen/parcels/${parcel.ulpin}`,
  actionLabel = 'View Integrated Details',
  className = '',
}) => {
  const { formatArea } = useStateConfig();

  return (
    <div
      className={`bg-white rounded-card border border-neutral-200 p-5 shadow-subtle hover:border-neutral-300 hover:shadow-elevated transition-all flex flex-col justify-between ${className}`}
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="text-xs font-bold text-secondary bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            {parcel.ulpin}
          </span>
          <span
            className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
              parcel.dataFreshness === 'current'
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-neutral-100 text-neutral-600'
            }`}
          >
            {parcel.dataFreshness === 'current' ? 'Reconciled' : 'Review Required'}
          </span>
        </div>

        <h3 className="text-base font-semibold text-neutral-900 line-clamp-1 mb-1">
          {parcel.locality}
        </h3>
        <p className="text-xs text-neutral-500 flex items-center gap-1 mb-3">
          <MapPin className="w-3.5 h-3.5 text-neutral-400" />
          <span>{parcel.district}</span>
        </p>

        <div className="grid grid-cols-2 gap-2 text-xs bg-neutral-50 p-2.5 rounded border border-neutral-100 mb-4">
          <div>
            <span className="text-neutral-500 block">Area:</span>
            <span className="font-semibold text-neutral-800">{formatArea(parcel.areaValue)}</span>
          </div>
          <div>
            <span className="text-neutral-500 block">Land Use:</span>
            <span className="font-medium text-neutral-800 line-clamp-1">
              {parcel.landUseClassification}
            </span>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
        <span className="text-[11px] text-neutral-400">
          Updated: {new Date(parcel.lastUpdated).toLocaleDateString()}
        </span>
        <Link
          to={actionHref}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-dark transition-colors"
        >
          <span>{actionLabel}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
