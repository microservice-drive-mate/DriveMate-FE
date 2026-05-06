import { apiService as api } from '@/lib/api';
import { ENDPOINTS } from '@/constants';
import type { ApiResponse } from '@/types/api.types';
import type { LoginRequest, LoginResponse, RegisterRequest, RefreshTokenResponse } from '@/models/auth.model';
import { withErrorHandling } from '@/utils';

export const authService = {
	login: withErrorHandling((data: LoginRequest) =>
		api.post<ApiResponse<LoginResponse>>(ENDPOINTS.AUTH.LOGIN, data),
	),

	register: withErrorHandling((data: RegisterRequest) =>
		api.post<ApiResponse<LoginResponse>>(ENDPOINTS.AUTH.REGISTER, data),
	),

	refreshToken: withErrorHandling((refreshToken: string) =>
		api.post<ApiResponse<RefreshTokenResponse>>(ENDPOINTS.AUTH.REFRESH, { refreshToken }),
	),

	logout: withErrorHandling((refreshToken: string) =>
		api.post<ApiResponse<{ message: string }>>(ENDPOINTS.AUTH.LOGOUT, { refreshToken }),
	),
};
