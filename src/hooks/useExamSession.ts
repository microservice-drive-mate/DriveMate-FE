import { ExamSessionQuestion } from "@/models/examSession.model";
import { examService } from "@/services/exam.service";
import { getErrorMessage } from "@/utils/error";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";
import { useCountdownTimer } from "./useCountdownTimer";

/**
 * Quản lý toàn bộ state cục bộ của một phiên thi: tải câu hỏi, lựa chọn đáp án
 * (autosave 1.5s theo từng câu), gắn cờ, đếm ngược + tự nộp khi hết giờ, và nộp
 * bài thủ công. Khi nộp, mọi đáp án chưa lưu được flush và chờ xác nhận trước khi
 * finalize để không mất câu trả lời lúc làm nhanh hoặc mạng chập chờn.
 */
export function useExamSession(sessionId: string, expiresAt: string) {
	const router = useRouter();

	const [questions, setQuestions] = useState<ExamSessionQuestion[]>([]);
	const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [answers, setAnswers] = useState<Record<string, string | null>>({});
	const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Giá trị mới nhất của mọi câu — đọc đồng bộ để logic toggle không bị stale.
	const latestAnswersRef = useRef<Record<string, string | null>>({});
	// Mỗi câu một timer debounce riêng để chọn câu khác không huỷ lưu câu trước.
	const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
	// Các câu đã đổi nhưng chưa xác nhận lưu thành công (cần gửi lại khi nộp).
	const dirtyRef = useRef<Set<string>>(new Set());
	// Các request lưu đang bay, để submit chờ hoàn tất trước khi finalize.
	const inFlightRef = useRef<Set<Promise<unknown>>>(new Set());
	const isSubmittingRef = useRef(false);

	const navigateToResult = useCallback(() => {
		router.replace({
			pathname: "/exam-session/result/[id]",
			params: { id: sessionId },
		});
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
				latestAnswersRef.current = { ...initAnswers };
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

	// Gửi đáp án mới nhất của 1 câu lên server; theo dõi dirty + in-flight.
	const persistAnswer = useCallback(
		(questionId: string) => {
			const value = latestAnswersRef.current[questionId] ?? null;
			const promise = examService
				.saveAnswer(sessionId, { questionId, selectedOptionId: value })
				.then((res) => {
					if (res.success) {
						// Chỉ bỏ cờ dirty nếu giá trị chưa bị đổi tiếp trong lúc đang gửi.
						if ((latestAnswersRef.current[questionId] ?? null) === value) {
							dirtyRef.current.delete(questionId);
						}
						if (res.data.status === "TIMED_OUT" || res.data.status === "COMPLETED") {
							navigateToResult();
						}
					}
					// Lỗi: giữ nguyên trong dirtyRef để gửi lại khi nộp bài.
					return res;
				});
			inFlightRef.current.add(promise);
			promise.finally(() => {
				inFlightRef.current.delete(promise);
			});
			return promise;
		},
		[sessionId, navigateToResult],
	);

	// Debounce 1.5s theo TỪNG câu: chọn câu khác không huỷ lưu câu trước.
	const scheduleAutosave = useCallback(
		(questionId: string) => {
			dirtyRef.current.add(questionId);
			const existing = timersRef.current.get(questionId);
			if (existing) clearTimeout(existing);
			const timer = setTimeout(() => {
				timersRef.current.delete(questionId);
				persistAnswer(questionId);
			}, 1500);
			timersRef.current.set(questionId, timer);
		},
		[persistAnswer],
	);

	const selectAnswer = useCallback(
		(questionId: string, optionId: string) => {
			const current = latestAnswersRef.current[questionId] ?? null;
			const next = current === optionId ? null : optionId;
			latestAnswersRef.current[questionId] = next;
			setAnswers((prev) => ({ ...prev, [questionId]: next }));
			scheduleAutosave(questionId);
		},
		[scheduleAutosave],
	);

	// Gửi ngay mọi đáp án chưa lưu và chờ tất cả request hoàn tất.
	// Trả về true nếu không còn câu nào ở trạng thái dirty.
	const flushPendingSaves = useCallback(async () => {
		timersRef.current.forEach(clearTimeout);
		timersRef.current.clear();

		const pending = [...dirtyRef.current].map((questionId) =>
			persistAnswer(questionId),
		);
		await Promise.all(pending);
		await Promise.all([...inFlightRef.current]);

		return dirtyRef.current.size === 0;
	}, [persistAnswer]);

	const submit = useCallback(async () => {
		if (isSubmittingRef.current) return;
		isSubmittingRef.current = true;
		setIsSubmitting(true);

		const allSaved = await flushPendingSaves();
		if (!allSaved) {
			isSubmittingRef.current = false;
			setIsSubmitting(false);
			Alert.alert(
				"Chưa thể nộp bài",
				"Một số đáp án chưa được lưu (có thể do mạng). Vui lòng kiểm tra kết nối và thử lại.",
			);
			return;
		}

		const result = await examService.submitSession(sessionId);
		if (result.success) {
			navigateToResult();
		} else {
			isSubmittingRef.current = false;
			setIsSubmitting(false);
			Alert.alert("Nộp bài thất bại", getErrorMessage(result.code, result.error));
		}
	}, [flushPendingSaves, navigateToResult, sessionId]);

	const remainingSeconds = useCountdownTimer(
		new Date(expiresAt).getTime(),
		!isLoadingQuestions && !isSubmitting,
		submit,
	);

	// Dọn mọi timer debounce còn treo khi rời màn hình.
	useEffect(
		() => () => {
			timersRef.current.forEach(clearTimeout);
			timersRef.current.clear();
		},
		[],
	);

	const toggleBookmark = useCallback(
		(questionId: string) => {
			const newVal = !bookmarks[questionId];
			setBookmarks((prev) => ({ ...prev, [questionId]: newVal }));
			const promise = examService.saveAnswer(sessionId, {
				questionId,
				isBookmarked: newVal,
			});
			inFlightRef.current.add(promise);
			promise.finally(() => {
				inFlightRef.current.delete(promise);
			});
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
