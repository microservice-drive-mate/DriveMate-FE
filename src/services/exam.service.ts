import { apiService as api } from '@/lib/api';
import { ENDPOINTS } from '@/constants';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';
import type {
	ExamTemplate,
	ExamSession,
	ExamSessionQuestion,
	ExamSessionStatus,
	SaveAnswerRequest,
	MissedQuestion,
} from '@/models/examSession.model';
import { withErrorHandling } from '@/utils';

export const examService = {
	getAvailableExams: withErrorHandling((params?: { page?: number; size?: number }) =>
		api.get<ApiResponse<PaginatedResponse<ExamTemplate>>>(ENDPOINTS.EXAMS.AVAILABLE, { params }),
	),

	startSession: withErrorHandling((templateId: string) =>
		api.post<ApiResponse<ExamSession>>(ENDPOINTS.EXAMS.SESSIONS, { templateId }),
	),

	listSessions: withErrorHandling(
		(params?: { page?: number; size?: number; status?: ExamSessionStatus; isPassed?: boolean; from?: string; to?: string }) =>
			api.get<ApiResponse<PaginatedResponse<ExamSession>>>(ENDPOINTS.EXAMS.SESSIONS, { params }),
	),

	getMissedQuestions: withErrorHandling((limit?: number) =>
		api.get<ApiResponse<MissedQuestion[]>>(ENDPOINTS.EXAMS.REVIEW_MISSED_QUESTIONS, {
			params: limit !== undefined ? { limit } : undefined,
		}),
	),

	getSessionQuestions: withErrorHandling((sessionId: string) =>
		api.get<ApiResponse<{ items: ExamSessionQuestion[] }>>(
			ENDPOINTS.EXAMS.SESSION_QUESTIONS(sessionId),
		),
	),

	saveAnswer: withErrorHandling((sessionId: string, req: SaveAnswerRequest) =>
		api.patch<ApiResponse<ExamSession>>(ENDPOINTS.EXAMS.SESSION_ANSWERS(sessionId), req),
	),

	submitSession: withErrorHandling((sessionId: string) =>
		api.post<ApiResponse<ExamSession>>(ENDPOINTS.EXAMS.SESSION_SUBMIT(sessionId), {}),
	),

	getSessionResult: withErrorHandling((sessionId: string) =>
		api.get<ApiResponse<ExamSession>>(ENDPOINTS.EXAMS.SESSION_RESULT(sessionId)),
	),
};
