import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { notificationService } from '@/api/serviceFactory';
import { StateSelector } from '@/components/StateSelector';
import { LanguageSelector } from '@/components/LanguageSelector';
import {
  LayoutDashboard,
  Search,
  FileCheck2,
  FilePlus,
  Bell,
  User,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const CitizenShell: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: notifications } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => notificationService.getNotifications(user?.id || 'user_cit_01', true),
  });

  const unreadCount = notifications?.length || 0;

  const navItems = [
    { label: t('nav.home', 'Dashboard'), path: '/citizen/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: t('nav.search', 'Parcel Search'), path: '/citizen/parcels/search', icon: <Search className="w-4 h-4" /> },
    { label: t('nav.transactions', 'Transactions'), path: '/citizen/transactions', icon: <FileCheck2 className="w-4 h-4" /> },
    { label: t('nav.serviceRequests', 'Service Requests'), path: '/citizen/service-requests', icon: <FilePlus className="w-4 h-4" /> },
    {
      label: t('nav.notifications', 'Notifications'),
      path: '/citizen/notifications',
      icon: <Bell className="w-4 h-4" />,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    { label: t('nav.profile', 'Profile'), path: '/citizen/profile', icon: <User className="w-4 h-4" /> },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900 font-sans">
      {/* Top Banner */}
      <div className="bg-primary-dark text-white text-[11px] py-1 px-4 flex items-center justify-between border-b border-primary">
        <div className="flex items-center gap-2">
          <span className="font-bold text-amber-300">Citizen Digital Land Portal</span>
          <span className="text-blue-300">|</span>
          <span className="text-neutral-300">Department of Land Resources</span>
        </div>
        <div className="flex items-center gap-3">
          <StateSelector />
          <LanguageSelector />
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-30 shadow-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link to="/citizen/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded bg-primary text-white flex items-center justify-center font-bold text-sm shadow-subtle">
              LS
            </div>
            <div>
              <div className="text-sm font-extrabold text-primary leading-tight">LAND STACK</div>
              <div className="text-[10px] text-neutral-500 font-medium">Citizen Portal</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors relative ${
                    isActive
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right User & Logout */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/citizen/profile"
              className="text-right hover:opacity-80 transition-opacity"
            >
              <div className="text-xs font-bold text-neutral-900 line-clamp-1">{user?.name}</div>
              <div className="text-[10px] text-emerald-700 font-medium">Verified Citizen</div>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="p-2 text-neutral-500 hover:text-rose-600 rounded hover:bg-neutral-100 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
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
          <div className="md:hidden bg-white border-b border-neutral-200 px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between py-2 text-xs font-semibold text-neutral-800"
              >
                <div className="flex items-center gap-2">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
            <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
              <span className="text-xs text-neutral-600 font-medium">{user?.name}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs text-rose-600 font-semibold"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
    </div>
  );
};
