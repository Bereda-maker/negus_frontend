import api from './api';
import { Pagination } from '@/types';
import { NotificationType } from '@/utils/constants';

export interface AppNotification {
  _id: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
  [key: string]: unknown;
}

export interface NotificationQueryParams {
  page?: number;
  limit?: number;
  [key: string]: unknown;
}

const notificationService = {
  getMyNotifications: (
    params?: NotificationQueryParams
  ): Promise<{ data: AppNotification[]; pagination: Pagination }> =>
    api.get('/notifications', { params }).then((res) => res.data),
  markAsRead: (id: string): Promise<unknown> => api.patch(`/notifications/${id}/read`).then((res) => res.data),
  markAllAsRead: (): Promise<unknown> => api.patch('/notifications/read-all').then((res) => res.data),
};

export default notificationService;
