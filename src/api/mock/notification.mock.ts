import { NotificationService } from '../contracts/notification.contract';
import { mockStore } from './mockStore';
import { Notification } from '@/types';

const delay = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms));

export class MockNotificationService implements NotificationService {
  async getNotifications(userId: string, unreadOnly = false): Promise<Notification[]> {
    await delay();
    let list = mockStore.getNotifications(userId);
    if (unreadOnly) {
      list = list.filter((n) => !n.read);
    }
    return list;
  }

  async markAsRead(id: string): Promise<Notification> {
    await delay();
    const notif = mockStore.markNotificationAsRead(id);
    if (!notif) {
      throw new Error(`Notification ${id} not found.`);
    }
    return notif;
  }

  async markAllAsRead(userId: string): Promise<void> {
    await delay();
    mockStore.markAllNotificationsAsRead(userId);
  }
}
