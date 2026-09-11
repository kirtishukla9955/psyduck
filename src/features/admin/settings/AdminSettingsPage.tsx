import React, { useState } from 'react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { mockStore } from '@/api/mock/mockStore';
import { Role, User } from '@/types';
import { ShieldCheck, UserPlus, RefreshCw, Key } from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>(mockStore.getUsers());
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const handleRoleChange = (userId: string, newRole: Role) => {
    const updated = users.map((u) => (u.id === userId ? { ...u, role: newRole } : u));
    setUsers(updated);
  };

  const handleResetStore = () => {
    mockStore.resetToDefaults();
    setUsers(mockStore.getUsers());
    setResetMessage('State store reset to original demo configuration.');
    setTimeout(() => setResetMessage(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Breadcrumbs
        items={[{ label: 'Admin Portal', href: '/admin/dashboard' }, { label: 'System Administration' }]}
      />

      <div className="bg-white rounded-card border border-neutral-200 p-6 shadow-subtle">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
              Root Administration
            </span>
            <h1 className="text-xl font-bold text-neutral-900 mt-0.5">
              Role & Departmental Access Control
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              Configure officer permissions, departmental scopes, and reset demo datasets
            </p>
          </div>

          <button
            type="button"
            onClick={handleResetStore}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded border border-neutral-200 transition-colors flex-shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Mock Store to Defaults</span>
          </button>
        </div>

        {resetMessage && (
          <div className="my-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-xs font-semibold">
            {resetMessage}
          </div>
        )}

        {/* User Role Table */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-neutral-200 text-neutral-500 font-semibold uppercase text-[10px] bg-neutral-50">
                <th className="py-2.5 px-3">User & ID</th>
                <th className="py-2.5 px-3">Email Address</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Assigned Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-neutral-50">
                  <td className="py-3 px-3">
                    <div className="font-semibold text-neutral-900">{u.name}</div>
                    <div className="text-[10px] font-mono text-neutral-400">{u.id}</div>
                  </td>
                  <td className="py-3 px-3 text-neutral-600">{u.email || '—'}</td>
                  <td className="py-3 px-3">
                    <span className="font-mono text-neutral-700">{u.department || 'All / General'}</span>
                  </td>
                  <td className="py-3 px-3">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                      className="border border-neutral-300 rounded p-1 text-xs bg-white text-neutral-800 focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="CITIZEN">Citizen</option>
                      <option value="REVENUE_OFFICER">Revenue Officer</option>
                      <option value="REGISTRATION_OFFICER">Registration Officer</option>
                      <option value="SURVEY_SETTLEMENT_OFFICER">Survey & Settlement Officer</option>
                      <option value="URBAN_DEV_OFFICER">Urban Development Officer</option>
                      <option value="DEPARTMENT_SUPERVISOR">Department Supervisor</option>
                      <option value="SYSTEM_ADMIN">System Administrator</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
