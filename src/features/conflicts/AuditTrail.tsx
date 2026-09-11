import React from 'react';
import { AuditEvent } from '@/types';
import { Timeline, TimelineItem } from '@/components/Timeline';
import { ShieldCheck } from 'lucide-react';

interface AuditTrailProps {
  events: AuditEvent[];
  className?: string;
}

export const AuditTrail: React.FC<AuditTrailProps> = ({ events, className = '' }) => {
  // Map AuditEvents to TimelineItems in chronological or reverse-chronological order
  const items: TimelineItem[] = [...events].reverse().map((evt) => {
    let statusChangeText = '';
    if (evt.statusChangeFrom || evt.statusChangeTo) {
      statusChangeText = `Status: ${evt.statusChangeFrom || 'Initial'} → ${evt.statusChangeTo || 'Updated'}`;
    }

    return {
      id: evt.id,
      title: evt.action,
      subtitle: statusChangeText,
      description: evt.note,
      timestamp: evt.timestamp,
      actor: evt.actorId,
      actorRole: evt.actorRole,
      department: evt.department,
      status: evt.action.toLowerCase().includes('resolve') ? 'completed' : 'current',
    };
  });

  return (
    <div className={`bg-white rounded-card border border-neutral-200 p-5 ${className}`}>
      <div className="flex items-center gap-2 pb-4 mb-4 border-b border-neutral-100">
        <ShieldCheck className="w-5 h-5 text-primary" />
        <div>
          <h3 className="text-sm font-bold text-neutral-900">Official Chain of Custody & Audit Trail</h3>
          <p className="text-xs text-neutral-500">
            Immutable log of system alerts, officer endorsements, and status transitions
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-neutral-500 italic py-4">No audit events recorded yet.</p>
      ) : (
        <Timeline items={items} />
      )}
    </div>
  );
};
