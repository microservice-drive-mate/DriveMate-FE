import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { MediaImage } from "@/components/common/MediaImage";
import { StatBox } from "@/components/common/StatBox";
import { OptionCard } from "@/components/exam/OptionCard";
import { AUTH_UI } from "@/constants/auth-ui";
import { ERROR_MESSAGES } from "@/constants/api";
import { ExamSessionQuestion } from "@/models/examSession.model";
import { examService } from "@/services/exam.service";
import { ms, s, vs } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
	ActivityIndicator,
	Alert,
	Animated,
	Modal,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

const QUESTIONS_PER_GROUP = 4;

const formatTime = (seconds: number) => {
	const m = Math.floor(seconds / 60);
	const s = seconds % 60;
	return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

export default function ExamTakeScreen() {
	const { id, durationMinutes: durationParam } = useLocalSearchParams<{
		id: string;
		durationMinutes: string;
	}>();
	const router = useRouter();
	const sessionId = id ?? "";
	const durationMinutes = parseInt(durationParam ?? "20", 10);

	const [questions, setQuestions] = useState<ExamSessionQuestion[]>([]);
	const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [answers, setAnswers] = useState<Record<string, string | null>>({});
	const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({});
	const [remainingSeconds, setRemainingSeconds] = useState(durationMinutes * 60);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const [showNavSheet, setShowNavSheet] = useState(false);
	const [showSubmitSheet, setShowSubmitSheet] = useState(false);

	const navSheetAnim = useRef(new Animated.Value(0)).current;
	const submitSheetAnim = useRef(new Animated.Value(0)).current;
	const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const isSubmittingRef = useRef(false);

	const handleSubmit = useCallback(async () => {
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
			const message =
				ERROR_MESSAGES[result.code as keyof typeof ERROR_MESSAGES] ?? result.error;
			Alert.alert("Nộp bài thất bại", message);
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
				const message =
					ERROR_MESSAGES[result.code as keyof typeof ERROR_MESSAGES] ?? result.error;
				Alert.alert("Không thể tải câu hỏi", message, [
					{ text: "Quay lại", onPress: () => router.back() },
				]);
			}
			setIsLoadingQuestions(false);
		};
		load();
		return () => { cancelled = true; };
	}, [router, sessionId]);

	useEffect(() => {
		if (isLoadingQuestions || isSubmittingRef.current) return;
		if (remainingSeconds <= 0) {
			handleSubmit();
			return;
		}
		const timer = setInterval(() => {
			setRemainingSeconds((prev) => Math.max(0, prev - 1));
		}, 1000);
		return () => clearInterval(timer);
	}, [handleSubmit, remainingSeconds, isLoadingQuestions]);

	const openSheet = (anim: Animated.Value, setter: (v: boolean) => void) => {
		setter(true);
		Animated.spring(anim, {
			toValue: 1,
			useNativeDriver: true,
			tension: 65,
			friction: 11,
		}).start();
	};

	const closeSheet = (
		anim: Animated.Value,
		setter: (v: boolean) => void,
		cb?: () => void,
	) => {
		Animated.timing(anim, {
			toValue: 0,
			duration: 200,
			useNativeDriver: true,
		}).start(() => {
			setter(false);
			cb?.();
		});
	};

	const handleBack = () => {
		Alert.alert(
			"Bạn có chắc muốn thoát?",
			"Tiến độ bài thi sẽ bị mất nếu thoát.",
			[
				{ text: "Ở lại", style: "cancel" },
				{ text: "Thoát", style: "destructive", onPress: () => router.back() },
			],
		);
	};

	const scheduleAutosave = (questionId: string, selectedOptionId: string | null) => {
		if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
		autosaveTimerRef.current = setTimeout(async () => {
			const res = await examService.saveAnswer(sessionId, { questionId, selectedOptionId });
			if (res.success && (res.data.status === 'TIMED_OUT' || res.data.status === 'COMPLETED')) {
				router.replace({
					pathname: '/exam-session/result/[id]',
					params: { id: sessionId },
				});
			}
		}, 1500);
	};

	const handleAnswerSelect = (questionId: string, optionId: string) => {
		const current = answers[questionId] ?? null;
		const next = current === optionId ? null : optionId;
		setAnswers((prev) => ({ ...prev, [questionId]: next }));
		scheduleAutosave(questionId, next);
	};

	const handleToggleBookmark = (questionId: string) => {
		const newVal = !bookmarks[questionId];
		setBookmarks((prev) => ({ ...prev, [questionId]: newVal }));
		examService.saveAnswer(sessionId, { questionId, isBookmarked: newVal });
	};

	const handleNext = () => {
		if (currentQuestionIndex < questions.length - 1) {
			setCurrentQuestionIndex((i) => i + 1);
		} else {
			openSheet(submitSheetAnim, setShowSubmitSheet);
		}
	};

	const handlePrev = () => {
		if (currentQuestionIndex > 0) {
			setCurrentQuestionIndex((i) => i - 1);
		}
	};

	if (isLoadingQuestions) {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.errorCenter}>
					<ActivityIndicator color={AUTH_UI.colors.accent} size="large" />
					<Text style={styles.loadingText}>Đang tải câu hỏi...</Text>
				</View>
			</SafeAreaView>
		);
	}

	if (questions.length === 0) {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.errorCenter}>
					<Text style={styles.errorText}>Không có câu hỏi nào</Text>
					<Button
						variant="secondary"
						label="Quay lại"
						onPress={() => router.back()}
						style={styles.backButton}
					/>
				</View>
			</SafeAreaView>
		);
	}

	const question = questions[currentQuestionIndex];
	const totalQuestions = questions.length;
	const totalGroups = Math.ceil(totalQuestions / QUESTIONS_PER_GROUP);
	const currentGroup = Math.floor(currentQuestionIndex / QUESTIONS_PER_GROUP);
	const isBookmarked = bookmarks[question.questionId] ?? false;
	const selectedOptionId = answers[question.questionId] ?? null;
	const isTimeLow = remainingSeconds <= 60;
	const isTimeCritical = remainingSeconds <= 10;
	const answeredCount = Object.values(answers).filter((v) => v !== null).length;
	const sortedOptions = [...question.options].sort((a, b) => a.displayOrder - b.displayOrder);

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<Button variant="icon" icon="arrow-back" onPress={handleBack} />

				<TouchableOpacity
					style={[styles.timerBadge, isTimeLow && styles.timerBadgeLow]}
					activeOpacity={1}>
					<Ionicons
						name="timer-outline"
						size={ms(16)}
						color={isTimeLow ? AUTH_UI.colors.danger : AUTH_UI.colors.accent}
					/>
					<Text style={[styles.timerText, isTimeLow && styles.timerTextLow]}>
						{formatTime(remainingSeconds)}
					</Text>
				</TouchableOpacity>

				<Button
					variant="icon"
					icon={isBookmarked ? "flag" : "flag-outline"}
					onPress={() => handleToggleBookmark(question.questionId)}
					style={isBookmarked ? styles.flaggedBtn : undefined}
				/>

				<TouchableOpacity
					style={styles.counterBadge}
					onPress={() => openSheet(navSheetAnim, setShowNavSheet)}>
					<Text style={styles.counterText}>
						{currentQuestionIndex + 1}/{totalQuestions}
					</Text>
				</TouchableOpacity>
			</View>

			{isTimeCritical && (
				<View style={styles.criticalTimerBanner}>
					<Ionicons name="warning-outline" size={ms(14)} color={AUTH_UI.colors.danger} />
					<Text style={styles.criticalTimerText}>
						Còn {remainingSeconds} giây! Bài thi sắp kết thúc.
					</Text>
				</View>
			)}

			<ScrollView
				style={styles.scroll}
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}>
				<Text style={styles.questionLabel}>Câu {currentQuestionIndex + 1}</Text>
				<Text style={styles.questionText}>{question.content}</Text>

				{(question.mediaFileId || question.imageUrl) && (
					<MediaImage
						mediaFileId={question.mediaFileId}
						imageUrl={question.imageUrl}
					/>
				)}

				{question.isCritical && (
					<Badge text="⚡ Câu điểm liệt" variant="critical" style={styles.criticalBadge} />
				)}

				<View style={styles.optionsList}>
					{sortedOptions.map((opt, i) => (
						<OptionCard
							key={opt.id}
							letter={String.fromCharCode(65 + i)}
							text={opt.content}
							state={selectedOptionId === opt.id ? "selected" : "default"}
							onPress={() => handleAnswerSelect(question.questionId, opt.id)}
						/>
					))}
				</View>
			</ScrollView>

			<View style={styles.bottomNav}>
				<Button
					variant="icon"
					icon="chevron-back"
					onPress={handlePrev}
					disabled={currentQuestionIndex === 0}
					style={styles.navArrow}
				/>

				<View style={styles.dots}>
					{Array.from({ length: totalGroups }).map((_, i) => (
						<View key={i} style={[styles.dot, i === currentGroup && styles.dotActive]} />
					))}
				</View>

				<Button
					variant="icon"
					icon="chevron-forward"
					onPress={handleNext}
					style={styles.navArrow}
				/>
			</View>

			{/* Question Navigation Sheet */}
			<Modal
				visible={showNavSheet}
				transparent
				animationType="none"
				onRequestClose={() => closeSheet(navSheetAnim, setShowNavSheet)}>
				<TouchableOpacity
					style={styles.overlay}
					activeOpacity={1}
					onPress={() => closeSheet(navSheetAnim, setShowNavSheet)}>
					<Animated.View
						style={[
							styles.sheet,
							{
								transform: [
									{
										translateY: navSheetAnim.interpolate({
											inputRange: [0, 1],
											outputRange: [vs(400), 0],
										}),
									},
								],
							},
						]}>
						<TouchableOpacity activeOpacity={1}>
							<View style={styles.sheetHandle} />
							<Text style={styles.sheetTitle}>Điều hướng câu hỏi</Text>

							<View style={styles.navGrid}>
								{questions.map((q, idx) => {
									const isCurrent = idx === currentQuestionIndex;
									const isAnswered = answers[q.questionId] !== null && answers[q.questionId] !== undefined;
									const isQBookmarked = bookmarks[q.questionId];
									let bg = AUTH_UI.colors.surface;
									let textColor = AUTH_UI.colors.textSecondary;
									if (isCurrent) {
										bg = AUTH_UI.colors.accent;
										textColor = AUTH_UI.colors.accentText;
									} else if (isQBookmarked) {
										bg = "#3D2E00";
										textColor = "#C9A227";
									} else if (isAnswered) {
										bg = "#1B4332";
										textColor = "#53D18D";
									}
									return (
										<TouchableOpacity
											key={q.questionId}
											style={[styles.navGridItem, { backgroundColor: bg }]}
											onPress={() =>
												closeSheet(navSheetAnim, setShowNavSheet, () =>
													setCurrentQuestionIndex(idx),
												)
											}>
											<Text style={[styles.navGridText, { color: textColor }]}>
												{idx + 1}
											</Text>
										</TouchableOpacity>
									);
								})}
							</View>

							<View style={styles.navLegend}>
								<View style={styles.legendItem}>
									<View style={[styles.legendDot, { backgroundColor: AUTH_UI.colors.accent }]} />
									<Text style={styles.legendText}>Đang làm</Text>
								</View>
								<View style={styles.legendItem}>
									<View style={[styles.legendDot, { backgroundColor: "#1B4332" }]} />
									<Text style={styles.legendText}>Đã trả lời</Text>
								</View>
								<View style={styles.legendItem}>
									<View style={[styles.legendDot, { backgroundColor: "#3D2E00" }]} />
									<Text style={styles.legendText}>Gắn cờ</Text>
								</View>
							</View>
						</TouchableOpacity>
					</Animated.View>
				</TouchableOpacity>
			</Modal>

			{/* Submit Confirmation Sheet */}
			<Modal
				visible={showSubmitSheet}
				transparent
				animationType="none"
				onRequestClose={() => closeSheet(submitSheetAnim, setShowSubmitSheet)}>
				<TouchableOpacity
					style={styles.overlay}
					activeOpacity={1}
					onPress={() => closeSheet(submitSheetAnim, setShowSubmitSheet)}>
					<Animated.View
						style={[
							styles.sheet,
							{
								transform: [
									{
										translateY: submitSheetAnim.interpolate({
											inputRange: [0, 1],
											outputRange: [vs(400), 0],
										}),
									},
								],
							},
						]}>
						<TouchableOpacity activeOpacity={1}>
							<View style={styles.sheetHandle} />
							<Text style={styles.submitTitle}>Nộp bài?</Text>
							<Text style={styles.submitSubtitle}>
								Bạn có chắc muốn nộp bài thi này không?
							</Text>

							<View style={styles.submitStats}>
								<StatBox value={answeredCount} label="Đã làm" bg="#1B4332" valueColor={AUTH_UI.colors.success} labelColor={AUTH_UI.colors.success} />
								<StatBox value={totalQuestions - answeredCount} label="Bỏ qua" bg="#3B0F0F" valueColor={AUTH_UI.colors.danger} labelColor={AUTH_UI.colors.danger} />
								<StatBox
									value={Object.values(bookmarks).filter(Boolean).length}
									label="Gắn cờ"
									bg="#3D2E00"
									valueColor="#C9A227"
									labelColor="#C9A227"
								/>
							</View>

							<View style={styles.submitActions}>
								<Button
									variant="secondary"
									label="Làm tiếp"
									flex
									onPress={() => closeSheet(submitSheetAnim, setShowSubmitSheet)}
									style={styles.submitActionBtn}
								/>
								<Button
									variant="primary"
									label={isSubmitting ? "Đang nộp..." : "✓ Nộp bài"}
									flex
									disabled={isSubmitting}
									onPress={() =>
										closeSheet(submitSheetAnim, setShowSubmitSheet, handleSubmit)
									}
									style={styles.submitActionBtn}
								/>
							</View>
						</TouchableOpacity>
					</Animated.View>
				</TouchableOpacity>
			</Modal>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: AUTH_UI.colors.background,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: s(16),
		paddingVertical: vs(10),
		gap: s(10),
	},
	timerBadge: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: s(6),
		backgroundColor: AUTH_UI.colors.surface,
		borderRadius: ms(AUTH_UI.radius.xl),
		paddingVertical: vs(8),
		borderWidth: 1,
		borderColor: AUTH_UI.colors.border,
	},
	timerBadgeLow: {
		borderColor: "rgba(248,113,113,0.5)",
		backgroundColor: "rgba(248,113,113,0.1)",
	},
	timerText: {
		fontSize: ms(16),
		fontWeight: "700",
		color: AUTH_UI.colors.accent,
	},
	timerTextLow: {
		color: AUTH_UI.colors.danger,
	},
	flaggedBtn: {
		backgroundColor: "rgba(243,201,66,0.15)",
	},
	counterBadge: {
		backgroundColor: AUTH_UI.colors.surface,
		borderRadius: ms(AUTH_UI.radius.lg),
		paddingHorizontal: s(12),
		paddingVertical: vs(8),
		borderWidth: 1,
		borderColor: AUTH_UI.colors.border,
	},
	counterText: {
		fontSize: ms(14),
		fontWeight: "600",
		color: AUTH_UI.colors.textPrimary,
	},
	criticalTimerBanner: {
		flexDirection: "row",
		alignItems: "center",
		gap: s(8),
		marginHorizontal: s(16),
		marginBottom: vs(8),
		paddingHorizontal: s(12),
		paddingVertical: vs(6),
		backgroundColor: "rgba(248,113,113,0.1)",
		borderWidth: 1,
		borderColor: "rgba(248,113,113,0.3)",
		borderRadius: ms(AUTH_UI.radius.lg),
	},
	criticalTimerText: {
		fontSize: ms(12),
		fontWeight: "600",
		color: AUTH_UI.colors.danger,
	},
	scroll: { flex: 1 },
	scrollContent: {
		paddingHorizontal: s(16),
		paddingTop: vs(12),
		paddingBottom: vs(20),
		gap: s(12),
	},
	questionLabel: {
		fontSize: ms(13),
		fontWeight: "600",
		color: AUTH_UI.colors.textMuted,
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
	questionText: {
		fontSize: ms(17),
		fontWeight: "600",
		color: AUTH_UI.colors.textPrimary,
		lineHeight: ms(26),
	},
	criticalBadge: {
		alignSelf: "flex-start",
	},
	optionsList: {
		gap: s(10),
		marginTop: vs(4),
	},
	bottomNav: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: s(20),
		paddingVertical: vs(14),
		borderTopWidth: 1,
		borderTopColor: AUTH_UI.colors.border,
	},
	navArrow: {
		width: s(40),
		height: s(40),
		borderRadius: ms(20),
	},
	dots: {
		flexDirection: "row",
		gap: s(8),
		alignItems: "center",
	},
	dot: {
		width: s(8),
		height: s(8),
		borderRadius: ms(4),
		backgroundColor: AUTH_UI.colors.surfaceMuted,
	},
	dotActive: {
		width: s(24),
		height: s(8),
		borderRadius: ms(4),
		backgroundColor: AUTH_UI.colors.accent,
	},
	overlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.6)",
		justifyContent: "flex-end",
	},
	sheet: {
		backgroundColor: AUTH_UI.colors.surface,
		borderTopLeftRadius: ms(20),
		borderTopRightRadius: ms(20),
		padding: s(20),
		paddingBottom: vs(36),
	},
	sheetHandle: {
		width: s(36),
		height: vs(4),
		backgroundColor: AUTH_UI.colors.border,
		borderRadius: ms(2),
		alignSelf: "center",
		marginBottom: vs(16),
	},
	sheetTitle: {
		fontSize: ms(16),
		fontWeight: "700",
		color: AUTH_UI.colors.textPrimary,
		marginBottom: vs(16),
	},
	navGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: s(10),
	},
	navGridItem: {
		width: s(40),
		height: s(40),
		borderRadius: ms(AUTH_UI.radius.lg),
		alignItems: "center",
		justifyContent: "center",
	},
	navGridText: {
		fontSize: ms(14),
		fontWeight: "700",
	},
	navLegend: {
		flexDirection: "row",
		gap: s(16),
		marginTop: vs(16),
		flexWrap: "wrap",
	},
	legendItem: {
		flexDirection: "row",
		alignItems: "center",
		gap: s(6),
	},
	legendDot: {
		width: s(12),
		height: s(12),
		borderRadius: ms(6),
	},
	legendText: {
		fontSize: ms(12),
		color: AUTH_UI.colors.textSecondary,
	},
	submitTitle: {
		fontSize: ms(20),
		fontWeight: "700",
		color: AUTH_UI.colors.textPrimary,
		textAlign: "center",
		marginBottom: vs(6),
	},
	submitSubtitle: {
		fontSize: ms(14),
		color: AUTH_UI.colors.textSecondary,
		textAlign: "center",
		marginBottom: vs(20),
	},
	submitStats: {
		flexDirection: "row",
		gap: s(10),
		marginBottom: vs(20),
	},
	submitActions: {
		flexDirection: "row",
		gap: s(10),
	},
	submitActionBtn: {
		height: vs(50),
	},
	errorCenter: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		gap: s(12),
	},
	loadingText: {
		fontSize: ms(14),
		color: AUTH_UI.colors.textSecondary,
	},
	errorText: {
		fontSize: ms(16),
		color: AUTH_UI.colors.textSecondary,
	},
	backButton: {
		paddingHorizontal: s(24),
	},
});
