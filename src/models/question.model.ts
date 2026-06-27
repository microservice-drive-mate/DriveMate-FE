import type { LicenseCategory } from '@/models/examSession.model';

export interface QuestionTopic {
  id: string;
  name: string;
  description: string | null;
  parentId: string | null;
  createdAt: string;
}

export type QuestionType = 'THEORY' | 'TRAFFIC_SIGN' | 'SCENARIO_RELATED';
export type QuestionDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface PracticeQuestionOption {
  id: string;
  content: string;
  displayOrder: number;
}

// Student-safe: no explanation, isCorrect per option, isCritical, or versioning.
// correctOptionId is not in spec; included by backend for practice answer feedback if available.
export interface PracticeQuestion {
  id: string;
  content: string;
  type: QuestionType;
  licenseCategories: LicenseCategory[];
  difficulty: QuestionDifficulty;
  imageUrl: string | null;
  mediaFileId: string | null;
  topicId: string;
  correctOptionId?: string | null;
  options: PracticeQuestionOption[];
}

export interface PracticeQuestionsParams {
  page?: number;
  size?: number;
  topicId?: string;
  licenseCategory?: LicenseCategory;
  type?: QuestionType;
  difficulty?: QuestionDifficulty;
  keyword?: string;
}

export interface ReportQuestionRequest {
  reason: 'WRONG_ANSWER';
  message: string;
}
