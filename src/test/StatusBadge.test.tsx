import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { StatusBadge } from '@/components/StatusBadge';

describe('StatusBadge Component', () => {
  it('renders resolved status correctly with label', () => {
    render(<StatusBadge status="resolved" />);
    const badge = screen.getByRole('status');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('Resolved');
  });

  it('renders critical severity with alert class', () => {
    render(<StatusBadge status="critical" />);
    const badge = screen.getByRole('status');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('Critical');
  });

  it('renders custom label when provided', () => {
    render(<StatusBadge status="detected" label="Custom Alert State" />);
    const badge = screen.getByRole('status');
    expect(badge).toHaveTextContent('Custom Alert State');
  });
});
