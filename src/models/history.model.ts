export type HistoryFilterStatus = "all" | "passed" | "failed";

export type HistoryQuestionState = "correct" | "wrong" | "skipped";

export interface ExamHistoryAttempt {
	id: string;
	title: string;
	takenAt: string;
	durationSeconds: number;
	score: number;
	totalQuestions: number;
	passed: boolean;
	wrongCount: number;
	skippedCount: number;
	questionStates: HistoryQuestionState[];
}

export interface ExamHistoryStats {
	total: number;
	passed: number;
	failed: number;
}
