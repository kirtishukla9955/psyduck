import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePermission } from '@/hooks/usePermission';
import { StateSelector } from '@/components/StateSelector';
import { LanguageSelector } from '@/components/LanguageSelector';
import { DepartmentBadge } from '@/features/conflicts/DepartmentBadge';
import {
  LayoutDashboard,
  ShieldAlert,
  BarChart3,
  Settings,
  LogOut,
  Building2,
  Menu,
  X,
  UserCheck,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const AdminShell: React.FC = () => {
  const { user, logout } = useAuth();
  const { can } = usePermission();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navItems = [
    {
      label: 'Operational Dashboard',
      path: '/admin/dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
      show: true,
    },
    {
      label: 'Conflict Queue',
      path: '/admin/conflicts',
      icon: <ShieldAlert className="w-4 h-4" />,
      show: true,
    },
    {
      label: 'Decision-Maker Analytics',
      path: '/admin/decision-maker',
      icon: <BarChart3 className="w-4 h-4" />,
      show: can('dashboard:decision_maker_view'),
    },
    {
      label: 'System Settings',
      path: '/admin/settings',
      icon: <Settings className="w-4 h-4" />,
      show: can('admin:manage_users'),
    },
  ].filter((item) => item.show);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-100 text-neutral-900 font-sans">
      {/* Top Operations Header */}
      <header className="bg-neutral-900 text-white border-b border-neutral-800 sticky top-0 z-30 shadow-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/admin/dashboard" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-gis text-white flex items-center justify-center font-bold text-xs">
                LS
              </div>
              <div>
                <div className="text-xs font-extrabold tracking-wider uppercase text-white">
                  dharaa <span className="text-neutral-400 font-normal">ADMIN</span>
                </div>
              </div>
            </Link>

            {/* Desktop Nav Tabs */}
            <nav className="hidden md:flex items-center gap-1 ml-4 text-xs">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path || (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-1.5 rounded font-medium flex items-center gap-1.5 transition-colors ${
                      isActive
                        ? 'bg-neutral-800 text-white font-semibold shadow-xs'
                        : 'text-neutral-300 hover:text-white hover:bg-neutral-800/60'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Controls */}
          <div className="hidden md:flex items-center gap-3">
            <StateSelector />
            <LanguageSelector />

            <div className="h-4 w-px bg-neutral-700 mx-1" />

            <div className="text-right">
              <div className="text-xs font-semibold text-white leading-tight">{user?.name}</div>
              <div className="text-[10px] text-neutral-400 capitalize">
                {user?.role.replace(/_/g, ' ')}
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-1.5 text-neutral-300 rounded hover:bg-neutral-800"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="md:hidden bg-neutral-900 border-b border-neutral-800 px-4 py-3 space-y-2 text-xs">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 py-1.5 text-neutral-200 hover:text-white"
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
            <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
              <div className="text-neutral-300">{user?.name}</div>
              <button
                type="button"
                onClick={handleLogout}
                className="text-rose-400 font-semibold"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
    </div>
  );
};
