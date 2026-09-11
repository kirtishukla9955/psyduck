import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { parcelService } from '@/api/serviceFactory';
import { useStateConfig } from '@/hooks/useStateConfig';
import { SearchBar } from '@/components/SearchBar';
import { ParcelCard } from '@/features/parcels/ParcelCard';
import { ParcelMap } from '@/gis/ParcelMap';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Map as MapIcon, ShieldCheck, Lock } from 'lucide-react';

export const PublicSearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('query') || '';
  const [query, setQuery] = useState(initialQuery);
  const [selectedUlpin, setSelectedUlpin] = useState<string | undefined>('CH-SEC17-0402');
  const { currentStateCode, config } = useStateConfig();
  const navigate = useNavigate();

  const { data: parcels, isLoading } = useQuery({
    queryKey: ['parcels', 'public-search', query, currentStateCode],
    queryFn: () => parcelService.searchParcels({ query, state: currentStateCode }),
  });

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
    if (newQuery) setSearchParams({ query: newQuery });
    else setSearchParams({});
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Public Parcel Search' }]} />

      <div className="bg-white rounded-card border border-neutral-200 p-6 shadow-subtle">
        <div className="max-w-2xl mb-4">
          <h1 className="text-xl font-bold text-neutral-900">Public Land Parcel Lookup</h1>
          <p className="text-xs text-neutral-500 mt-1">
            Search public cadastral data, location boundaries, and zoning across {config.displayName}. No login required for general parcel inspection.
          </p>
        </div>

        <SearchBar
          initialValue={query}
          onSearch={handleSearch}
          placeholder="Search by ULPIN (e.g. CH-SEC17-0402) or locality..."
        />
      </div>

      {/* Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Results List */}
        <div className="lg:col-span-6 space-y-4">
          <div className="text-xs text-neutral-500 font-medium">
            {parcels ? `${parcels.length} public records found` : 'Searching...'}
          </div>

          {isLoading ? (
            <LoadingSkeleton type="card" count={2} />
          ) : parcels && parcels.length > 0 ? (
            <div className="space-y-3">
              {parcels.map((parcel) => (
                <div
                  key={parcel.ulpin}
                  onClick={() => setSelectedUlpin(parcel.ulpin)}
                  className={`cursor-pointer transition-all ${
                    selectedUlpin === parcel.ulpin ? 'ring-2 ring-primary rounded-card' : ''
                  }`}
                >
                  <ParcelCard
                    parcel={parcel}
                    actionHref={`/login?redirect=/citizen/parcels/${parcel.ulpin}`}
                    actionLabel="Login to View Full Ownership & RoR"
                  />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No Parcels Found"
              description={`No cadastral entries matched "${query}".`}
              actionLabel="Show All Records"
              onAction={() => handleSearch('')}
            />
          )}
        </div>

        {/* Map Preview */}
        <div className="lg:col-span-6 sticky top-20">
          <div className="bg-white rounded-card border border-neutral-200 p-3 shadow-subtle">
            <div className="flex items-center justify-between mb-2 text-xs font-semibold text-neutral-800">
              <span className="flex items-center gap-1.5">
                <MapIcon className="w-4 h-4 text-gis" />
                <span>P1 Cadastral Map Explorer</span>
              </span>
              {selectedUlpin && (
                <span className="font-mono text-secondary text-[11px] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {selectedUlpin}
                </span>
              )}
            </div>

            <ParcelMap
              height={480}
              selectedParcelUlpin={selectedUlpin}
              highlightedParcels={[
                { ulpin: 'CH-SEC17-0402', kind: 'conflict' },
                { ulpin: 'CH-SEC09-1108', kind: 'selected' },
              ]}
              onParcelClick={(ulpin) => setSelectedUlpin(ulpin)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
