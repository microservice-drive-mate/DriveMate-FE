export type LicenseCategory = 'A1' | 'A2' | 'B1' | 'B2' | 'C' | 'D' | 'E' | 'F';
export type ExamSessionStatus = 'IN_PROGRESS' | 'COMPLETED' | 'TIMED_OUT' | 'CANCELLED';

export interface ExamTemplate {
  id: string;
  name: string;
  description?: string | null;
  licenseCategory: LicenseCategory;
  totalQuestions: number;
  passingScore: number;
  durationMinutes: number;
  criticalQuestions: number;
  maxCriticalMistakes: number;
  shuffleQuestions: boolean;
  topicDistribution?: Array<{ topicId: string; questionCount: number }>;
}

export interface QuestionOption {
  id: string;
  content: string;
  displayOrder: number;
}

export interface ExamSessionQuestion {
  questionId: string;
  content: string;
  imageUrl?: string | null;
  mediaFileId?: string | null;
  options: QuestionOption[];
  displayOrder: number;
  isBookmarked: boolean;
  selectedOptionId: string | null;
  // Only present in submit/result payloads; omitted for active sessions & question list.
  isCorrect?: boolean;
  correctOptionId?: string | null;
}

// Full session object returned by POST /exams/sessions (start), POST .../submit,
// GET .../result, and each item of GET /exams/sessions. `score`/`isPassed` are null
// while IN_PROGRESS; `questions[].isCorrect` only appears on submit/result.
export interface ExamSession {
  id: string;
  studentId: string;
  templateId: string;
  licenseCategory: LicenseCategory;
  status: ExamSessionStatus;
  score: number | null;
  isPassed: boolean | null;
  failedByCritical: boolean;
  criticalMistakes: number;
  maxCriticalMistakes: number;
  startedAt: string;
  finishedAt: string | null;
  expiresAt: string;
  questions: ExamSessionQuestion[];
}

export interface SaveAnswerRequest {
  questionId: string;
  selectedOptionId?: string | null;
  isBookmarked?: boolean;
}

export interface MissedQuestionOption {
  id: string;
  content: string;
  displayOrder: number;
}

export type MissedQuestionsMode = 'frequent' | 'recent';

export interface MissedQuestionsQuery {
  limit?: number;
  size?: number;
  periodDays?: number;
  period?: number;
  mode?: MissedQuestionsMode;
}

export interface MissedQuestion {
  questionId: string;
  content: string;
  imageUrl?: string | null;
  mediaFileId?: string | null;
  options: MissedQuestionOption[];
  missedCount: number;
  lastAnsweredAt: string;
}

export interface MissedQuestionsResponse {
  items: MissedQuestion[];
}
