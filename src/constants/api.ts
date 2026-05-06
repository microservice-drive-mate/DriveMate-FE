import { Platform } from 'react-native';

export const API_CONFIG = {
	BASE_URL: Platform.select({
		android: 'http://10.0.2.2:3000/api',
		ios: 'http://localhost:3000/api',
		default: 'http://10.0.2.2:3000/api',
	})!,
	TIMEOUT: 10000,
};

export const AUTH_CONFIG = {
	ACCESS_TOKEN_KEY: 'drivemate_access_token',
	REFRESH_TOKEN_KEY: 'drivemate_refresh_token',
	USER_KEY: 'drivemate_user',
	ONBOARDING_KEY: 'drivemate_onboarding_seen',
};

export const ENDPOINTS = {
	AUTH: {
		LOGIN: '/auth/login',
		REGISTER: '/auth/register',
		REFRESH: '/auth/refresh',
		LOGOUT: '/auth/logout',
	},
};

export const ERROR_CODES = {
	BAD_REQUEST: 'BAD_REQUEST',
	UNAUTHORIZED: 'UNAUTHORIZED',
	FORBIDDEN: 'FORBIDDEN',
	NOT_FOUND: 'NOT_FOUND',
	VALIDATION_ERROR: 'VALIDATION_ERROR',
	CONFLICT: 'CONFLICT',
	TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
	SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
	INTERNAL_ERROR: 'INTERNAL_ERROR',
	NETWORK_ERROR: 'NETWORK_ERROR',
};

export const ERROR_MESSAGES = {
	NETWORK_ERROR: 'Không có kết nối mạng. Vui lòng kiểm tra và thử lại.',
	UNAUTHORIZED: 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.',
	FORBIDDEN: 'Bạn không có quyền thực hiện thao tác này.',
	SERVER_ERROR: 'Lỗi máy chủ. Vui lòng thử lại sau.',
	VALIDATION_FAILED: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.',
	LOGIN_FAILED: 'Email hoặc mật khẩu không đúng. Vui lòng thử lại.',
	GENERIC_ERROR: 'Có lỗi xảy ra. Vui lòng thử lại.',
	BAD_REQUEST: 'Yêu cầu không hợp lệ. Vui lòng kiểm tra lại.',
	NOT_FOUND: 'Không tìm thấy dữ liệu.',
	CONFLICT: 'Xảy ra xung đột với yêu cầu của bạn. Vui lòng thử lại.',
	TOO_MANY_REQUESTS: 'Quá nhiều yêu cầu. Vui lòng chờ và thử lại.',
	SERVICE_UNAVAILABLE: 'Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau.',
	INTERNAL_ERROR: 'Lỗi nội bộ. Vui lòng thử lại sau.',
};

export const ROUTES = {
	LOGIN: '/(auth)/login' as const,
	FORGOT_PASSWORD: '/(auth)/forgot-password' as const,
	TABS: '/(tabs)' as const,
	ONBOARDING: '/(onboarding)' as const,
};
