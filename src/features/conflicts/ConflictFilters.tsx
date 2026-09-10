import React from 'react';
import { ConflictFilterParams } from '@/api/contracts/conflict.contract';
import { Search, RotateCcw, Filter } from 'lucide-react';
import { ConflictStatus, ConflictSeverity, ConflictType, DepartmentCode } from '@/types';

interface ConflictFiltersProps {
  filters: ConflictFilterParams;
  onChange: (filters: ConflictFilterParams) => void;
  onReset: () => void;
  className?: string;
}

export const ConflictFilters: React.FC<ConflictFiltersProps> = ({
  filters,
  onChange,
  onReset,
  className = '',
}) => {
  const update = (key: keyof ConflictFilterParams, val: any) => {
    onChange({
      ...filters,
      [key]: val,
    });
  };

  return (
    <div className={`bg-white rounded-card border border-neutral-200 p-4 space-y-3 ${className}`}>
      <div className="flex flex-wrap items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by Conflict ID, ULPIN, location..."
            value={filters.query || ''}
            onChange={(e) => update('query', e.target.value)}
            className="w-full text-xs py-2 pl-9 pr-3 rounded border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-primary"
            data-testid="conflict-search-input"
          />
        </div>

        {/* Reset Button */}
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 text-xs text-neutral-600 hover:text-neutral-900 px-3 py-2 border border-neutral-300 rounded hover:bg-neutral-50 transition-colors"
          title="Reset filters"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 pt-2 border-t border-neutral-100 text-xs">
        {/* Status */}
        <div>
          <label className="block text-[11px] font-medium text-neutral-500 mb-1">Status</label>
          <select
            value={filters.status || 'all'}
            onChange={(e) => update('status', e.target.value)}
            className="w-full border border-neutral-300 rounded p-1.5 bg-white text-neutral-800 focus:outline-none focus:ring-1 focus:ring-primary"
            data-testid="filter-status"
          >
            <option value="all">All Statuses</option>
            <option value="detected">Detected</option>
            <option value="assigned">Assigned</option>
            <option value="under_review">Under Review</option>
            <option value="verification">Verification</option>
            <option value="decision">Decision</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Department */}
        <div>
          <label className="block text-[11px] font-medium text-neutral-500 mb-1">Department</label>
          <select
            value={filters.department || 'all'}
            onChange={(e) => update('department', e.target.value)}
            className="w-full border border-neutral-300 rounded p-1.5 bg-white text-neutral-800 focus:outline-none focus:ring-1 focus:ring-primary"
            data-testid="filter-department"
          >
            <option value="all">All Departments</option>
            <option value="REVENUE">Revenue</option>
            <option value="REGISTRATION">Registration</option>
            <option value="SURVEY_SETTLEMENT">Survey & Settlement</option>
            <option value="URBAN_DEV">Urban Development</option>
          </select>
        </div>

        {/* Severity */}
        <div>
          <label className="block text-[11px] font-medium text-neutral-500 mb-1">Severity</label>
          <select
            value={filters.severity || 'all'}
            onChange={(e) => update('severity', e.target.value)}
            className="w-full border border-neutral-300 rounded p-1.5 bg-white text-neutral-800 focus:outline-none focus:ring-1 focus:ring-primary"
            data-testid="filter-severity"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* SLA State */}
        <div>
          <label className="block text-[11px] font-medium text-neutral-500 mb-1">SLA Health</label>
          <select
            value={filters.slaState || 'all'}
            onChange={(e) => update('slaState', e.target.value)}
            className="w-full border border-neutral-300 rounded p-1.5 bg-white text-neutral-800 focus:outline-none focus:ring-1 focus:ring-primary"
            data-testid="filter-sla"
          >
            <option value="all">All SLA States</option>
            <option value="healthy">On Track</option>
            <option value="nearing">Nearing Deadline (&lt;72h)</option>
            <option value="breached">SLA Breached</option>
          </select>
        </div>

        {/* Conflict Type */}
        <div>
          <label className="block text-[11px] font-medium text-neutral-500 mb-1">Conflict Type</label>
          <select
            value={filters.type || 'all'}
            onChange={(e) => update('type', e.target.value)}
            className="w-full border border-neutral-300 rounded p-1.5 bg-white text-neutral-800 focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Types</option>
            <option value="owner_name_mismatch">Owner Mismatch</option>
            <option value="mutation_sla_breach">Mutation SLA Breach</option>
            <option value="spatial_inconsistency">Spatial Inconsistency</option>
            <option value="land_use_inconsistency">Land-Use Conflict</option>
            <option value="outdated_record">Outdated Record</option>
          </select>
        </div>
      </div>
    </div>
  );
};
