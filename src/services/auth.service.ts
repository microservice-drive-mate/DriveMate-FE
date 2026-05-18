import { apiService as api } from '@/lib/api';
import { ENDPOINTS } from '@/constants';
import type { ApiResponse } from '@/types/api.types';
import type {
	LoginRequest,
	LoginResponse,
	RefreshTokenResponse,
	ForgotPasswordRequest,
	ForgotPasswordResponse,
} from '@/models/auth.model';
import { withErrorHandling } from '@/utils';

export const authService = {
	login: withErrorHandling((data: LoginRequest) =>
		api.post<ApiResponse<LoginResponse>>(ENDPOINTS.AUTH.LOGIN, data),
	),

	refreshToken: withErrorHandling((refreshToken: string) =>
		api.post<ApiResponse<RefreshTokenResponse>>(ENDPOINTS.AUTH.REFRESH, { refreshToken }),
	),

	logout: withErrorHandling((refreshToken: string) =>
		api.post<ApiResponse<{ success: boolean; message: string; instruction: string }>>(
			ENDPOINTS.AUTH.LOGOUT,
			{ refreshToken },
		),
	),

	forgotPassword: withErrorHandling((data: ForgotPasswordRequest) =>
		api.post<ApiResponse<ForgotPasswordResponse>>(ENDPOINTS.AUTH.FORGOT_PASSWORD, data),
	),
};
