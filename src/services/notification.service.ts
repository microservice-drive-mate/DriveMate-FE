import { apiService as api } from '@/lib/api';
import { ENDPOINTS } from '@/constants';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';
import type { Notification } from '@/models/notification.model';
import { withErrorHandling } from '@/utils';

export const notificationService = {
	getMine: withErrorHandling((params?: { page?: number; size?: number }) =>
		api.get<ApiResponse<PaginatedResponse<Notification>>>(ENDPOINTS.NOTIFICATIONS.ME, { params }),
	),

	markAsRead: withErrorHandling((id: string) =>
		api.patch<ApiResponse<Notification>>(ENDPOINTS.NOTIFICATIONS.MARK_READ(id), {}),
	),

	markAllRead: withErrorHandling(() =>
		api.patch<ApiResponse<{ updated: number }>>(ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ, {}),
	),
};
