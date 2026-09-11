import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { parcelService } from '@/api/serviceFactory';
import { useStateConfig } from '@/hooks/useStateConfig';
import { SearchBar } from '@/components/SearchBar';
import { ParcelCard } from '@/features/parcels/ParcelCard';
import { ParcelMap } from '@/gis/ParcelMap';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Layers, Map as MapIcon, ListFilter } from 'lucide-react';

export const ParcelSearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('query') || '';
  const [query, setQuery] = useState(initialQuery);
  const [selectedUlpin, setSelectedUlpin] = useState<string | undefined>('CH-SEC17-0402');
  const { currentStateCode } = useStateConfig();
  const navigate = useNavigate();

  const { data: parcels, isLoading } = useQuery({
    queryKey: ['parcels', 'search', query, currentStateCode],
    queryFn: () => parcelService.searchParcels({ query, state: currentStateCode }),
  });

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
    if (newQuery) {
      setSearchParams({ query: newQuery });
    } else {
      setSearchParams({});
    }
  };

  useEffect(() => {
    if (parcels && parcels.length > 0 && !selectedUlpin) {
      setSelectedUlpin(parcels[0].ulpin);
    }
  }, [parcels, selectedUlpin]);

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[{ label: 'Citizen Portal', href: '/citizen/dashboard' }, { label: 'Parcel Search' }]}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-neutral-200">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Integrated Cadastral Parcel Search</h1>
          <p className="text-xs text-neutral-500">
            Search by Unique Land Parcel Identification Number (ULPIN) or district locality
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <SearchBar
        initialValue={query}
        onSearch={handleSearch}
        placeholder="Enter ULPIN (e.g. CH-SEC17-0402 or TN-CH-09124)..."
      />

      {/* Split View: List (Left) + GIS Map (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Results List */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between text-xs text-neutral-500 font-medium">
            <span>
              {parcels ? `${parcels.length} parcel${parcels.length === 1 ? '' : 's'} found` : 'Searching...'}
            </span>
            <span>State: {currentStateCode}</span>
          </div>

          {isLoading ? (
            <LoadingSkeleton type="card" count={3} />
          ) : parcels && parcels.length > 0 ? (
            <div className="space-y-3">
              {parcels.map((parcel) => {
                const isSelected = selectedUlpin === parcel.ulpin;
                return (
                  <div
                    key={parcel.ulpin}
                    onClick={() => setSelectedUlpin(parcel.ulpin)}
                    className={`cursor-pointer transition-all ${
                      isSelected ? 'ring-2 ring-primary rounded-card' : ''
                    }`}
                  >
                    <ParcelCard parcel={parcel} />
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="No Matching Parcels"
              description={`No cadastral records found for query "${query}". Try searching with "CH-SEC17-0402" or "Sector 17".`}
              actionLabel="Show All Parcels"
              onAction={() => handleSearch('')}
            />
          )}
        </div>

        {/* Right Column: Interactive Map */}
        <div className="lg:col-span-6 sticky top-4">
          <div className="bg-white rounded-card border border-neutral-200 shadow-subtle p-3">
            <div className="flex items-center justify-between mb-2 text-xs font-semibold text-neutral-800">
              <span className="flex items-center gap-1.5">
                <MapIcon className="w-4 h-4 text-gis" />
                <span>P1 Cadastral Map View</span>
              </span>
              {selectedUlpin && (
                <span className="font-mono text-secondary text-[11px] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Focused: {selectedUlpin}
                </span>
              )}
            </div>

            <ParcelMap
              height={520}
              selectedParcelUlpin={selectedUlpin}
              highlightedParcels={[
                { ulpin: 'CH-SEC17-0402', kind: 'conflict' },
                { ulpin: 'CH-SEC09-1108', kind: 'selected' },
              ]}
              onParcelClick={(ulpin) => {
                setSelectedUlpin(ulpin);
                navigate(`/citizen/parcels/${ulpin}`);
              }}
            />
            <div className="mt-2 text-[11px] text-neutral-400 text-center">
              Click on any parcel polygon to view integrated title details
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
