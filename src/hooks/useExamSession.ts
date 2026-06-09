import { ExamSessionQuestion } from "@/models/examSession.model";
import { examService } from "@/services/exam.service";
import { getErrorMessage } from "@/utils/error";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";
import { useCountdownTimer } from "./useCountdownTimer";

/**
 * Quản lý toàn bộ state cục bộ của một phiên thi: tải câu hỏi, lựa chọn đáp án
 * (autosave 1.5s), gắn cờ, đếm ngược + tự nộp khi hết giờ, và nộp bài thủ công.
 */
export function useExamSession(sessionId: string, durationMinutes: number) {
	const router = useRouter();

	const [questions, setQuestions] = useState<ExamSessionQuestion[]>([]);
	const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [answers, setAnswers] = useState<Record<string, string | null>>({});
	const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const isSubmittingRef = useRef(false);

	const submit = useCallback(async () => {
		if (isSubmittingRef.current) return;
		isSubmittingRef.current = true;
		setIsSubmitting(true);

		if (autosaveTimerRef.current) {
			clearTimeout(autosaveTimerRef.current);
			autosaveTimerRef.current = null;
		}

		const result = await examService.submitSession(sessionId);
		if (result.success) {
			router.replace({
				pathname: "/exam-session/result/[id]",
				params: { id: sessionId },
			});
		} else {
			isSubmittingRef.current = false;
			setIsSubmitting(false);
			Alert.alert("Nộp bài thất bại", getErrorMessage(result.code, result.error));
		}
	}, [router, sessionId]);

	useEffect(() => {
		let cancelled = false;
		const load = async () => {
			const result = await examService.getSessionQuestions(sessionId);
			if (cancelled) return;
			if (result.success) {
				const sorted = [...result.data.items].sort(
					(a, b) => a.displayOrder - b.displayOrder,
				);
				setQuestions(sorted);
				const initAnswers: Record<string, string | null> = {};
				const initBookmarks: Record<string, boolean> = {};
				sorted.forEach((q) => {
					initAnswers[q.questionId] = q.selectedOptionId;
					initBookmarks[q.questionId] = q.isBookmarked;
				});
				setAnswers(initAnswers);
				setBookmarks(initBookmarks);
			} else {
				Alert.alert("Không thể tải câu hỏi", getErrorMessage(result.code, result.error), [
					{ text: "Quay lại", onPress: () => router.back() },
				]);
			}
			setIsLoadingQuestions(false);
		};
		load();
		return () => {
			cancelled = true;
		};
	}, [router, sessionId]);

	const remainingSeconds = useCountdownTimer(
		durationMinutes * 60,
		!isLoadingQuestions && !isSubmitting,
		submit,
	);

	const scheduleAutosave = useCallback(
		(questionId: string, selectedOptionId: string | null) => {
			if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
			autosaveTimerRef.current = setTimeout(async () => {
				const res = await examService.saveAnswer(sessionId, {
					questionId,
					selectedOptionId,
				});
				if (
					res.success &&
					(res.data.status === "TIMED_OUT" || res.data.status === "COMPLETED")
				) {
					router.replace({
						pathname: "/exam-session/result/[id]",
						params: { id: sessionId },
					});
				}
			}, 1500);
		},
		[router, sessionId],
	);

	const selectAnswer = useCallback(
		(questionId: string, optionId: string) => {
			const current = answers[questionId] ?? null;
			const next = current === optionId ? null : optionId;
			setAnswers((prev) => ({ ...prev, [questionId]: next }));
			scheduleAutosave(questionId, next);
		},
		[answers, scheduleAutosave],
	);

	const toggleBookmark = useCallback(
		(questionId: string) => {
			const newVal = !bookmarks[questionId];
			setBookmarks((prev) => ({ ...prev, [questionId]: newVal }));
			examService.saveAnswer(sessionId, { questionId, isBookmarked: newVal });
		},
		[bookmarks, sessionId],
	);

	const goToPrev = useCallback(() => {
		setCurrentQuestionIndex((i) => Math.max(0, i - 1));
	}, []);

	const goToNext = useCallback(() => {
		setCurrentQuestionIndex((i) => Math.min(questions.length - 1, i + 1));
	}, [questions.length]);

	const goToIndex = useCallback((index: number) => {
		setCurrentQuestionIndex(index);
	}, []);

	const answeredCount = useMemo(
		() => Object.values(answers).filter((v) => v !== null).length,
		[answers],
	);

	const bookmarkedCount = useMemo(
		() => Object.values(bookmarks).filter(Boolean).length,
		[bookmarks],
	);

	return {
		questions,
		isLoadingQuestions,
		currentQuestionIndex,
		answers,
		bookmarks,
		isSubmitting,
		remainingSeconds,
		answeredCount,
		bookmarkedCount,
		selectAnswer,
		toggleBookmark,
		goToPrev,
		goToNext,
		goToIndex,
		submit,
	};
}
