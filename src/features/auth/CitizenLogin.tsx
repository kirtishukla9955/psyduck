import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ShieldCheck, UserCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { MOCK_CITIZENS } from '@/api/mock/mockData';

export const CitizenLogin: React.FC = () => {
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/citizen/dashboard';

  const [identifier, setIdentifier] = useState('user_cit_01');

  const handleDemoSelect = async (citizenId: string) => {
    try {
      await login({
        identifier: citizenId,
        userType: 'citizen',
        requestedRole: 'CITIZEN',
      });
      navigate(from, { replace: true });
    } catch {
      // handled by store
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({
        identifier,
        userType: 'citizen',
        requestedRole: 'CITIZEN',
      });
      navigate(from, { replace: true });
    } catch {
      // handled by store
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-card border border-neutral-200 shadow-elevated p-8">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-100">
          <div className="w-10 h-10 rounded bg-primary text-white flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-neutral-900">Citizen Digital Land Access</h1>
            <p className="text-xs text-neutral-500">ULPIN-linked Title Verification & Services</p>
          </div>
        </div>

        {/* Demo Adapter Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-900 mb-5 leading-relaxed">
          <span className="font-bold block mb-0.5">Demo Auth Adapter:</span>
          Select a verified citizen persona below to immediately experience the citizen journey with live linked parcels.
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Quick Persona Buttons */}
        <div className="space-y-2 mb-6">
          <label className="block text-xs font-semibold text-neutral-700">Quick Demo Citizens</label>
          {MOCK_CITIZENS.map((cit) => (
            <button
              key={cit.id}
              type="button"
              disabled={isLoading}
              onClick={() => handleDemoSelect(cit.id)}
              className="w-full text-left p-3 rounded border border-neutral-200 hover:border-primary hover:bg-neutral-50 transition-all flex items-center justify-between group"
            >
              <div>
                <div className="text-sm font-semibold text-neutral-900 group-hover:text-primary transition-colors">
                  {cit.name}
                </div>
                <div className="text-xs text-neutral-500 mt-0.5">
                  Linked Parcels: {cit.linkedParcels.join(', ')}
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </button>
          ))}
        </div>

        {/* Manual Form */}
        <form onSubmit={handleFormSubmit} className="pt-4 border-t border-neutral-200 space-y-3">
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Or Enter Citizen ID / Email
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full text-sm p-2.5 rounded border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="e.g. user_cit_01"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-primary hover:bg-primary-dark text-white text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5"
          >
            <UserCheck className="w-4 h-4" />
            <span>{isLoading ? 'Authenticating...' : 'Enter Citizen Portal'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
