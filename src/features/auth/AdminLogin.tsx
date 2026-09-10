import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ShieldAlert, ArrowRight, AlertCircle, KeyRound, Building2 } from 'lucide-react';
import { MOCK_USERS } from '@/api/mock/mockData';
import { Role } from '@/types';

export const AdminLogin: React.FC = () => {
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/admin/dashboard';

  const officerUsers = MOCK_USERS.filter((u) => u.role !== 'CITIZEN');

  const handleSelectOfficer = async (officerId: string, role: Role) => {
    try {
      await login({
        identifier: officerId,
        userType: 'officer',
        requestedRole: role,
      });
      navigate(from, { replace: true });
    } catch {
      // handled
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-card border border-neutral-200 shadow-elevated p-8">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-100">
          <div className="w-10 h-10 rounded bg-neutral-900 text-white flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-neutral-900">Departmental & Admin Access</h1>
            <p className="text-xs text-neutral-500">
              Department of Land Resources | Multi-Departmental Gateway
            </p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded p-3 text-xs text-amber-900 mb-5 leading-relaxed">
          <span className="font-bold block mb-0.5">Role-Based Persona Switcher:</span>
          Select an officer persona to test role-scoped queues and action permissions. (e.g. Revenue Officer sees Revenue cases; Supervisor sees all).
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-2">
          {officerUsers.map((officer) => (
            <button
              key={officer.id}
              type="button"
              disabled={isLoading}
              onClick={() => handleSelectOfficer(officer.id, officer.role)}
              className="w-full text-left p-3 rounded border border-neutral-200 hover:border-primary hover:bg-neutral-50 transition-all flex items-center justify-between group"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-neutral-900 group-hover:text-primary transition-colors">
                    {officer.name}
                  </span>
                  {officer.department && (
                    <span className="text-[10px] bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded font-mono">
                      {officer.department}
                    </span>
                  )}
                </div>
                <div className="text-xs text-neutral-500 mt-0.5 font-medium capitalize">
                  {officer.role.replace(/_/g, ' ')}
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
