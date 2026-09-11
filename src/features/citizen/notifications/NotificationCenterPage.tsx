import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/api/serviceFactory';
import { useAuth } from '@/hooks/useAuth';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { EmptyState } from '@/components/EmptyState';
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  FileText,
  Clock,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { Notification } from '@/types';

export const NotificationCenterPage: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.id || 'user_cit_01';
  const queryClient = useQueryClient();
  const [filterUnread, setFilterUnread] = useState(false);

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications', userId, filterUnread],
    queryFn: () => notificationService.getNotifications(userId, filterUnread),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'conflict':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'transaction':
        return <FileText className="w-4 h-4 text-primary" />;
      case 'sla':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'verification':
      default:
        return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[{ label: 'Citizen Portal', href: '/citizen/dashboard' }, { label: 'Notification Center' }]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Notifications & Alerts</h1>
          <p className="text-xs text-neutral-500">
            Real-time status updates, title alerts, and statutory SLA timeline notifications
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-neutral-600 cursor-pointer">
            <input
              type="checkbox"
              checked={filterUnread}
              onChange={(e) => setFilterUnread(e.target.checked)}
              className="rounded text-primary focus:ring-0"
            />
            <span>Unread Only</span>
          </label>

          <button
            type="button"
            onClick={() => markAllMutation.mutate()}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-dark px-3 py-1.5 rounded border border-neutral-300 hover:bg-neutral-50 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark All Read</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton type="list" count={4} />
      ) : notifications && notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-card border transition-all flex items-start justify-between gap-4 ${
                notif.read
                  ? 'bg-white border-neutral-200 text-neutral-600'
                  : 'bg-blue-50/50 border-blue-200 text-neutral-900 shadow-subtle'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-full mt-0.5 ${
                    notif.read ? 'bg-neutral-100' : 'bg-white border border-blue-200 shadow-xs'
                  }`}
                >
                  {getIcon(notif.type)}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold capitalize">
                      {notif.type.replace(/_/g, ' ')} Alert
                    </span>
                    {!notif.read && (
                      <span className="inline-block w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <p className="text-xs mt-1 text-neutral-800 leading-relaxed">{notif.message}</p>
                  <div className="flex items-center gap-3 text-[11px] text-neutral-400 mt-2">
                    <span>{new Date(notif.createdAt).toLocaleString()}</span>
                    {notif.relatedUlpin && (
                      <span className="font-mono text-secondary">ULPIN: {notif.relatedUlpin}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {notif.link && (
                  <Link
                    to={notif.link}
                    className="p-1.5 text-neutral-500 hover:text-primary rounded hover:bg-neutral-100 transition-colors"
                    title="View related record"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                )}
                {!notif.read && (
                  <button
                    type="button"
                    onClick={() => markReadMutation.mutate(notif.id)}
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    Mark Read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Notifications"
          description="You're all caught up! There are no unread notifications or alerts."
        />
      )}
    </div>
  );
};
