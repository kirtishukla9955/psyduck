import React from 'react';
import { DepartmentRecord, DepartmentCode, AIFlag } from '@/types';
import { DepartmentBadge } from './DepartmentBadge';
import { Info, Scale, Cpu, Sparkles, AlertTriangle, Layers } from 'lucide-react';

interface DataComparisonProps {
  records: DepartmentRecord[];
  discrepancySummary?: string;
  aiFlags?: AIFlag[];
  className?: string;
}

export const DataComparison: React.FC<DataComparisonProps> = ({
  records,
  discrepancySummary,
  aiFlags = [],
  className = '',
}) => {
  // Group records by department
  const groupedByDept = records.reduce((acc, record) => {
    if (!acc[record.department]) {
      acc[record.department] = [];
    }
    acc[record.department].push(record);
    return acc;
  }, {} as Record<DepartmentCode, DepartmentRecord[]>);

  const departments = Object.keys(groupedByDept) as DepartmentCode[];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Neutral Trust Engine Discrepancy Explanation */}
      {discrepancySummary && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-card p-4">
          <div className="flex items-start gap-2.5">
            <Scale className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-secondary">
                Land Trust Engine Reconciliation Analysis
              </h4>
              <p className="text-sm text-neutral-800 mt-1 leading-relaxed">
                {discrepancySummary}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Side-by-Side Department Comparison Cards */}
      <div
        className={`grid gap-4 ${
          departments.length <= 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3'
        }`}
      >
        {departments.map((dept) => {
          const deptRecords = groupedByDept[dept];
          return (
            <div
              key={dept}
              className="bg-white rounded-card border border-neutral-200 shadow-subtle overflow-hidden flex flex-col"
            >
              <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-200 flex items-center justify-between">
                <DepartmentBadge department={dept} showFullLabel />
                <span className="text-[11px] text-neutral-400">
                  {deptRecords.length} recorded attributes
                </span>
              </div>

              <div className="p-4 space-y-3 flex-1">
                {deptRecords.map((rec, idx) => (
                  <div key={idx} className="pb-3 border-b border-neutral-100 last:border-b-0 last:pb-0">
                    <div className="text-xs font-medium text-neutral-500">{rec.fieldLabel}</div>
                    <div className="text-sm font-semibold text-neutral-900 mt-0.5 break-words">
                      {rec.value}
                    </div>
                    <div className="text-[10px] text-neutral-400 mt-1">
                      Recorded: {new Date(rec.recordedAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* AI / ML Automated Anomaly Evidence (Presenter 1 Output) */}
      {aiFlags && aiFlags.length > 0 && (
        <div className="bg-indigo-50/70 border border-indigo-200 rounded-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-700" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-950">
                Automated AI / ML Diagnostic Flags (Presenter-1 Pipeline)
              </h4>
            </div>
            <span className="text-[10px] font-semibold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full border border-indigo-200">
              {aiFlags.length} Flag{aiFlags.length > 1 ? 's' : ''} Detected
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {aiFlags.map((flag) => (
              <div
                key={flag.id}
                className="bg-white rounded border border-indigo-200/80 p-3 shadow-xs space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                    <span>{flag.label}</span>
                  </span>
                  {flag.confidence !== undefined && (
                    <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded">
                      {Math.round(flag.confidence * 100)}% Confidence
                    </span>
                  )}
                </div>

                <p className="text-xs text-neutral-700 leading-relaxed">{flag.description}</p>

                <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[10px] text-neutral-500">
                  <span className="flex items-center gap-1">
                    <Layers className="w-3 h-3 text-neutral-400" />
                    <span>{flag.sourceLayer}</span>
                  </span>
                  <span>{new Date(flag.detectedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
