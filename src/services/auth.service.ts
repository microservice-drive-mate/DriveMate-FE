import api from './api';
import { ENDPOINTS } from '@/constants/api';
import { LoginRequest, LoginResponse, RegisterRequest, RefreshTokenResponse } from '@/models/auth.model';

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>(ENDPOINTS.AUTH.LOGIN, data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>(ENDPOINTS.AUTH.REGISTER, data);
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const response = await api.post<RefreshTokenResponse>(ENDPOINTS.AUTH.REFRESH, { refreshToken });
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post(ENDPOINTS.AUTH.LOGOUT);
  },
};
