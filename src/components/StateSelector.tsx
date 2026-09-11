import React from 'react';
import { MapPin } from 'lucide-react';
import { useStateConfig } from '@/hooks/useStateConfig';
import { StateCode } from '@/types';

export const StateSelector: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { currentStateCode, setStateCode, config } = useStateConfig();

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <MapPin className="w-3.5 h-3.5 text-secondary" />
      <select
        value={currentStateCode}
        onChange={(e) => setStateCode(e.target.value as StateCode)}
        className="bg-white/90 border border-neutral-300 text-xs font-semibold text-neutral-800 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer hover:border-primary transition-colors"
        aria-label="Select State Configuration"
      >
        <option value="CH">Chandigarh (UT)</option>
        <option value="TN">Tamil Nadu</option>
      </select>
    </div>
  );
};
