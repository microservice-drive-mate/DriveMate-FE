import { apiService as api } from '@/lib/api';
import { ENDPOINTS } from '@/constants';
import type { ApiResponse } from '@/types/api.types';
import type { ProgressDashboard, StudyStreak, WeakTopic } from '@/models/analytics.model';
import { withErrorHandling } from '@/utils';

export const analyticsService = {
	getMyProgress: withErrorHandling(() =>
		api.get<ApiResponse<ProgressDashboard>>(ENDPOINTS.ANALYTICS.ME_PROGRESS),
	),
	getMyWeakTopics: withErrorHandling(() =>
		api.get<ApiResponse<WeakTopic[]>>(ENDPOINTS.ANALYTICS.ME_WEAK_TOPICS),
	),
	getMyStudyStreak: withErrorHandling(() =>
		api.get<ApiResponse<StudyStreak>>(ENDPOINTS.ANALYTICS.ME_STUDY_STREAK),
	),
};
