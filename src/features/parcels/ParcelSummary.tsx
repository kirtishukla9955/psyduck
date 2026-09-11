import React from 'react';
import { Parcel } from '@/types';
import { useStateConfig } from '@/hooks/useStateConfig';
import { MapPin, Layers, Clock } from 'lucide-react';
import { PlainLanguageTooltip } from '@/components/PlainLanguageTooltip';

interface ParcelSummaryProps {
  parcel: Parcel;
  className?: string;
}

export const ParcelSummary: React.FC<ParcelSummaryProps> = ({ parcel, className = '' }) => {
  const { formatArea } = useStateConfig();

  return (
    <div className={`bg-white rounded-card border border-neutral-200 p-5 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-neutral-100">
        <div>
          <div className="flex items-center gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-secondary">ULPIN</span>
            <PlainLanguageTooltip term="ULPIN" showIconOnly />
          </div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight">{parcel.ulpin}</h2>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
              parcel.dataFreshness === 'current'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5 mr-1" />
            <span>{parcel.dataFreshness === 'current' ? 'Sync Status: Current' : 'Sync Status: Overdue'}</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-sm">
        <div className="flex items-start gap-2.5">
          <MapPin className="w-4 h-4 text-neutral-400 mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-xs text-neutral-500 font-medium">Location / District</div>
            <div className="font-medium text-neutral-800">{parcel.locality}</div>
            <div className="text-xs text-neutral-500">{parcel.district}</div>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <Layers className="w-4 h-4 text-neutral-400 mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-xs text-neutral-500 font-medium">Cadastral Area</div>
            <div className="font-semibold text-neutral-900">{formatArea(parcel.areaValue)}</div>
          </div>
        </div>

        <div>
          <div className="text-xs text-neutral-500 font-medium">Zoning Classification</div>
          <div className="font-medium text-neutral-800">{parcel.landUseClassification}</div>
        </div>
      </div>
    </div>
  );
};
