import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { StateSelector } from '@/components/StateSelector';
import { LanguageSelector } from '@/components/LanguageSelector';
import { ShieldCheck, Search, HelpCircle, UserCheck, Building2, Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const PublicShell: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900 font-sans">
      {/* Top Official Banner */}
      <div className="bg-neutral-900 text-neutral-300 text-[11px] py-1.5 px-4 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white">Smart India Hackathon 2026</span>
          <span className="text-neutral-500">|</span>
          <span>Department of Land Resources, Government of India</span>
        </div>
        <div className="flex items-center gap-3">
          <StateSelector />
          <LanguageSelector />
        </div>
      </div>

      {/* Main Top Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-30 shadow-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded bg-primary text-white flex items-center justify-center font-bold text-lg shadow-subtle group-hover:bg-primary-dark transition-colors">
              LS
            </div>
            <div>
              <div className="text-base font-extrabold tracking-tight text-primary leading-tight">
                LAND STACK
              </div>
              <div className="text-[10px] font-medium text-neutral-500 line-clamp-1">
                Integrated GIS-Based Land Public Infrastructure
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-neutral-700">
            <Link
              to="/search"
              className={`hover:text-primary transition-colors flex items-center gap-1.5 ${
                location.pathname === '/search' ? 'text-primary font-bold' : ''
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Public Parcel Search</span>
            </Link>

            <Link
              to="/help"
              className={`hover:text-primary transition-colors flex items-center gap-1.5 ${
                location.pathname === '/help' ? 'text-primary font-bold' : ''
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Help & Glossary</span>
            </Link>
          </nav>

          {/* Desktop Auth Entry Points */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-primary hover:bg-neutral-100 rounded border border-neutral-300 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Citizen Portal</span>
            </Link>

            <Link
              to="/admin/login"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded shadow-subtle transition-colors"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Official / Admin Login</span>
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-neutral-600 rounded hover:bg-neutral-100"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-b border-neutral-200 px-4 py-4 space-y-3">
            <Link
              to="/search"
              onClick={() => setMobileOpen(false)}
              className="block text-xs font-semibold text-neutral-800 py-1.5"
            >
              Public Parcel Search
            </Link>
            <Link
              to="/help"
              onClick={() => setMobileOpen(false)}
              className="block text-xs font-semibold text-neutral-800 py-1.5"
            >
              Help & Glossary
            </Link>
            <div className="pt-2 border-t border-neutral-100 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="w-full text-center py-2 text-xs font-semibold text-primary border border-neutral-300 rounded"
              >
                Citizen Portal Login
              </Link>
              <Link
                to="/admin/login"
                onClick={() => setMobileOpen(false)}
                className="w-full text-center py-2 text-xs font-semibold text-white bg-primary rounded"
              >
                Official / Admin Login
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Outlet */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-400 text-xs py-8 border-t border-neutral-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-white font-bold text-sm">LAND STACK</div>
            <div className="text-[11px] text-neutral-500 mt-0.5">
              Integrated GIS-Based Digital Public Infrastructure for Land Governance
            </div>
            <div className="text-[10px] text-neutral-600 mt-1">
              Piloted in Chandigarh (UT) & Tamil Nadu | Department of Land Resources
            </div>
          </div>
          <div className="flex items-center gap-6 text-[11px]">
            <Link to="/search" className="hover:text-white transition-colors">
              Parcel Lookup
            </Link>
            <Link to="/help" className="hover:text-white transition-colors">
              Glossary & Terms
            </Link>
            <Link to="/login" className="hover:text-white transition-colors">
              Citizen Gateway
            </Link>
            <Link to="/admin/login" className="hover:text-white transition-colors">
              Officer Gateway
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
