import { examService } from "@/services/exam.service";
import {
	ExamSession,
	ExamSessionStatus,
} from "@/models/examSession.model";
import {
	ExamHistoryAttempt,
	HistoryQuestionState,
} from "@/models/history.model";

const FINISHED_STATUSES: ExamSessionStatus[] = ["COMPLETED", "TIMED_OUT"];

const durationSeconds = (session: ExamSession): number => {
	if (!session.finishedAt) return 0;
	return Math.max(
		0,
		Math.round(
			(new Date(session.finishedAt).getTime() -
				new Date(session.startedAt).getTime()) /
				1000,
		),
	);
};

const toQuestionState = (
	q: ExamSession["questions"][number],
): HistoryQuestionState => {
	if (q.isCorrect === true) return "correct";
	if (!q.selectedOptionId) return "skipped";
	return "wrong";
};

// Maps a finished exam session into the view-model the history screens consume.
// The session payload has no template name, so the title is derived from the
// license tier (e.g. "Đề thi hạng B2"). Per-question correctness (isCorrect) is
// only present on submit/result payloads — getAttemptById uses GET /result so its
// questionStates are accurate; the list view only reads score/total/passed.
export const toAttempt = (session: ExamSession): ExamHistoryAttempt => {
	const total = session.questions.length;
	const score = session.score ?? 0;
	const skippedCount = session.questions.filter((q) => !q.selectedOptionId).length;
	const wrongCount = Math.max(0, total - score - skippedCount);
	const questionStates = [...session.questions]
		.sort((a, b) => a.displayOrder - b.displayOrder)
		.map(toQuestionState);

	return {
		id: session.id,
		title: `Đề thi hạng ${session.licenseCategory}`,
		takenAt: session.finishedAt ?? session.startedAt,
		durationSeconds: durationSeconds(session),
		score,
		totalQuestions: total,
		passed: session.isPassed === true,
		wrongCount,
		skippedCount,
		questionStates,
	};
};

const sortByTakenAtDesc = (a: ExamHistoryAttempt, b: ExamHistoryAttempt) =>
	new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime();

export const historyService = {
	// Returns finished attempts (newest first). Uses server-side status filter
	// to avoid fetching all sessions just to discard in-progress ones.
	getAttempts: async (): Promise<{
		success: boolean;
		items: ExamHistoryAttempt[];
		error?: string;
		code?: string;
	}> => {
		const [completedResult, timedOutResult] = await Promise.all([
			examService.listSessions({ size: 50, status: 'COMPLETED' }),
			examService.listSessions({ size: 50, status: 'TIMED_OUT' }),
		]);

		if (!completedResult.success) {
			return { success: false, items: [], error: completedResult.error, code: completedResult.code };
		}

		const completedItems = completedResult.data.items;
		const timedOutItems = timedOutResult.success ? timedOutResult.data.items : [];

		const items = [...completedItems, ...timedOutItems]
			.filter((s) => FINISHED_STATUSES.includes(s.status))
			.map(toAttempt)
			.sort(sortByTakenAtDesc);

		return { success: true, items };
	},

	getAttemptById: async (
		attemptId: string,
	): Promise<{
		success: boolean;
		attempt?: ExamHistoryAttempt;
		error?: string;
		code?: string;
	}> => {
		const result = await examService.getSessionResult(attemptId);
		if (!result.success) {
			return { success: false, error: result.error, code: result.code };
		}
		return { success: true, attempt: toAttempt(result.data) };
	},
};
