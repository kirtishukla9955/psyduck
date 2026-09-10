import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ConflictFilters } from '@/features/conflicts/ConflictFilters';
import { ConflictFilterParams } from '@/api/contracts/conflict.contract';

describe('ConflictFilters Component', () => {
  const initialFilters: ConflictFilterParams = {
    query: '',
    status: 'all',
    department: 'all',
    severity: 'all',
    slaState: 'all',
  };

  it('triggers onChange when search query changes', () => {
    const handleChange = vi.fn();
    const handleReset = vi.fn();

    render(
      <ConflictFilters
        filters={initialFilters}
        onChange={handleChange}
        onReset={handleReset}
      />
    );

    const input = screen.getByTestId('conflict-search-input');
    fireEvent.change(input, { target: { value: 'CONF-CH' } });

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        query: 'CONF-CH',
      })
    );
  });

  it('triggers onChange when department select changes', () => {
    const handleChange = vi.fn();
    const handleReset = vi.fn();

    render(
      <ConflictFilters
        filters={initialFilters}
        onChange={handleChange}
        onReset={handleReset}
      />
    );

    const select = screen.getByTestId('filter-department');
    fireEvent.change(select, { target: { value: 'REVENUE' } });

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        department: 'REVENUE',
      })
    );
  });

  it('calls onReset when reset button is clicked', () => {
    const handleChange = vi.fn();
    const handleReset = vi.fn();

    render(
      <ConflictFilters
        filters={initialFilters}
        onChange={handleChange}
        onReset={handleReset}
      />
    );

    const resetBtn = screen.getByTitle('Reset filters');
    fireEvent.click(resetBtn);

    expect(handleReset).toHaveBeenCalledTimes(1);
  });
});
