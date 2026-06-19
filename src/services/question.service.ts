import { apiService as api } from '@/lib/api';
import { ENDPOINTS } from '@/constants';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';
import type {
  QuestionTopic,
  PracticeQuestion,
  PracticeQuestionsParams,
  ReportQuestionRequest,
} from '@/models/question.model';
import { withErrorHandling } from '@/utils';

export const questionService = {
  getTopics: withErrorHandling(
    (params?: { page?: number; size?: number; parentId?: string }) =>
      api.get<ApiResponse<PaginatedResponse<QuestionTopic>>>(ENDPOINTS.QUESTIONS.TOPICS, {
        params,
      }),
  ),

  getPracticeQuestions: withErrorHandling((params?: PracticeQuestionsParams) =>
    api.get<ApiResponse<PaginatedResponse<PracticeQuestion>>>(ENDPOINTS.QUESTIONS.PRACTICE, {
      params,
    }),
  ),

  reportQuestion: withErrorHandling((id: string, body: ReportQuestionRequest) =>
    api.post<ApiResponse<void>>(ENDPOINTS.QUESTIONS.REPORT(id), body),
  ),
};
