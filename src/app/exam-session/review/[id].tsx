import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { MediaImage } from "@/components/common/MediaImage";
import { OptionCard } from "@/components/exam/OptionCard";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { AUTH_UI } from "@/constants/auth-ui";
import { ERROR_MESSAGES } from "@/constants/api";
import { ExamSessionQuestion } from "@/models/examSession.model";
import { examService } from "@/services/exam.service";
import { ms, s, vs } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
	ActivityIndicator,
	FlatList,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const OPTION_LABELS = ["A", "B", "C", "D", "E", "F"];

function WrongQuestionCard({
	question,
	number,
}: {
	question: ExamSessionQuestion;
	number: number;
}) {
	const sortedOptions = [...question.options].sort(
		(a, b) => a.displayOrder - b.displayOrder,
	);
	const selectedIndex = sortedOptions.findIndex(
		(o) => o.id === question.selectedOptionId,
	);

	return (
		<View style={styles.card}>
			<View style={styles.cardHeader}>
				<View style={styles.cardHeaderLeft}>
					<View style={styles.wrongNumBadge}>
						<Text style={styles.wrongNumText}>{number}</Text>
					</View>
					<Text style={styles.wrongLabel}>Trả lời sai</Text>
				</View>
				<Ionicons name="close-circle" size={ms(20)} color={AUTH_UI.colors.danger} />
			</View>

			<Text style={styles.questionText}>{question.content}</Text>

			{(question.mediaFileId || question.imageUrl) && (
				<MediaImage
					mediaFileId={question.mediaFileId}
					imageUrl={question.imageUrl}
				/>
			)}

			<View style={styles.optionsList}>
				{sortedOptions.map((opt, i) => {
					const isUserChoice = opt.id === question.selectedOptionId;
					return (
						<OptionCard
							key={opt.id}
							letter={OPTION_LABELS[i] ?? String(i + 1)}
							text={opt.content}
							state={isUserChoice ? "wrong" : "dimmed"}
							trailingIcon={isUserChoice ? "close-circle" : undefined}
							trailingIconColor={AUTH_UI.colors.danger}
						/>
					);
				})}
			</View>

			<View style={styles.noteBox}>
				<Ionicons
					name="information-circle-outline"
					size={ms(16)}
					color={AUTH_UI.colors.textSecondary}
				/>
				<Text style={styles.noteText}>
					{selectedIndex >= 0 ? (
						<>
							Bạn đã chọn{" "}
							<Text style={styles.highlightWrong}>
								{OPTION_LABELS[selectedIndex] ?? selectedIndex + 1} —{" "}
								{sortedOptions[selectedIndex].content}
							</Text>
							.
						</>
					) : (
						"Bạn chưa trả lời câu này."
					)}
				</Text>
			</View>
		</View>
	);
}

export default function ExamReviewScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const router = useRouter();
	const sessionId = id ?? "";

	const [questions, setQuestions] = useState<ExamSessionQuestion[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;
		const load = async () => {
			setIsLoading(true);
			setError(null);
			const result = await examService.getSessionResult(sessionId);
			if (cancelled) return;
			if (result.success) {
				const wrong = result.data.questions
					.filter((q) => q.isCorrect === false)
					.sort((a, b) => a.displayOrder - b.displayOrder);
				setQuestions(wrong);
			} else {
				setError(
					ERROR_MESSAGES[result.code as keyof typeof ERROR_MESSAGES] ??
						result.error,
				);
			}
			setIsLoading(false);
		};
		load();
		return () => {
			cancelled = true;
		};
	}, [sessionId]);

	if (isLoading) {
		return (
			<SafeAreaView style={styles.container}>
				<ScreenHeader title="Câu Sai" onBack={() => router.back()} bordered />
				<View style={styles.errorCenter}>
					<ActivityIndicator color={AUTH_UI.colors.accent} size="large" />
				</View>
			</SafeAreaView>
		);
	}

	if (error) {
		return (
			<SafeAreaView style={styles.container}>
				<ScreenHeader title="Câu Sai" onBack={() => router.back()} bordered />
				<View style={styles.errorCenter}>
					<Text style={styles.errorText}>{error}</Text>
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

	return (
		<SafeAreaView style={styles.container}>
			<ScreenHeader
				title="Câu Sai"
				subtitle={`${questions.length} câu cần ôn lại`}
				onBack={() => router.back()}
				bordered
			/>

			{questions.length === 0 ? (
				<EmptyState icon="checkmark-circle-outline" title="Không có câu sai!" />
			) : (
				<FlatList
					data={questions}
					keyExtractor={(item) => item.questionId}
					renderItem={({ item, index }) => (
						<WrongQuestionCard question={item} number={index + 1} />
					)}
					contentContainerStyle={styles.listContent}
					showsVerticalScrollIndicator={false}
				/>
			)}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: AUTH_UI.colors.background,
	},
	listContent: {
		padding: s(16),
		gap: vs(14),
		paddingBottom: vs(40),
	},
	card: {
		backgroundColor: AUTH_UI.colors.surface,
		borderRadius: ms(AUTH_UI.radius.xl),
		padding: s(16),
		gap: s(12),
	},
	cardHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	cardHeaderLeft: {
		flexDirection: "row",
		alignItems: "center",
		gap: s(8),
	},
	wrongNumBadge: {
		width: s(28),
		height: s(28),
		borderRadius: ms(14),
		backgroundColor: "rgba(248,113,113,0.15)",
		borderWidth: 1,
		borderColor: "rgba(248,113,113,0.3)",
		alignItems: "center",
		justifyContent: "center",
	},
	wrongNumText: {
		fontSize: ms(13),
		fontWeight: "700",
		color: AUTH_UI.colors.danger,
	},
	wrongLabel: {
		fontSize: ms(13),
		fontWeight: "600",
		color: AUTH_UI.colors.danger,
	},
	questionText: {
		fontSize: ms(14),
		fontWeight: "600",
		color: AUTH_UI.colors.textPrimary,
		lineHeight: ms(22),
	},
	optionsList: {
		gap: s(8),
	},
	noteBox: {
		flexDirection: "row",
		gap: s(8),
		backgroundColor: AUTH_UI.colors.surfaceMuted,
		borderRadius: ms(AUTH_UI.radius.lg),
		padding: s(12),
	},
	noteText: {
		flex: 1,
		fontSize: ms(13),
		color: AUTH_UI.colors.textSecondary,
		lineHeight: ms(20),
	},
	highlightWrong: {
		color: AUTH_UI.colors.danger,
		fontWeight: "600",
	},
	errorCenter: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		gap: s(12),
		paddingHorizontal: s(32),
	},
	errorText: {
		fontSize: ms(16),
		color: AUTH_UI.colors.textSecondary,
		textAlign: "center",
	},
	backButton: {
		paddingHorizontal: s(24),
	},
});
