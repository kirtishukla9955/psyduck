import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SearchBar } from '@/components/SearchBar';
import { useStateConfig } from '@/hooks/useStateConfig';
import {
  ShieldCheck,
  Layers,
  Search,
  Scale,
  Building,
  UserCheck,
  Building2,
  ArrowRight,
  FileCheck2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getRorTerm, config } = useStateConfig();

  const handleSearch = (q: string) => {
    navigate(`/search?query=${encodeURIComponent(q)}`);
  };

  return (
    <div className="space-y-12 py-4">
      {/* Hero Section */}
      <div className="text-center max-w-4xl mx-auto space-y-5 pt-6 pb-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-primary text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Department of Land Resources | Pilot: {config.displayName}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-900 leading-tight">
          One parcel. One ULPIN. <br />
          <span className="text-primary">One connected view across departments.</span>
        </h1>

        <p className="text-base text-neutral-600 max-w-2xl mx-auto leading-relaxed">
          dharaa is an integrated GIS-based Digital Public Infrastructure that continuously reconciles records between Revenue, Registration, Survey & Settlement, and Urban Development.
        </p>

        {/* Prominent Search Bar */}
        <div className="max-w-2xl mx-auto pt-2">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search by ULPIN (e.g. CH-SEC17-0402) or locality..."
            size="lg"
          />
          <div className="mt-2 text-xs text-neutral-500 flex items-center justify-center gap-2">
            <span>Popular demo queries:</span>
            <button
              type="button"
              onClick={() => handleSearch('CH-SEC17-0402')}
              className="font-mono text-primary hover:underline font-semibold"
            >
              CH-SEC17-0402
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => handleSearch('TN-CH-09124')}
              className="font-mono text-primary hover:underline font-semibold"
            >
              TN-CH-09124
            </button>
          </div>
        </div>
      </div>

      {/* Primary Gateway Cards (Citizen vs Officer) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Citizen Portal */}
        <div className="bg-white rounded-card border border-neutral-200 p-6 shadow-subtle hover:shadow-elevated transition-all flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded bg-primary text-white flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-neutral-900">Citizen Land Portal</h2>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Verify your recorded ownership, inspect integrated {getRorTerm()} and sale deed data, track active mutation SLA timelines, and request certified records.
            </p>
          </div>

          <div className="pt-5 mt-4 border-t border-neutral-100">
            <Link
              to="/login"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-primary hover:bg-primary-dark text-white text-xs font-semibold rounded transition-colors"
            >
              <span>Access Citizen Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Department / Admin Portal */}
        <div className="bg-white rounded-card border border-neutral-200 p-6 shadow-subtle hover:shadow-elevated transition-all flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded bg-neutral-900 text-white flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-neutral-900">Department & Officer Gateway</h2>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Operational conflict resolution queue for Revenue, Registration, Survey and Urban Development officers to reconcile mismatched titles and prevent SLA breaches.
            </p>
          </div>

          <div className="pt-5 mt-4 border-t border-neutral-100">
            <Link
              to="/admin/login"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-neutral-900 hover:bg-black text-white text-xs font-semibold rounded transition-colors"
            >
              <span>Enter Department Operations</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* How It Works: 4 Reconciled Departments */}
      <div className="bg-white rounded-card border border-neutral-200 p-8 shadow-subtle max-w-5xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-secondary">
            Continuous Digital Trust Engine
          </span>
          <h3 className="text-xl font-bold text-neutral-900 mt-1">
            Bridging 4 Siloed Government Departments
          </h3>
          <p className="text-xs text-neutral-500 mt-1">
            Each parcel is anchored by its 14-digit geo-coded ULPIN to prevent conflicting registrations
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-amber-50/60 rounded border border-amber-200 space-y-1.5">
            <div className="font-bold text-amber-900 text-sm">Revenue Department</div>
            <p className="text-amber-800 leading-relaxed">
              Maintains Record of Rights (RoR/Jamabandi/Patta), mutation history, and land tax ledgers.
            </p>
          </div>

          <div className="p-4 bg-indigo-50/60 rounded border border-indigo-200 space-y-1.5">
            <div className="font-bold text-indigo-900 text-sm">Registration Office</div>
            <p className="text-indigo-800 leading-relaxed">
              Executes sale deeds, mortgages, and encumbrances. Verified against active Revenue title before registration.
            </p>
          </div>

          <div className="p-4 bg-emerald-50/60 rounded border border-emerald-200 space-y-1.5">
            <div className="font-bold text-emerald-900 text-sm">Survey & Settlement</div>
            <p className="text-emerald-800 leading-relaxed">
              Provides georeferenced cadastral boundaries (FMB sketches) and prevents spatial boundary overlaps.
            </p>
          </div>

          <div className="p-4 bg-cyan-50/60 rounded border border-cyan-200 space-y-1.5">
            <div className="font-bold text-cyan-900 text-sm">Urban Development</div>
            <p className="text-cyan-800 leading-relaxed">
              Enforces master plan zoning classifications, FAR compliance, and building permissions.
            </p>
          </div>
        </div>
      </div>

      {/* Differentiation Section: How dharaa Sits Above Existing Systems */}
      <div className="bg-neutral-900 text-white rounded-card border border-neutral-800 p-8 shadow-subtle max-w-5xl mx-auto space-y-6">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
            Architectural Differentiation
          </span>
          <h3 className="text-xl font-bold text-white mt-1">
            Why dharaa? Does It Replace Existing Systems?
          </h3>
          <p className="text-xs text-neutral-300 mt-2 leading-relaxed">
            dharaa is a non-disruptive Digital Public Infrastructure (DPI). It does not replace or clone existing state portals. Instead, it operates as a continuous Land Trust Engine that bridges existing legacy systems.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
          {/* DILRMP vs dharaa */}
          <div className="bg-neutral-800/80 rounded-lg p-5 border border-neutral-700 space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-700">
              <span className="font-bold text-teal-300 text-sm">vs. DILRMP</span>
              <span className="text-[10px] text-neutral-400">State Digitization</span>
            </div>
            <p className="text-neutral-300 leading-relaxed">
              <strong className="text-white">DILRMP</strong> digitizes individual state revenue systems, but departmental silos (Revenue vs. Registration) remain disconnected.
            </p>
            <div className="p-2.5 bg-neutral-900/90 rounded border border-teal-900/60 text-[11px] text-teal-200">
              <strong>dharaa DPI:</strong> Sits above DILRMP outputs and reconciles them across departmental boundaries using ULPIN as the anchor.
            </div>
          </div>

          {/* NAKSHA vs dharaa */}
          <div className="bg-neutral-800/80 rounded-lg p-5 border border-neutral-700 space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-700">
              <span className="font-bold text-teal-300 text-sm">vs. NAKSHA</span>
              <span className="text-[10px] text-neutral-400">Urban Drone GIS</span>
            </div>
            <p className="text-neutral-300 leading-relaxed">
              <strong className="text-white">NAKSHA</strong> provides high-resolution drone survey base maps — a mapping layer, not a governance/resolution engine.
            </p>
            <div className="p-2.5 bg-neutral-900/90 rounded border border-teal-900/60 text-[11px] text-teal-200">
              <strong>dharaa DPI:</strong> Consumes NAKSHA-grade spatial data as its Base Layer, then overlays rights, encumbrance, and resolution workflows.
            </div>
          </div>

          {/* Bhu Bharati (Dharani) vs dharaa */}
          <div className="bg-neutral-800/80 rounded-lg p-5 border border-neutral-700 space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-700">
              <span className="font-bold text-teal-300 text-sm">vs. Bhu Bharati (Dharani)</span>
              <span className="text-[10px] text-neutral-400">State Monolith</span>
            </div>
            <p className="text-neutral-300 leading-relaxed">
              <strong className="text-white">Bhu Bharati (ex-Dharani)</strong> was a monolithic portal that faced severe lock-in and had to be rebuilt from scratch.
            </p>
            <div className="p-2.5 bg-neutral-900/90 rounded border border-teal-900/60 text-[11px] text-teal-200">
              <strong>dharaa DPI:</strong> State-configurable by design. Common core model with pluggable state adapters per state, avoiding monolithic rebuilds.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
