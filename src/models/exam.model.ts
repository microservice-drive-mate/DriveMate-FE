export type LicenseClass = 'B1' | 'B2' | 'A1' | 'A2' | 'C';
export type ExamType = 'on-tap' | 'sat-hach';

export interface ExamQuestion {
  id: string;
  questionNumber: number;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  isCritical?: boolean;
  explanation?: string;
}

export interface Exam {
  id: string;
  licenseClass: LicenseClass;
  examType: ExamType;
  name: string;
  totalQuestions: number;
  durationMinutes: number;
  attemptCount: number;
  passRate: number;
  hasCriticalQuestions: boolean;
  questions: ExamQuestion[];
}
