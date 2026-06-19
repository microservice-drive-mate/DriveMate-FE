import { apiService as api } from '@/lib/api';
import { ENDPOINTS } from '@/constants';
import type { ApiResponse } from '@/types/api.types';
import { withErrorHandling } from '@/utils';

interface DeviceRegistration {
	id: string;
	userId: string;
	token: string;
	platform: 'ios' | 'android';
	createdAt: string;
	updatedAt: string;
}

export const deviceTokenService = {
	register: withErrorHandling((token: string, platform: 'ios' | 'android') =>
		api.post<ApiResponse<DeviceRegistration>>(ENDPOINTS.NOTIFICATIONS.REGISTER_DEVICE, {
			token,
			platform,
		}),
	),

	unregister: withErrorHandling((token: string) =>
		api.delete<ApiResponse<void>>(ENDPOINTS.NOTIFICATIONS.UNREGISTER_DEVICE(token)),
	),
};
