import { AUTH_UI } from "@/constants/auth-ui";
import { MOCK_EXAMS } from "@/data/exams.mock";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
	Alert,
	Animated,
	Modal,
	SafeAreaView,
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
	const { id } = useLocalSearchParams<{ id: string }>();
	const router = useRouter();
	const exam = MOCK_EXAMS.find((e) => e.id === id);

	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [answers, setAnswers] = useState<Record<number, number>>({});
	const [flaggedQuestions, setFlaggedQuestions] = useState<number[]>([]);
	const [remainingSeconds, setRemainingSeconds] = useState(
		(exam?.durationMinutes ?? 0) * 60,
	);
	const [isSubmitted, setIsSubmitted] = useState(false);

	const [showNavSheet, setShowNavSheet] = useState(false);
	const [showSubmitSheet, setShowSubmitSheet] = useState(false);

	const navSheetAnim = useRef(new Animated.Value(0)).current;
	const submitSheetAnim = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		if (isSubmitted) return;
		if (remainingSeconds <= 0) {
			handleSubmit();
			return;
		}
		const timer = setInterval(() => {
			setRemainingSeconds((s) => Math.max(0, s - 1));
		}, 1000);
		return () => clearInterval(timer);
	}, [remainingSeconds, isSubmitted]);

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
			"Tiến độ bài thi sẽ bị mất.",
			[
				{ text: "Ở lại", style: "cancel" },
				{ text: "Thoát", style: "destructive", onPress: () => router.back() },
			],
		);
	};

	const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
		setAnswers((prev) => {
			if (prev[questionIndex] === optionIndex) {
				const next = { ...prev };
				delete next[questionIndex];
				return next;
			}
			return { ...prev, [questionIndex]: optionIndex };
		});
	};

	const handleToggleFlag = (questionIndex: number) => {
		setFlaggedQuestions((prev) =>
			prev.includes(questionIndex)
				? prev.filter((i) => i !== questionIndex)
				: [...prev, questionIndex],
		);
	};

	const handleSubmit = () => {
		if (!exam) return;
		const totalSeconds = exam.durationMinutes * 60;
		const elapsed = totalSeconds - remainingSeconds;

		let correct = 0;
		let wrong = 0;
		let hitCritical = false;
		exam.questions.forEach((q, idx) => {
			const userAnswer = answers[idx];
			if (userAnswer === undefined) return;
			if (userAnswer === q.correctAnswerIndex) {
				correct++;
			} else {
				wrong++;
				if (q.isCritical) hitCritical = true;
			}
		});
		const skipped = exam.questions.length - correct - wrong;
		const elapsedMin = Math.floor(elapsed / 60);
		const elapsedSec = elapsed % 60;
		const elapsedStr = `${elapsedMin}:${String(elapsedSec).padStart(2, "0")}`;

		setIsSubmitted(true);

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(router.replace as any)({
			pathname: "/exam-session/result/[id]",
			params: {
				id: id ?? "",
				correct: String(correct),
				wrong: String(wrong),
				skipped: String(skipped),
				elapsed: elapsedStr,
				hitCritical: hitCritical ? "1" : "0",
				total: String(exam.questions.length),
				answersJson: JSON.stringify(answers),
			},
		});
	};

	const handleNext = () => {
		if (!exam) return;
		if (currentQuestionIndex < exam.questions.length - 1) {
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

	if (!exam) {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.errorCenter}>
					<Text style={styles.errorText}>Không tìm thấy đề thi</Text>
					<TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
						<Text style={styles.backButtonText}>Quay lại</Text>
					</TouchableOpacity>
				</View>
			</SafeAreaView>
		);
	}

	const question = exam.questions[currentQuestionIndex];
	const totalQuestions = exam.questions.length;
	const totalGroups = Math.ceil(totalQuestions / QUESTIONS_PER_GROUP);
	const currentGroup = Math.floor(currentQuestionIndex / QUESTIONS_PER_GROUP);
	const isFlagged = flaggedQuestions.includes(currentQuestionIndex);
	const selectedOption = answers[currentQuestionIndex];
	const isTimeLow = remainingSeconds <= 60;
	const answeredCount = Object.keys(answers).length;

	return (
		<SafeAreaView style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity style={styles.iconBtn} onPress={handleBack}>
					<Ionicons name="arrow-back" size={20} color={AUTH_UI.colors.textPrimary} />
				</TouchableOpacity>

				<TouchableOpacity
					style={[styles.timerBadge, isTimeLow && styles.timerBadgeLow]}
					activeOpacity={1}
				>
					<Ionicons
						name="timer-outline"
						size={16}
						color={isTimeLow ? AUTH_UI.colors.danger : AUTH_UI.colors.accent}
					/>
					<Text style={[styles.timerText, isTimeLow && styles.timerTextLow]}>
						{formatTime(remainingSeconds)}
					</Text>
				</TouchableOpacity>

				<TouchableOpacity
					style={styles.iconBtn}
					onPress={() => handleToggleFlag(currentQuestionIndex)}
				>
					<Ionicons
						name={isFlagged ? "flag" : "flag-outline"}
						size={20}
						color={isFlagged ? AUTH_UI.colors.accent : AUTH_UI.colors.textSecondary}
					/>
				</TouchableOpacity>

				<TouchableOpacity
					style={styles.counterBadge}
					onPress={() => openSheet(navSheetAnim, setShowNavSheet)}
				>
					<Text style={styles.counterText}>
						{currentQuestionIndex + 1}/{totalQuestions}
					</Text>
				</TouchableOpacity>
			</View>

			{/* Question */}
			<ScrollView
				style={styles.scroll}
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				<Text style={styles.questionLabel}>Câu {currentQuestionIndex + 1}</Text>
				<Text style={styles.questionText}>{question.questionText}</Text>

				{question.isCritical && (
					<View style={styles.criticalBadge}>
						<Text style={styles.criticalBadgeText}>⚡ Câu điểm liệt</Text>
					</View>
				)}

				<View style={styles.optionsList}>
					{question.options.map((opt, i) => {
						const isSelected = selectedOption === i;
						return (
							<TouchableOpacity
								key={i}
								style={[styles.option, isSelected && styles.optionSelected]}
								onPress={() => handleAnswerSelect(currentQuestionIndex, i)}
								activeOpacity={0.7}
							>
								<View
									style={[
										styles.optionBadge,
										isSelected && styles.optionBadgeSelected,
									]}
								>
									<Text
										style={[
											styles.optionBadgeText,
											isSelected && styles.optionBadgeTextSelected,
										]}
									>
										{String.fromCharCode(65 + i)}
									</Text>
								</View>
								<Text
									style={[
										styles.optionText,
										isSelected && styles.optionTextSelected,
									]}
								>
									{opt}
								</Text>
							</TouchableOpacity>
						);
					})}
				</View>
			</ScrollView>

			{/* Bottom Navigation */}
			<View style={styles.bottomNav}>
				<TouchableOpacity
					style={[
						styles.navArrow,
						currentQuestionIndex === 0 && styles.navArrowDisabled,
					]}
					onPress={handlePrev}
					disabled={currentQuestionIndex === 0}
				>
					<Ionicons
						name="chevron-back"
						size={22}
						color={
							currentQuestionIndex === 0
								? AUTH_UI.colors.disabled
								: AUTH_UI.colors.textPrimary
						}
					/>
				</TouchableOpacity>

				<View style={styles.dots}>
					{Array.from({ length: totalGroups }).map((_, i) => (
						<View
							key={i}
							style={[styles.dot, i === currentGroup && styles.dotActive]}
						/>
					))}
				</View>

				<TouchableOpacity style={styles.navArrow} onPress={handleNext}>
					<Ionicons
						name="chevron-forward"
						size={22}
						color={AUTH_UI.colors.textPrimary}
					/>
				</TouchableOpacity>
			</View>

			{/* Question Navigation Sheet */}
			<Modal
				visible={showNavSheet}
				transparent
				animationType="none"
				onRequestClose={() => closeSheet(navSheetAnim, setShowNavSheet)}
			>
				<TouchableOpacity
					style={styles.overlay}
					activeOpacity={1}
					onPress={() => closeSheet(navSheetAnim, setShowNavSheet)}
				>
					<Animated.View
						style={[
							styles.sheet,
							{
								transform: [
									{
										translateY: navSheetAnim.interpolate({
											inputRange: [0, 1],
											outputRange: [400, 0],
										}),
									},
								],
							},
						]}
					>
						<TouchableOpacity activeOpacity={1}>
							<View style={styles.sheetHandle} />
							<Text style={styles.sheetTitle}>Điều hướng câu hỏi</Text>

							<View style={styles.navGrid}>
								{exam.questions.map((_, idx) => {
									const isCurrent = idx === currentQuestionIndex;
									const isAnswered = answers[idx] !== undefined;
									const isQFlagged = flaggedQuestions.includes(idx);
									let bg = AUTH_UI.colors.surface;
									let textColor = AUTH_UI.colors.textSecondary;
									if (isCurrent) {
										bg = AUTH_UI.colors.accent;
										textColor = AUTH_UI.colors.accentText;
									} else if (isQFlagged) {
										bg = "#3D2E00";
										textColor = "#C9A227";
									} else if (isAnswered) {
										bg = "#1B4332";
										textColor = "#53D18D";
									}
									return (
										<TouchableOpacity
											key={idx}
											style={[styles.navGridItem, { backgroundColor: bg }]}
											onPress={() =>
												closeSheet(navSheetAnim, setShowNavSheet, () =>
													setCurrentQuestionIndex(idx),
												)
											}
										>
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
				onRequestClose={() => closeSheet(submitSheetAnim, setShowSubmitSheet)}
			>
				<TouchableOpacity
					style={styles.overlay}
					activeOpacity={1}
					onPress={() => closeSheet(submitSheetAnim, setShowSubmitSheet)}
				>
					<Animated.View
						style={[
							styles.sheet,
							{
								transform: [
									{
										translateY: submitSheetAnim.interpolate({
											inputRange: [0, 1],
											outputRange: [400, 0],
										}),
									},
								],
							},
						]}
					>
						<TouchableOpacity activeOpacity={1}>
							<View style={styles.sheetHandle} />
							<Text style={styles.submitTitle}>Nộp bài?</Text>
							<Text style={styles.submitSubtitle}>
								Bạn có chắc muốn nộp bài thi này không?
							</Text>

							<View style={styles.submitStats}>
								<View style={[styles.statBox, { backgroundColor: "#1B4332" }]}>
									<Text style={[styles.statNumber, { color: AUTH_UI.colors.success }]}>
										{answeredCount}
									</Text>
									<Text style={[styles.statLabel, { color: AUTH_UI.colors.success }]}>
										Đã làm
									</Text>
								</View>
								<View style={[styles.statBox, { backgroundColor: "#3B0F0F" }]}>
									<Text style={[styles.statNumber, { color: AUTH_UI.colors.danger }]}>
										{totalQuestions - answeredCount}
									</Text>
									<Text style={[styles.statLabel, { color: AUTH_UI.colors.danger }]}>
										Bỏ qua
									</Text>
								</View>
								<View style={[styles.statBox, { backgroundColor: "#3D2E00" }]}>
									<Text style={[styles.statNumber, { color: "#C9A227" }]}>
										{flaggedQuestions.length}
									</Text>
									<Text style={[styles.statLabel, { color: "#C9A227" }]}>
										Gắn cờ
									</Text>
								</View>
							</View>

							<View style={styles.submitActions}>
								<TouchableOpacity
									style={styles.cancelBtn}
									onPress={() => closeSheet(submitSheetAnim, setShowSubmitSheet)}
								>
									<Text style={styles.cancelBtnText}>Làm tiếp</Text>
								</TouchableOpacity>
								<TouchableOpacity
									style={styles.submitBtn}
									onPress={() =>
										closeSheet(submitSheetAnim, setShowSubmitSheet, handleSubmit)
									}
								>
									<Text style={styles.submitBtnText}>✓ Nộp bài</Text>
								</TouchableOpacity>
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
		paddingHorizontal: 16,
		paddingVertical: 10,
		gap: 10,
	},
	iconBtn: {
		width: 36,
		height: 36,
		borderRadius: 18,
		backgroundColor: AUTH_UI.colors.surface,
		alignItems: "center",
		justifyContent: "center",
	},
	timerBadge: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 6,
		backgroundColor: AUTH_UI.colors.surface,
		borderRadius: AUTH_UI.radius.xl,
		paddingVertical: 8,
		borderWidth: 1,
		borderColor: AUTH_UI.colors.border,
	},
	timerBadgeLow: {
		borderColor: "rgba(248,113,113,0.5)",
		backgroundColor: "rgba(248,113,113,0.1)",
	},
	timerText: {
		fontSize: 16,
		fontWeight: "700",
		color: AUTH_UI.colors.accent,
	},
	timerTextLow: {
		color: AUTH_UI.colors.danger,
	},
	counterBadge: {
		backgroundColor: AUTH_UI.colors.surface,
		borderRadius: AUTH_UI.radius.lg,
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderWidth: 1,
		borderColor: AUTH_UI.colors.border,
	},
	counterText: {
		fontSize: 14,
		fontWeight: "600",
		color: AUTH_UI.colors.textPrimary,
	},
	scroll: {
		flex: 1,
	},
	scrollContent: {
		paddingHorizontal: 16,
		paddingTop: 12,
		paddingBottom: 20,
		gap: 12,
	},
	questionLabel: {
		fontSize: 13,
		fontWeight: "600",
		color: AUTH_UI.colors.textMuted,
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
	questionText: {
		fontSize: 17,
		fontWeight: "600",
		color: AUTH_UI.colors.textPrimary,
		lineHeight: 26,
	},
	criticalBadge: {
		alignSelf: "flex-start",
		backgroundColor: "rgba(248,113,113,0.15)",
		borderRadius: 20,
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderWidth: 1,
		borderColor: "rgba(248,113,113,0.3)",
	},
	criticalBadgeText: {
		fontSize: 12,
		fontWeight: "600",
		color: AUTH_UI.colors.danger,
	},
	optionsList: {
		gap: 10,
		marginTop: 4,
	},
	option: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		backgroundColor: AUTH_UI.colors.surface,
		borderRadius: AUTH_UI.radius.xl,
		padding: 14,
		borderWidth: 1.5,
		borderColor: "transparent",
	},
	optionSelected: {
		borderColor: AUTH_UI.colors.accent,
		backgroundColor: "rgba(243,201,66,0.08)",
	},
	optionBadge: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: AUTH_UI.colors.surfaceMuted,
		alignItems: "center",
		justifyContent: "center",
	},
	optionBadgeSelected: {
		backgroundColor: AUTH_UI.colors.accent,
	},
	optionBadgeText: {
		fontSize: 13,
		fontWeight: "700",
		color: AUTH_UI.colors.textSecondary,
	},
	optionBadgeTextSelected: {
		color: AUTH_UI.colors.accentText,
	},
	optionText: {
		flex: 1,
		fontSize: 14,
		color: AUTH_UI.colors.textSecondary,
		lineHeight: 20,
	},
	optionTextSelected: {
		color: AUTH_UI.colors.textPrimary,
		fontWeight: "500",
	},
	bottomNav: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 20,
		paddingVertical: 14,
		borderTopWidth: 1,
		borderTopColor: AUTH_UI.colors.border,
	},
	navArrow: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: AUTH_UI.colors.surface,
		alignItems: "center",
		justifyContent: "center",
	},
	navArrowDisabled: {
		opacity: 0.4,
	},
	dots: {
		flexDirection: "row",
		gap: 8,
		alignItems: "center",
	},
	dot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: AUTH_UI.colors.surfaceMuted,
	},
	dotActive: {
		width: 24,
		height: 8,
		borderRadius: 4,
		backgroundColor: AUTH_UI.colors.accent,
	},
	overlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.6)",
		justifyContent: "flex-end",
	},
	sheet: {
		backgroundColor: AUTH_UI.colors.surface,
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		padding: 20,
		paddingBottom: 36,
	},
	sheetHandle: {
		width: 36,
		height: 4,
		backgroundColor: AUTH_UI.colors.border,
		borderRadius: 2,
		alignSelf: "center",
		marginBottom: 16,
	},
	sheetTitle: {
		fontSize: 16,
		fontWeight: "700",
		color: AUTH_UI.colors.textPrimary,
		marginBottom: 16,
	},
	navGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 10,
	},
	navGridItem: {
		width: 40,
		height: 40,
		borderRadius: AUTH_UI.radius.lg,
		alignItems: "center",
		justifyContent: "center",
	},
	navGridText: {
		fontSize: 14,
		fontWeight: "700",
	},
	navLegend: {
		flexDirection: "row",
		gap: 16,
		marginTop: 16,
		flexWrap: "wrap",
	},
	legendItem: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
	},
	legendDot: {
		width: 12,
		height: 12,
		borderRadius: 6,
	},
	legendText: {
		fontSize: 12,
		color: AUTH_UI.colors.textSecondary,
	},
	submitTitle: {
		fontSize: 20,
		fontWeight: "700",
		color: AUTH_UI.colors.textPrimary,
		textAlign: "center",
		marginBottom: 6,
	},
	submitSubtitle: {
		fontSize: 14,
		color: AUTH_UI.colors.textSecondary,
		textAlign: "center",
		marginBottom: 20,
	},
	submitStats: {
		flexDirection: "row",
		gap: 10,
		marginBottom: 20,
	},
	statBox: {
		flex: 1,
		borderRadius: AUTH_UI.radius.xl,
		padding: 14,
		alignItems: "center",
		gap: 4,
	},
	statNumber: {
		fontSize: 22,
		fontWeight: "700",
	},
	statLabel: {
		fontSize: 12,
		fontWeight: "500",
	},
	submitActions: {
		flexDirection: "row",
		gap: 10,
	},
	cancelBtn: {
		flex: 1,
		borderRadius: AUTH_UI.radius.xl,
		paddingVertical: 14,
		alignItems: "center",
		backgroundColor: AUTH_UI.colors.surfaceMuted,
	},
	cancelBtnText: {
		fontSize: 15,
		fontWeight: "600",
		color: AUTH_UI.colors.textPrimary,
	},
	submitBtn: {
		flex: 1,
		borderRadius: AUTH_UI.radius.xl,
		paddingVertical: 14,
		alignItems: "center",
		backgroundColor: AUTH_UI.colors.accent,
	},
	submitBtnText: {
		fontSize: 15,
		fontWeight: "700",
		color: AUTH_UI.colors.accentText,
	},
	errorCenter: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		gap: 12,
	},
	errorText: {
		fontSize: 16,
		color: AUTH_UI.colors.textSecondary,
	},
	backButton: {
		paddingHorizontal: 24,
		paddingVertical: 10,
		backgroundColor: AUTH_UI.colors.surface,
		borderRadius: AUTH_UI.radius.lg,
		borderWidth: 1,
		borderColor: AUTH_UI.colors.border,
	},
	backButtonText: {
		fontSize: 14,
		fontWeight: "600",
		color: AUTH_UI.colors.textPrimary,
	},
});
