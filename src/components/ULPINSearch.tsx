import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CheckCircle2, AlertCircle, Sparkles, MapPin } from 'lucide-react';
import { isValidULPIN } from '@/types';
import { PlainLanguageTooltip } from './PlainLanguageTooltip';

interface ULPINSearchProps {
  onSearch?: (ulpin: string) => void;
  defaultUlpin?: string;
  className?: string;
  size?: 'default' | 'large';
  showPilotChips?: boolean;
}

const PILOT_CHIPS = [
  { ulpin: 'CH-SEC17-0402', label: 'Chandigarh: Sec 17-C (Commercial)', state: 'CH' },
  { ulpin: 'TN-CH-09124', label: 'Tamil Nadu: Chengalpattu (Agri)', state: 'TN' },
  { ulpin: 'CH-SEC09-1108', label: 'Chandigarh: Sec 9-D (Verified Title)', state: 'CH' },
  { ulpin: 'TN-MD-44021', label: 'Tamil Nadu: Madurai (Punjai Land)', state: 'TN' },
];

export const ULPINSearch: React.FC<ULPINSearchProps> = ({
  onSearch,
  defaultUlpin = '',
  className = '',
  size = 'default',
  showPilotChips = true,
}) => {
  const [query, setQuery] = useState(defaultUlpin);
  const [touched, setTouched] = useState(false);
  const navigate = useNavigate();

  const trimmed = query.trim();
  const isValid = trimmed ? isValidULPIN(trimmed) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trimmed) return;
    if (onSearch) {
      onSearch(trimmed);
    } else {
      navigate(`/citizen/parcels/${encodeURIComponent(trimmed)}`);
    }
  };

  const handleChipClick = (ulpin: string) => {
    setQuery(ulpin);
    if (onSearch) {
      onSearch(ulpin);
    } else {
      navigate(`/citizen/parcels/${encodeURIComponent(ulpin)}`);
    }
  };

  const isLarge = size === 'large';

  return (
    <div className={`w-full ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
              <Search className={`${isLarge ? 'w-5 h-5' : 'w-4 h-4'}`} />
            </div>

            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setTouched(true);
              }}
              placeholder="Enter 14-character ULPIN (e.g., CH-SEC17-0402 or TN-CH-09124)"
              className={`w-full pl-10 pr-24 ${
                isLarge ? 'py-3.5 text-sm sm:text-base' : 'py-2.5 text-xs sm:text-sm'
              } rounded-lg border bg-white shadow-subtle focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                touched && isValid === false
                  ? 'border-rose-400 focus:border-rose-500'
                  : 'border-neutral-300 focus:border-primary'
              }`}
            />

            {/* Validation Indicator badge inside input */}
            <div className="absolute inset-y-0 right-2 flex items-center gap-1.5 pr-1">
              {trimmed && isValid === true && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Valid ULPIN</span>
                </span>
              )}
              {trimmed && isValid === false && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  <AlertCircle className="w-3 h-3 text-amber-600" />
                  <span>Check Format</span>
                </span>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={!trimmed}
            className={`px-6 rounded-lg font-semibold text-white bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all flex items-center justify-center gap-2 ${
              isLarge ? 'py-3.5 text-sm' : 'py-2.5 text-xs'
            }`}
          >
            <span>Inspect Parcel</span>
          </button>
        </div>

        {/* Format Help & Plain-Language Affordance */}
        <div className="mt-2 flex items-center justify-between text-xs text-neutral-500 px-1">
          <div className="flex items-center gap-1.5">
            <span>Format: [STATE]-[ZONE/TALUK]-[PLOT]</span>
            <PlainLanguageTooltip term="ULPIN" />
          </div>
          <span className="text-[11px] text-neutral-400 hidden sm:inline">
            Pilot States: Chandigarh (CH) & Tamil Nadu (TN)
          </span>
        </div>
      </form>

      {/* Pilot Parcel Quick-Pick Chips */}
      {showPilotChips && (
        <div className="mt-3.5 pt-3 border-t border-neutral-100">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-secondary" />
            <span>Pilot Demo Parcels (Click to Inspect):</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {PILOT_CHIPS.map((chip) => (
              <button
                key={chip.ulpin}
                type="button"
                onClick={() => handleChipClick(chip.ulpin)}
                className="inline-flex items-center gap-1.5 text-xs py-1 px-2.5 rounded-full border bg-white hover:bg-neutral-50 border-neutral-200 text-neutral-700 hover:border-primary/50 transition-all group shadow-xs"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    chip.state === 'CH' ? 'bg-teal-500' : 'bg-indigo-500'
                  }`}
                />
                <span className="font-semibold text-neutral-900 group-hover:text-primary">
                  {chip.ulpin}
                </span>
                <span className="text-neutral-400 text-[11px] font-normal">
                  — {chip.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
