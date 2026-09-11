import { Notification } from '@/types';

export interface NotificationService {
  getNotifications(userId: string, unreadOnly?: boolean): Promise<Notification[]>;
  markAsRead(id: string): Promise<Notification>;
  markAllAsRead(userId: string): Promise<void>;
}
