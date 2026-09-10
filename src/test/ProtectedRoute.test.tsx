import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';

describe('ProtectedRoute Guard', () => {
  beforeEach(() => {
    useAuth.getState().logout();
  });

  it('redirects unauthenticated user to redirect path', () => {
    render(
      <MemoryRouter initialEntries={['/citizen/dashboard']}>
        <Routes>
          <Route path="/login" element={<div>Citizen Login Screen</div>} />
          <Route element={<ProtectedRoute allowedRoles={['CITIZEN']} redirectTo="/login" />}>
            <Route path="/citizen/dashboard" element={<div>Protected Dashboard</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Citizen Login Screen')).toBeInTheDocument();
    expect(screen.queryByText('Protected Dashboard')).not.toBeInTheDocument();
  });

  it('allows access when user has the allowed role', () => {
    useAuth.getState().setUser({
      id: 'cit_01',
      name: 'Test Citizen',
      role: 'CITIZEN',
    });

    render(
      <MemoryRouter initialEntries={['/citizen/dashboard']}>
        <Routes>
          <Route path="/login" element={<div>Citizen Login Screen</div>} />
          <Route element={<ProtectedRoute allowedRoles={['CITIZEN']} redirectTo="/login" />}>
            <Route path="/citizen/dashboard" element={<div>Protected Dashboard</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Protected Dashboard')).toBeInTheDocument();
  });

  it('renders Unauthorized when role does not match', () => {
    useAuth.getState().setUser({
      id: 'officer_01',
      name: 'Test Officer',
      role: 'REVENUE_OFFICER',
    });

    render(
      <MemoryRouter initialEntries={['/citizen/dashboard']}>
        <Routes>
          <Route element={<ProtectedRoute allowedRoles={['CITIZEN']} />}>
            <Route path="/citizen/dashboard" element={<div>Protected Dashboard</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Access Restricted')).toBeInTheDocument();
    expect(screen.queryByText('Protected Dashboard')).not.toBeInTheDocument();
  });
});
