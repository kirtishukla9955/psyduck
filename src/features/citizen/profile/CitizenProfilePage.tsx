import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { citizenService } from '@/api/serviceFactory';
import { useAuth } from '@/hooks/useAuth';
import { useStateConfig } from '@/hooks/useStateConfig';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { StateSelector } from '@/components/StateSelector';
import { LanguageSelector } from '@/components/LanguageSelector';
import { User, ShieldCheck, LogOut, Key, Globe, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CitizenProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const { currentStateCode, config } = useStateConfig();

  const { data: citizen, isLoading } = useQuery({
    queryKey: ['citizen', 'me'],
    queryFn: () => citizenService.getCurrentCitizen(),
  });

  if (isLoading) {
    return <LoadingSkeleton type="detail" />;
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Breadcrumbs
        items={[{ label: 'Citizen Portal', href: '/citizen/dashboard' }, { label: 'Citizen Profile' }]}
      />

      <div className="bg-white rounded-card border border-neutral-200 p-6 shadow-subtle">
        <div className="flex items-center gap-4 pb-6 border-b border-neutral-100">
          <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">
            {user?.name?.charAt(0) || 'C'}
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900">{user?.name || citizen?.name}</h1>
            <p className="text-xs text-neutral-500">Citizen ID: {user?.id || citizen?.id}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[11px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-medium border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>e-KYC Verified Citizen</span>
              </span>
            </div>
          </div>
        </div>

        {/* Linked Parcels */}
        <div className="py-5 border-b border-neutral-100">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
            Linked Land Parcels
          </h2>
          <div className="flex flex-wrap gap-2">
            {citizen?.linkedParcels.map((ulpin) => (
              <Link
                key={ulpin}
                to={`/citizen/parcels/${ulpin}`}
                className="font-mono text-xs font-semibold text-primary bg-blue-50/70 border border-blue-200 px-3 py-1.5 rounded hover:bg-blue-100 transition-colors"
              >
                {ulpin}
              </Link>
            ))}
          </div>
        </div>

        {/* Preferences */}
        <div className="py-5 border-b border-neutral-100 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            Regional & Language Preferences
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-neutral-50 rounded border border-neutral-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-secondary" />
                <div>
                  <span className="font-semibold text-neutral-800 block">Active State Portal</span>
                  <span className="text-[11px] text-neutral-500">{config.displayName}</span>
                </div>
              </div>
              <StateSelector />
            </div>

            <div className="p-3 bg-neutral-50 rounded border border-neutral-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                <div>
                  <span className="font-semibold text-neutral-800 block">Preferred Language</span>
                  <span className="text-[11px] text-neutral-500">Multilingual UI</span>
                </div>
              </div>
              <LanguageSelector />
            </div>
          </div>
        </div>

        {/* Session / Security Controls */}
        <div className="pt-5 flex items-center justify-between">
          <div className="text-xs text-neutral-500">
            Current Session: <span className="font-mono text-neutral-700">Authenticated Demo Token</span>
          </div>
          <button
            type="button"
            onClick={() => logout()}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded text-xs font-semibold border border-rose-200 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
