import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { SLAIndicator, calculateSLA } from '@/components/SLAIndicator';

describe('SLAIndicator Component & Calculation', () => {
  it('correctly calculates resolved state', () => {
    const res = calculateSLA('2026-09-15T00:00:00Z', true);
    expect(res.status).toBe('resolved');
    expect(res.label).toContain('Resolved');
  });

  it('correctly identifies breached SLA when deadline has passed', () => {
    // 5 days in the past
    const pastDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
    const res = calculateSLA(pastDate, false);
    expect(res.status).toBe('breached');
    expect(res.label).toContain('Breached by');
  });

  it('correctly identifies nearing SLA within 72 hours', () => {
    // 24 hours into the future
    const nearDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const res = calculateSLA(nearDate, false);
    expect(res.status).toBe('nearing');
    expect(res.label).toContain('Due in');
  });

  it('renders SLAIndicator component with data-status attribute', () => {
    const futureDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();
    render(<SLAIndicator deadline={futureDate} />);
    const indicator = screen.getByTestId('sla-indicator');
    expect(indicator).toBeInTheDocument();
    expect(indicator.getAttribute('data-status')).toBe('healthy');
  });
});
