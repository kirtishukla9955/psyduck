import React from 'react';
import { AuditEvent } from '@/types';
import { CheckCircle2, Circle, Clock, User, ShieldAlert } from 'lucide-react';

export interface TimelineItem {
  id: string;
  title: string;
  subtitle?: string;
  timestamp?: string;
  description?: string;
  actor?: string;
  actorRole?: string;
  department?: string;
  status?: 'completed' | 'current' | 'upcoming' | 'alert';
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({ items, className = '' }) => {
  return (
    <div className={`flow-root ${className}`}>
      <ul className="-mb-8">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;

          const getIcon = () => {
            if (item.status === 'alert') {
              return (
                <span className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center ring-8 ring-white">
                  <ShieldAlert className="h-4 w-4 text-red-600" />
                </span>
              );
            }
            if (item.status === 'completed') {
              return (
                <span className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center ring-8 ring-white">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </span>
              );
            }
            if (item.status === 'current') {
              return (
                <span className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center ring-8 ring-white">
                  <Clock className="h-4 w-4 text-primary" />
                </span>
              );
            }
            return (
              <span className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center ring-8 ring-white">
                <Circle className="h-3.5 w-3.5 text-neutral-400" />
              </span>
            );
          };

          return (
            <li key={item.id}>
              <div className="relative pb-8">
                {!isLast && (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-neutral-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex space-x-3 items-start">
                  <div>{getIcon()}</div>
                  <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">{item.title}</p>
                      {item.subtitle && (
                        <p className="text-xs text-neutral-500 mt-0.5">{item.subtitle}</p>
                      )}
                      {item.description && (
                        <div className="mt-1.5 text-xs text-neutral-700 bg-neutral-50 p-2.5 rounded border border-neutral-200 leading-relaxed">
                          {item.description}
                        </div>
                      )}
                      {(item.actor || item.actorRole || item.department) && (
                        <div className="mt-1 flex items-center gap-2 text-xs text-neutral-500">
                          <User className="w-3 h-3 text-neutral-400" />
                          <span>
                            {item.actor || item.actorRole}
                            {item.department ? ` (${item.department})` : ''}
                          </span>
                        </div>
                      )}
                    </div>
                    {item.timestamp && (
                      <div className="text-right text-xs whitespace-nowrap text-neutral-400">
                        <time dateTime={item.timestamp}>
                          {new Date(item.timestamp).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </time>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
