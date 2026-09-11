import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useStateConfig } from '@/hooks/useStateConfig';
import { citizenService, transactionService, serviceRequestService, notificationService } from '@/api/serviceFactory';
import { SearchBar } from '@/components/SearchBar';
import { ParcelCard } from '@/features/parcels/ParcelCard';
import { StatusBadge } from '@/components/StatusBadge';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { EmptyState } from '@/components/EmptyState';
import {
  ShieldAlert,
  Clock,
  ArrowRight,
  Layers,
  FileCheck2,
  Bell,
  FilePlus,
  AlertTriangle,
} from 'lucide-react';

export const CitizenDashboard: React.FC = () => {
  const { user } = useAuth();
  const { getRorTerm } = useStateConfig();
  const navigate = useNavigate();

  // Queries
  const { data: citizen, isLoading: citLoading } = useQuery({
    queryKey: ['citizen', 'me'],
    queryFn: () => citizenService.getCurrentCitizen(),
  });

  const { data: myParcels, isLoading: parcelsLoading } = useQuery({
    queryKey: ['citizen', 'myParcels'],
    queryFn: () => citizenService.getMyParcels(),
  });

  const { data: transactions } = useQuery({
    queryKey: ['transactions', user?.id],
    queryFn: () => transactionService.getTransactions(),
  });

  const { data: serviceRequests } = useQuery({
    queryKey: ['serviceRequests', user?.id],
    queryFn: () => serviceRequestService.getServiceRequests(),
  });

  const { data: notifications } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => notificationService.getNotifications(user?.id || 'user_cit_01', true),
  });

  const handleSearch = (q: string) => {
    navigate(`/citizen/parcels/search?query=${encodeURIComponent(q)}`);
  };

  const activeTransactions = transactions?.filter((t) => t.status !== 'resolved') || [];
  const activeRequests = serviceRequests?.filter((sr) => sr.status !== 'resolved') || [];
  const unreadNotifs = notifications || [];

  return (
    <div className="space-y-6">
      {/* Welcome & Search Hero */}
      <div className="bg-primary text-white rounded-card p-6 md:p-8 shadow-elevated">
        <div className="max-w-3xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
            Citizen Digital Land Access
          </span>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-1 mb-2">
            Welcome, {user?.name || citizen?.name}
          </h1>
          <p className="text-sm text-neutral-200 mb-6">
            Directly inspect your land titles, track mutations, verify {getRorTerm()} records, and reconcile cross-departmental records.
          </p>

          <SearchBar
            onSearch={handleSearch}
            placeholder="Search by ULPIN (e.g. CH-SEC17-0402) or locality..."
            size="lg"
          />
        </div>
      </div>

      {/* Action Required Alert (if any notifications / conflicts exist) */}
      {unreadNotifs.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-card p-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-rose-900">
                Action / Discrepancy Alert ({unreadNotifs.length} unread notification{unreadNotifs.length > 1 ? 's' : ''})
              </h3>
              <p className="text-xs text-rose-700 mt-0.5">
                {unreadNotifs[0].message}
              </p>
            </div>
          </div>
          <Link
            to="/citizen/notifications"
            className="text-xs font-semibold text-rose-900 hover:text-rose-700 flex items-center gap-1 flex-shrink-0"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* My Parcels Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">My Linked Parcels</h2>
            <p className="text-xs text-neutral-500">
              Land parcels anchored to your registered citizen profile
            </p>
          </div>
          <Link
            to="/citizen/parcels/search"
            className="text-xs font-semibold text-primary hover:text-primary-dark flex items-center gap-1"
          >
            <span>Explore All Parcels</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {parcelsLoading ? (
          <LoadingSkeleton type="card" count={2} />
        ) : myParcels && myParcels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myParcels.map((parcel) => (
              <ParcelCard key={parcel.ulpin} parcel={parcel} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Linked Parcels Found"
            description="You do not have any parcels linked to your citizen profile yet. Search by ULPIN to view or claim."
            actionLabel="Search Parcels"
            onAction={() => navigate('/citizen/parcels/search')}
          />
        )}
      </div>

      {/* Two Column Section: Active Transactions & Pending Service Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Transactions */}
        <div className="bg-white rounded-card border border-neutral-200 p-5 shadow-subtle">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-3">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-neutral-900">Active Transactions & Mutations</h3>
            </div>
            <Link
              to="/citizen/transactions"
              className="text-xs font-semibold text-primary hover:underline"
            >
              View History
            </Link>
          </div>

          {activeTransactions.length > 0 ? (
            <div className="space-y-3">
              {activeTransactions.slice(0, 3).map((tx) => (
                <div
                  key={tx.id}
                  onClick={() => navigate(`/citizen/transactions/${tx.id}`)}
                  className="p-3 rounded border border-neutral-100 hover:border-neutral-200 bg-neutral-50/70 hover:bg-neutral-50 transition-all cursor-pointer flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-neutral-900">{tx.id}</span>
                      <span className="text-[10px] font-mono text-secondary">{tx.parcelUlpin}</span>
                    </div>
                    <div className="text-xs text-neutral-500 mt-1">
                      Stage: <span className="font-medium text-neutral-700">{tx.currentStage}</span>
                    </div>
                  </div>
                  <StatusBadge status={tx.status} size="sm" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-neutral-500 py-4 text-center">
              No active transactions or mutation requests in progress.
            </p>
          )}
        </div>

        {/* Service Requests */}
        <div className="bg-white rounded-card border border-neutral-200 p-5 shadow-subtle">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-3">
            <div className="flex items-center gap-2">
              <FilePlus className="w-4 h-4 text-secondary" />
              <h3 className="text-sm font-bold text-neutral-900">Pending Citizen Requests</h3>
            </div>
            <Link
              to="/citizen/service-requests/new"
              className="text-xs font-semibold text-secondary hover:underline"
            >
              + New Request
            </Link>
          </div>

          {activeRequests.length > 0 ? (
            <div className="space-y-3">
              {activeRequests.slice(0, 3).map((sr) => (
                <div
                  key={sr.id}
                  onClick={() => navigate(`/citizen/service-requests/${sr.id}`)}
                  className="p-3 rounded border border-neutral-100 hover:border-neutral-200 bg-neutral-50/70 hover:bg-neutral-50 transition-all cursor-pointer flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-neutral-900">{sr.id}</span>
                      <span className="text-[10px] capitalize bg-neutral-200 text-neutral-700 px-1.5 py-0.5 rounded">
                        {sr.category.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="text-xs text-neutral-600 mt-1 line-clamp-1">
                      {sr.description}
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-neutral-600 capitalize">
                    {sr.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-xs text-neutral-500 mb-2">No pending service requests.</p>
              <Link
                to="/citizen/service-requests/new"
                className="text-xs font-semibold text-primary hover:underline"
              >
                Apply for Fard, Boundary Demarcation or Clarification →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
