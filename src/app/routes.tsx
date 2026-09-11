import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Shells
import { PublicShell } from '@/shells/PublicShell';
import { CitizenShell } from '@/shells/CitizenShell';
import { AdminShell } from '@/shells/AdminShell';

// Auth Guards & Pages
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { CitizenLogin } from '@/features/auth/CitizenLogin';
import { AdminLogin } from '@/features/auth/AdminLogin';
import { Unauthorized } from '@/features/auth/Unauthorized';

// Public Pages
import { LandingPage } from '@/features/public/LandingPage';
import { PublicSearchPage } from '@/features/public/PublicSearchPage';
import { HelpFaqPage } from '@/features/public/HelpFaqPage';

// Citizen Pages
import { CitizenDashboard } from '@/features/citizen/dashboard/CitizenDashboard';
import { ParcelSearchPage } from '@/features/citizen/parcelSearch/ParcelSearchPage';
import { ParcelDetailsPage } from '@/features/citizen/parcelDetails/ParcelDetailsPage';
import { OwnershipVerificationPage } from '@/features/citizen/ownershipVerification/OwnershipVerificationPage';
import { TransactionListPage } from '@/features/citizen/transactions/TransactionListPage';
import { TransactionDetailPage } from '@/features/citizen/transactions/TransactionDetailPage';
import { ServiceRequestListPage } from '@/features/citizen/serviceRequests/ServiceRequestListPage';
import { NewServiceRequestPage } from '@/features/citizen/serviceRequests/NewServiceRequestPage';
import { ServiceRequestDetailPage } from '@/features/citizen/serviceRequests/ServiceRequestDetailPage';
import { NotificationCenterPage } from '@/features/citizen/notifications/NotificationCenterPage';
import { CitizenProfilePage } from '@/features/citizen/profile/CitizenProfilePage';

// Admin Pages
import { AdminDashboardHome } from '@/features/admin/dashboardHome/AdminDashboardHome';
import { ConflictQueuePage } from '@/features/admin/conflictQueue/ConflictQueuePage';
import { ConflictDetailPage } from '@/features/admin/conflictDetail/ConflictDetailPage';
import { DecisionMakerPage } from '@/features/admin/decisionMakerView/DecisionMakerPage';
import { AdminSettingsPage } from '@/features/admin/settings/AdminSettingsPage';

export const router = createBrowserRouter([
  // Public Routes wrapped in PublicShell
  {
    path: '/',
    element: <PublicShell />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'login', element: <CitizenLogin /> },
      { path: 'admin/login', element: <AdminLogin /> },
      { path: 'search', element: <PublicSearchPage /> },
      { path: 'help', element: <HelpFaqPage /> },
      { path: 'unauthorized', element: <Unauthorized /> },
    ],
  },

  // Citizen Protected Routes
  {
    path: '/citizen',
    element: <ProtectedRoute allowedRoles={['CITIZEN']} redirectTo="/login" />,
    children: [
      {
        element: <CitizenShell />,
        children: [
          { index: true, element: <Navigate to="/citizen/dashboard" replace /> },
          { path: 'dashboard', element: <CitizenDashboard /> },
          { path: 'parcels/search', element: <ParcelSearchPage /> },
          { path: 'parcels/:ulpin', element: <ParcelDetailsPage /> },
          { path: 'parcels/:ulpin/verification', element: <OwnershipVerificationPage /> },
          { path: 'transactions', element: <TransactionListPage /> },
          { path: 'transactions/:id', element: <TransactionDetailPage /> },
          { path: 'service-requests', element: <ServiceRequestListPage /> },
          { path: 'service-requests/new', element: <NewServiceRequestPage /> },
          { path: 'service-requests/:id', element: <ServiceRequestDetailPage /> },
          { path: 'notifications', element: <NotificationCenterPage /> },
          { path: 'profile', element: <CitizenProfilePage /> },
        ],
      },
    ],
  },

  // Admin Protected Routes
  {
    path: '/admin',
    element: (
      <ProtectedRoute
        allowedRoles={[
          'REVENUE_OFFICER',
          'REGISTRATION_OFFICER',
          'SURVEY_SETTLEMENT_OFFICER',
          'URBAN_DEV_OFFICER',
          'DEPARTMENT_SUPERVISOR',
          'SYSTEM_ADMIN',
        ]}
        redirectTo="/admin/login"
      />
    ),
    children: [
      {
        element: <AdminShell />,
        children: [
          { index: true, element: <Navigate to="/admin/dashboard" replace /> },
          { path: 'dashboard', element: <AdminDashboardHome /> },
          { path: 'conflicts', element: <ConflictQueuePage /> },
          { path: 'conflicts/:id', element: <ConflictDetailPage /> },
          { path: 'decision-maker', element: <DecisionMakerPage /> },
          { path: 'settings', element: <AdminSettingsPage /> },
        ],
      },
    ],
  },

  // 404 Catch-All
  {
    path: '*',
    element: (
      <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-50 text-center">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">404 - Page Not Found</h1>
          <p className="text-sm text-neutral-500 mb-4">
            The requested parcel or portal endpoint does not exist.
          </p>
          <a
            href="/"
            className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded hover:bg-primary-dark"
          >
            Return to Land Stack
          </a>
        </div>
      </div>
    ),
  },
]);
