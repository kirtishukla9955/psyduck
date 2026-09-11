import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const Unauthorized: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-card border border-neutral-200 shadow-elevated p-8 text-center">
        <div className="w-14 h-14 mx-auto rounded-full bg-rose-100 flex items-center justify-center text-rose-600 mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h1 className="text-xl font-bold text-neutral-900 mb-2">Access Restricted</h1>
        <p className="text-sm text-neutral-600 mb-4">
          Your current session persona (
          <span className="font-semibold text-neutral-800">{user?.role || 'Guest'}</span>
          ) does not have authorization to access this departmental view or perform this action.
        </p>

        <div className="bg-neutral-50 rounded p-3 text-xs text-neutral-500 mb-6 text-left border border-neutral-200">
          <div className="font-semibold text-neutral-700 mb-1">Role-Based Security Policy:</div>
          <div>Departmental officers are restricted to their authorized departmental workflows. Supervisors and System Administrators hold elevated cross-departmental permissions.</div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go Back</span>
          </button>
          <Link
            to={user?.role === 'CITIZEN' ? '/citizen/dashboard' : '/admin/dashboard'}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Dashboard Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
