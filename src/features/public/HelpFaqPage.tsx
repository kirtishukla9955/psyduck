import React, { useState } from 'react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { BookOpen, Layers, ShieldCheck, HelpCircle, Scale } from 'lucide-react';

export const HelpFaqPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'glossary' | 'differentiation' | 'layers'>('glossary');

  const glossary = [
    {
      term: 'ULPIN (Unique Land Parcel Identification Number)',
      definition:
        'A 14-digit alphanumeric geocoded identifier assigned to every plot of land in India. Based on longitude and latitude coordinates of the parcel’s polygon vertices, preventing duplicate claims or synthetic land titles.',
    },
    {
      term: 'Record of Rights (RoR / Jamabandi / Patta & Chitta)',
      definition:
        'The official government register containing title ownership, cultivation status, land revenue liabilities, and shareholding details maintained by the Department of Revenue.',
    },
    {
      term: 'Mutation (Dakhil Kharij / Patta Transfer)',
      definition:
        'The administrative process of recording the transfer or alteration of title in the Revenue records following a registered sale deed, inheritance, partition, or court order.',
    },
    {
      term: 'Encumbrance Certificate (EC)',
      definition:
        'A formal certificate issued by the Sub-Registrar indicating whether the property has registered mortgages, legal claims, liens, or court attachments.',
    },
    {
      term: 'Cadastral Boundary / FMB Sketch',
      definition:
        'Georeferenced field measurement book sketches demarcating precise plot boundaries, area extents, and neighboring coordinates surveyed by the Directorate of Survey & Settlement.',
    },
    {
      term: 'Land Trust Engine',
      definition:
        'The continuous background reconciliation engine within dharaa that detects cross-departmental mismatches between Revenue, Registration, Survey, and Urban Development, initiating tracked resolution workflows.',
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Breadcrumbs items={[{ label: 'Help & Knowledge Base' }]} />

      <div className="bg-white rounded-card border border-neutral-200 p-6 md:p-8 shadow-subtle space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-neutral-100">
          <div className="w-10 h-10 rounded bg-primary/10 text-primary flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900">dharaa Knowledge Base & FAQs</h1>
            <p className="text-xs text-neutral-500">
              Architecture, 3 Spatial Layers, and plain-language definitions for key land governance standards
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-neutral-200 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('glossary')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              activeTab === 'glossary'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            Plain-Language Glossary
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('differentiation')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              activeTab === 'differentiation'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            Why dharaa? (System Comparison)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('layers')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              activeTab === 'layers'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            The Three Spatial Layers
          </button>
        </div>

        {/* Tab 1: Glossary */}
        {activeTab === 'glossary' && (
          <div className="divide-y divide-neutral-200">
            {glossary.map((item, idx) => (
              <div key={idx} className="py-4 space-y-1">
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                  <span>{item.term}</span>
                </h3>
                <p className="text-xs text-neutral-700 leading-relaxed pl-3.5">
                  {item.definition}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Differentiation */}
        {activeTab === 'differentiation' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
              <h3 className="text-sm font-bold text-neutral-900 mb-1">
                Does dharaa replace state land portals or national mapping initiatives?
              </h3>
              <p className="text-neutral-700 leading-relaxed">
                <strong>No.</strong> dharaa is an interoperability and trust engine layer built above existing state systems. Land is a State subject under the Constitution of India; rather than forcing states into a single monolithic portal, dharaa introduces pluggable state adapters.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-white rounded border border-neutral-200 space-y-2">
                <div className="font-bold text-neutral-900 text-sm">1. DILRMP vs. dharaa</div>
                <p className="text-neutral-600 leading-relaxed">
                  <strong>DILRMP</strong> digitizes individual state land record systems in silos, but does not resolve cross-department non-interoperability. dharaa sits above DILRMP outputs and reconciles Revenue, Registration, Survey, and Urban Development records.
                </p>
              </div>

              <div className="p-4 bg-white rounded border border-neutral-200 space-y-2">
                <div className="font-bold text-neutral-900 text-sm">2. NAKSHA vs. dharaa</div>
                <p className="text-neutral-600 leading-relaxed">
                  <strong>NAKSHA</strong> provides an urban geospatial mapping base using high-res drone survey data — a mapping layer, not a governance/conflict-resolution engine. dharaa consumes NAKSHA-grade data as its Base Layer, adding rights and services.
                </p>
              </div>

              <div className="p-4 bg-white rounded border border-neutral-200 space-y-2">
                <div className="font-bold text-neutral-900 text-sm">3. Bhu Bharati (Dharani) vs. dharaa</div>
                <p className="text-neutral-600 leading-relaxed">
                  <strong>Bhu Bharati (ex-Dharani)</strong> was a monolithic state-specific portal that suffered lock-in complaints and had to be rebuilt from scratch. dharaa is state-configurable by design, with a shared core and per-state schema adapters.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: The Three Spatial Layers */}
        {activeTab === 'layers' && (
          <div className="space-y-4 text-xs">
            <p className="text-neutral-600 leading-relaxed">
              All land information in dharaa is structured into three foundational layers built around the parcel as the atomic unit, anchored by ULPIN:
            </p>

            <div className="space-y-3">
              <div className="p-4 bg-emerald-50/70 rounded border border-emerald-200 space-y-1.5">
                <div className="font-bold text-emerald-950 text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
                  <span>1. Base Layer (Spatial Foundation)</span>
                </div>
                <p className="text-emerald-900 leading-relaxed">
                  Georeferenced cadastral maps, boundary coordinates, FMB sketches, Survey/Sub-division numbers, and the 14-digit ULPIN as the unique spatial parcel identifier.
                </p>
              </div>

              <div className="p-4 bg-blue-50/70 rounded border border-blue-200 space-y-1.5">
                <div className="font-bold text-blue-950 text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
                  <span>2. Essential Layers (Rights & Governance)</span>
                </div>
                <p className="text-blue-900 leading-relaxed">
                  Record of Rights (RoR / Jamabandi / Patta), Sub-Registrar sale deed registrations, encumbrance certificates, bank mortgages, master plan zoning, building permissions, and FAR compliance.
                </p>
              </div>

              <div className="p-4 bg-amber-50/70 rounded border border-amber-200 space-y-1.5">
                <div className="font-bold text-amber-950 text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-600 inline-block" />
                  <span>3. Additional / Use-Case Layers (Services & Analytics)</span>
                </div>
                <p className="text-amber-900 leading-relaxed">
                  Utility infrastructure (power, water, sewerage connections), municipal property tax demands, circle rate valuation guidelines, and environmental/heritage restriction zones.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
