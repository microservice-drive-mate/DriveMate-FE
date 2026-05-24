import { apiService as api } from '@/lib/api';
import { ENDPOINTS } from '@/constants';
import type { ApiResponse } from '@/types/api.types';
import type { ProgressDashboard } from '@/models/analytics.model';
import { withErrorHandling } from '@/utils';

export const analyticsService = {
	getMyProgress: withErrorHandling(() =>
		api.get<ApiResponse<ProgressDashboard>>(ENDPOINTS.ANALYTICS.ME_PROGRESS),
	),
};
