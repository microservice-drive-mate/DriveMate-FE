import { Button } from "@/components/common/Button";
import { MediaImage } from "@/components/common/MediaImage";
import { OptionCard } from "@/components/exam/OptionCard";
import { ExamHeader } from "@/components/exam/ExamHeader";
import { QuestionNavigatorSheet } from "@/components/exam/QuestionNavigatorSheet";
import { SubmitConfirmSheet } from "@/components/exam/SubmitConfirmSheet";
import { useExamSession } from "@/hooks/useExamSession";
import { colors, radius, withAlpha } from "@/theme";
import { ms, s, vs } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
	ActivityIndicator,
	Alert,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";

const QUESTIONS_PER_GROUP = 4;

export default function ExamTakeScreen() {
	const { id, durationMinutes: durationParam } = useLocalSearchParams<{
		id: string;
		durationMinutes: string;
	}>();
	const router = useRouter();
	const sessionId = id ?? "";
	const durationMinutes = parseInt(durationParam ?? "20", 10);

	const session = useExamSession(sessionId, durationMinutes);

	const [showNavSheet, setShowNavSheet] = useState(false);
	const [showSubmitSheet, setShowSubmitSheet] = useState(false);

	const handleBack = () => {
		Alert.alert("Bạn có chắc muốn thoát?", "Tiến độ bài thi sẽ bị mất nếu thoát.", [
			{ text: "Ở lại", style: "cancel" },
			{ text: "Thoát", style: "destructive", onPress: () => router.back() },
		]);
	};

	if (session.isLoadingQuestions) {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.errorCenter}>
					<ActivityIndicator color={colors.accent} size="large" />
					<Text style={styles.loadingText}>Đang tải câu hỏi...</Text>
				</View>
			</SafeAreaView>
		);
	}

	if (session.questions.length === 0) {
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

	const question = session.questions[session.currentQuestionIndex];
	const totalQuestions = session.questions.length;
	const totalGroups = Math.ceil(totalQuestions / QUESTIONS_PER_GROUP);
	const currentGroup = Math.floor(session.currentQuestionIndex / QUESTIONS_PER_GROUP);
	const isBookmarked = session.bookmarks[question.questionId] ?? false;
	const selectedOptionId = session.answers[question.questionId] ?? null;
	const isTimeLow = session.remainingSeconds <= 60;
	const isTimeCritical = session.remainingSeconds <= 10;
	const sortedOptions = [...question.options].sort((a, b) => a.displayOrder - b.displayOrder);

	const handleNext = () => {
		if (session.currentQuestionIndex < totalQuestions - 1) {
			session.goToNext();
		} else {
			setShowSubmitSheet(true);
		}
	};

	return (
		<SafeAreaView style={styles.container}>
			<ExamHeader
				remainingSeconds={session.remainingSeconds}
				isTimeLow={isTimeLow}
				isBookmarked={isBookmarked}
				currentIndex={session.currentQuestionIndex}
				totalQuestions={totalQuestions}
				onBack={handleBack}
				onToggleBookmark={() => session.toggleBookmark(question.questionId)}
				onOpenNav={() => setShowNavSheet(true)}
			/>

			{isTimeCritical && (
				<View style={styles.criticalTimerBanner}>
					<Ionicons name="warning-outline" size={ms(14)} color={colors.danger} />
					<Text style={styles.criticalTimerText}>
						Còn {session.remainingSeconds} giây! Bài thi sắp kết thúc.
					</Text>
				</View>
			)}

			<ScrollView
				style={styles.scroll}
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}>
				<Text style={styles.questionLabel}>Câu {session.currentQuestionIndex + 1}</Text>
				<Text style={styles.questionText}>{question.content}</Text>

				{(question.mediaFileId || question.imageUrl) && (
					<MediaImage mediaFileId={question.mediaFileId} imageUrl={question.imageUrl} />
				)}

				<View style={styles.optionsList}>
					{sortedOptions.map((opt, i) => (
						<OptionCard
							key={opt.id}
							letter={String.fromCharCode(65 + i)}
							text={opt.content}
							state={selectedOptionId === opt.id ? "selected" : "default"}
							onPress={() => session.selectAnswer(question.questionId, opt.id)}
						/>
					))}
				</View>
			</ScrollView>

			<View style={styles.bottomNav}>
				<Button
					variant="icon"
					icon="chevron-back"
					onPress={session.goToPrev}
					disabled={session.currentQuestionIndex === 0}
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

			<QuestionNavigatorSheet
				visible={showNavSheet}
				onClose={() => setShowNavSheet(false)}
				questions={session.questions}
				currentQuestionIndex={session.currentQuestionIndex}
				answers={session.answers}
				bookmarks={session.bookmarks}
				onSelectIndex={(idx) => {
					session.goToIndex(idx);
					setShowNavSheet(false);
				}}
			/>

			<SubmitConfirmSheet
				visible={showSubmitSheet}
				onClose={() => setShowSubmitSheet(false)}
				answeredCount={session.answeredCount}
				skippedCount={totalQuestions - session.answeredCount}
				bookmarkedCount={session.bookmarkedCount}
				isSubmitting={session.isSubmitting}
				onConfirm={() => {
					setShowSubmitSheet(false);
					session.submit();
				}}
			/>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.background,
	},
	criticalTimerBanner: {
		flexDirection: "row",
		alignItems: "center",
		gap: s(8),
		marginHorizontal: s(16),
		marginBottom: vs(8),
		paddingHorizontal: s(12),
		paddingVertical: vs(6),
		backgroundColor: withAlpha(colors.danger, 0.1),
		borderWidth: 1,
		borderColor: withAlpha(colors.danger, 0.3),
		borderRadius: ms(radius.lg),
	},
	criticalTimerText: {
		fontSize: ms(12),
		fontWeight: "600",
		color: colors.danger,
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
		color: colors.textMuted,
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
	questionText: {
		fontSize: ms(17),
		fontWeight: "600",
		color: colors.textPrimary,
		lineHeight: ms(26),
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
		borderTopColor: colors.border,
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
		backgroundColor: colors.surfaceMuted,
	},
	dotActive: {
		width: s(24),
		height: s(8),
		borderRadius: ms(4),
		backgroundColor: colors.accent,
	},
	errorCenter: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		gap: s(12),
	},
	loadingText: {
		fontSize: ms(14),
		color: colors.textSecondary,
	},
	errorText: {
		fontSize: ms(16),
		color: colors.textSecondary,
	},
	backButton: {
		paddingHorizontal: s(24),
	},
});
