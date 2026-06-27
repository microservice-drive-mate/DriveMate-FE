import { API_CONFIG, AUTH_CONFIG, ENDPOINTS, ROUTES } from '@/constants';
import type { ApiResponse } from '@/types/api.types';
import type { LoginResponse } from '@/models/auth.model';
import {
	getAuthToken,
	getStorageItem,
	logError,
	parseError,
	removeAuthToken,
	removeRefreshToken,
	removeUserData,
	setStorageItem,
	shouldLogout,
} from '@/utils';
import { clearPracticeAnswers } from '@/utils/storage';
import { clearAnswersCache } from '@/utils/practiceAnswersCache';

import { router } from 'expo-router';

import axios, {
	type AxiosError,
	type AxiosInstance,
	type AxiosRequestConfig,
	type AxiosResponse,
	type InternalAxiosRequestConfig,
} from 'axios';

type RetryableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

class ApiService {
	private baseUrl: string;
	private api: AxiosInstance;
	private isRefreshing: boolean = false;
	private failedQueue: {
		resolve: (token: string) => void;
		reject: (reason: unknown) => void;
	}[] = [];
	private _logoutCallback: (() => void) | null = null;

	setLogoutCallback(callback: () => void) {
		this._logoutCallback = callback;
	}

	constructor() {
		this.baseUrl = API_CONFIG.BASE_URL;
		this.api = this._createAxiosInstance();
		this._setupInterceptors();
	}

	private _createAxiosInstance() {
		return axios.create({
			baseURL: this.baseUrl,
			timeout: API_CONFIG.TIMEOUT,
			headers: {
				'Content-Type': 'application/json',
			},
		});
	}

	private _setupInterceptors() {
		this._setupRequestInterceptor();
		this._setupResponseInterceptor();
	}

	private _setupRequestInterceptor() {
		this.api.interceptors.request.use(
			async (config: InternalAxiosRequestConfig) => {
				if (!this._isLoginEndpoint(config.url) && !this._isRefreshEndpoint(config.url)) {
					const token = await getAuthToken();
					if (token) {
						config.headers.Authorization = `Bearer ${token}`;
					}
				}
				return config;
			},
			(error: AxiosError) => {
				const parsedError = parseError(error);
				logError(parsedError, { context: 'api.request' });
				return Promise.reject(parsedError);
			},
		);
	}

	private _setupResponseInterceptor() {
		this.api.interceptors.response.use(
			(response: AxiosResponse) => response,
			async (error: AxiosError) => {
				const originalRequest = error.config as RetryableRequestConfig;
				const parsedError = parseError(error);

				// Login và change-password tự xử lý lỗi 401 ở tầng UI (sai mật khẩu),
				// không kích hoạt luồng auto-refresh/logout của interceptor.
				if (
					this._isLoginEndpoint(originalRequest?.url) ||
					this._isChangePasswordEndpoint(originalRequest?.url)
				) {
					logError(parsedError, { context: 'api.response' });
					return Promise.reject(error);
				}

				if (parsedError.status === 401 && !originalRequest._retry) {
					if (this.isRefreshing) {
						return new Promise((resolve, reject) => {
							this.failedQueue.push({ resolve, reject });
						})
							.then((token) => {
								originalRequest.headers.Authorization = `Bearer ${token}`;
								return this.api(originalRequest);
							})
							.catch((err) => Promise.reject(err));
					}

					originalRequest._retry = true;
					this.isRefreshing = true;

					const refreshToken = await getStorageItem<string>(AUTH_CONFIG.REFRESH_TOKEN_KEY);
					if (!refreshToken) {
						this.isRefreshing = false;
						this._handleLogout();
						return Promise.reject(error);
					}

					try {
						const refreshResponse = await this._performTokenRefresh(refreshToken);

						if (refreshResponse.data.success === true && refreshResponse.data.data) {
							const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
								refreshResponse.data.data;
							await setStorageItem(AUTH_CONFIG.ACCESS_TOKEN_KEY, newAccessToken);
							if (newRefreshToken) {
								await setStorageItem(AUTH_CONFIG.REFRESH_TOKEN_KEY, newRefreshToken);
							}

							originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
							this._processQueue(null, newAccessToken);
							this.isRefreshing = false;

							return this.api(originalRequest);
						} else {
							this._processQueue(error, null);
							this.isRefreshing = false;
							this._handleLogout();
							return Promise.reject(error);
						}
					} catch (refreshError) {
						logError(parseError(refreshError), { context: 'api.refresh' });
						this._processQueue(refreshError, null);
						this.isRefreshing = false;
						this._handleLogout();
						return Promise.reject(refreshError);
					}
				}

				if (shouldLogout(parsedError)) {
					this._handleLogout();
				}

				logError(parsedError, { context: 'api.response' });
				return Promise.reject(error);
			},
		);
	}

	private _processQueue(error: unknown, token: string | null = null) {
		this.failedQueue.forEach((prom) => {
			if (error) {
				prom.reject(error);
			} else {
				prom.resolve(token ?? '');
			}
		});
		this.failedQueue = [];
	}

	private _isLoginEndpoint(url: string | undefined) {
		return url?.endsWith('/login');
	}

	private _isRefreshEndpoint(url: string | undefined) {
		return url?.includes('refresh');
	}

	private _isChangePasswordEndpoint(url: string | undefined) {
		return url?.endsWith('/change-password');
	}

	private async _performTokenRefresh(refreshToken: string) {
		return axios.post<ApiResponse<LoginResponse>>(
			`${this.baseUrl}${ENDPOINTS.AUTH.REFRESH}`,
			{ refreshToken },
		);
	}

	private async _handleLogout() {
		await Promise.all([
			removeAuthToken(),
			removeRefreshToken(),
			removeUserData(),
			clearPracticeAnswers(),
		]);
		clearAnswersCache();
		this._logoutCallback?.();
		router.replace(ROUTES.LOGIN);
	}

	get<T = unknown>(url: string, config?: AxiosRequestConfig) {
		return this.api.get<T>(url, config);
	}

	post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) {
		return this.api.post<T>(url, data, config);
	}

	put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) {
		return this.api.put<T>(url, data, config);
	}

	patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) {
		return this.api.patch<T>(url, data, config);
	}

	delete<T = unknown>(url: string, config?: AxiosRequestConfig) {
		return this.api.delete<T>(url, config);
	}
}

export const apiService = new ApiService();
