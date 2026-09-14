import React, { useState } from 'react';
import { HelpCircle, Info, X } from 'lucide-react';

export type TermKey =
  | 'ULPIN'
  | 'RoR'
  | 'Mutation'
  | 'Encumbrance'
  | 'CadastralMap'
  | 'FMB'
  | 'Jamabandi'
  | 'PattaChitta'
  | 'FAR'
  | 'LandTrustEngine';

export interface TermDefinition {
  title: string;
  shortDesc: string;
  detailedDesc: string;
  regionalVariant?: string;
}

export const TERMS_GLOSSARY: Record<TermKey, TermDefinition> = {
  ULPIN: {
    title: 'ULPIN (Unique Land Parcel Identification Number)',
    shortDesc: 'The 14-digit "Aadhaar for Land" that uniquely identifies every cadastral parcel in India.',
    detailedDesc:
      'ULPIN is a 14-digit alphanumeric unique identifier based on the longitude and latitude coordinates of a land parcel’s boundary vertices. It anchors multi-departmental records (Revenue, Registration, Survey, Urban Development) to one verifiable spatial truth.',
    regionalVariant: 'National Standard (DoLR, MoRD)',
  },
  RoR: {
    title: 'Record of Rights (RoR)',
    shortDesc: 'The legal revenue record of land title, tenure, shares, and tenancy.',
    detailedDesc:
      'The Record of Rights is maintained by the State Revenue Department. It officially documents who owns the parcel, the extent of ownership, tenancy rights, and revenue assessment.',
    regionalVariant: 'Jamabandi (Chandigarh / Punjab / Haryana) | Patta & Chitta (Tamil Nadu)',
  },
  Mutation: {
    title: 'Mutation (Dakhil Kharij / Patta Transfer)',
    shortDesc: 'The official process of transferring title in revenue records after a property sale or inheritance.',
    detailedDesc:
      'When property changes hands via sale deed, inheritance, or partition, mutation formally strikes out the old owner’s name and enters the new owner’s name in the Revenue RoR. dharaa ensures registration and mutation stay synchronized within statutory SLAs.',
    regionalVariant: 'Intiqal (Chandigarh) | Patta Transfer (Tamil Nadu)',
  },
  Encumbrance: {
    title: 'Encumbrance (Nill Baqi)',
    shortDesc: 'A registered financial charge, bank mortgage, or legal dispute on the property.',
    detailedDesc:
      'An encumbrance certificate (EC) verifies whether a parcel has active mortgage liabilities, court attachments, or liens registered against it that could prevent clear sale or transfer.',
    regionalVariant: 'Encumbrance Certificate (EC / Villangam)',
  },
  CadastralMap: {
    title: 'Cadastral Map (Aks Shajra / FMB)',
    shortDesc: 'A georeferenced spatial map showing official surveyed plot boundaries and plot dimensions.',
    detailedDesc:
      'Cadastral maps provide the spatial foundation (Base Layer) for land governance. They define physical boundary coordinates, neighbor adjacencies, and total ground area.',
    regionalVariant: 'Shajra (Chandigarh) | FMB Sketch (Tamil Nadu)',
  },
  FMB: {
    title: 'Field Measurement Book (FMB)',
    shortDesc: 'The official survey sketch recording exact boundary angles and sub-division dimensions.',
    detailedDesc:
      'Maintained by the Survey & Settlement Directorate in Tamil Nadu and Southern States, recording the precise triangulation lines and field measurements of each survey plot.',
    regionalVariant: 'Tamil Nadu Survey Directorate',
  },
  Jamabandi: {
    title: 'Jamabandi (RoR in Northern States)',
    shortDesc: 'The revised quadrennial revenue register recording ownership shares and cultivation.',
    detailedDesc:
      'Prepared by Patwaris/Tehsildars every five years in Chandigarh, Punjab, Haryana, and HP, documenting the Khewat, Khatauni, and Khasra details of all agricultural and urban plots.',
    regionalVariant: 'Chandigarh / Punjab / Haryana',
  },
  PattaChitta: {
    title: 'Patta & Chitta Extract',
    shortDesc: 'The revenue ownership title (Patta) and land classification extract (Chitta) in Tamil Nadu.',
    detailedDesc:
      'Issued through the Tamil Nilam computerized land records system by the Revenue Department of Tamil Nadu, specifying survey number, sub-division, wetland/dryland status, and holder details.',
    regionalVariant: 'Govt of Tamil Nadu',
  },
  FAR: {
    title: 'FAR (Floor Area Ratio)',
    shortDesc: 'The sanctioned ratio of a building’s total covered floor area to the parcel plot size.',
    detailedDesc:
      'Delineated by the Urban Development / Estate Office. Violations of FAR or setbacks are flagged as spatial/building permission inconsistencies by the Land Trust Engine.',
    regionalVariant: 'Estate Office / CMDA / DTCP',
  },
  LandTrustEngine: {
    title: 'Land Trust Engine',
    shortDesc: 'The automated engine that cross-reconciles records across departments and flags conflicts.',
    detailedDesc:
      'Connects fragmented departmental databases via ULPIN. When an owner mismatch, mutation SLA breach, or spatial overlap occurs, the Trust Engine generates an auditable conflict record and routes it for verified resolution.',
    regionalVariant: 'dharaa DPI Core',
  },
};

export interface PlainLanguageTooltipProps {
  term: TermKey;
  children?: React.ReactNode;
  showIconOnly?: boolean;
  className?: string;
}

export const PlainLanguageTooltip: React.FC<PlainLanguageTooltipProps> = ({
  term,
  children,
  showIconOnly = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const def = TERMS_GLOSSARY[term];

  if (!def) {
    return <>{children}</>;
  }

  return (
    <span className={`inline-flex items-center gap-1 relative ${className}`}>
      {children}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        aria-label={`Explain term: ${def.title}`}
        className="text-neutral-400 hover:text-primary transition-colors focus:outline-none rounded-full p-0.5"
        title={`Click for plain-language explanation of ${def.title}`}
      >
        {showIconOnly ? <Info className="w-3.5 h-3.5" /> : <HelpCircle className="w-3 h-3" />}
      </button>

      {isOpen && (
        <div
          className="absolute z-50 bottom-full mb-2 left-1/2 -translate-x-1/2 w-72 bg-neutral-900 text-white text-left rounded-lg shadow-xl p-3 text-xs border border-neutral-700 animate-in fade-in zoom-in-95 duration-150"
          role="tooltip"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <span className="font-bold text-teal-400">{def.title}</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-neutral-400 hover:text-white p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          <p className="text-neutral-200 leading-relaxed mb-2">{def.detailedDesc}</p>

          {def.regionalVariant && (
            <div className="text-[10px] text-neutral-400 border-t border-neutral-800 pt-1.5 flex items-center justify-between">
              <span>Context:</span>
              <span className="text-neutral-300 font-medium">{def.regionalVariant}</span>
            </div>
          )}

          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-neutral-900" />
        </div>
      )}
    </span>
  );
};
