import { AUTH_UI } from "@/constants/auth-ui";
import { MOCK_EXAMS } from "@/data/exams.mock";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type WrongItem = {
	questionIndex: number;
	userAnswer: number;
	correctAnswer: number;
	questionText: string;
	options: string[];
	explanation?: string;
};

export default function ExamReviewScreen() {
	const { id, answersJson } = useLocalSearchParams<{ id: string; answersJson: string }>();
	const router = useRouter();
	const answers: Record<number, number> = JSON.parse(answersJson ?? "{}");

	const exam = MOCK_EXAMS.find((e) => e.id === id);

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

	const wrongItems: WrongItem[] = exam.questions.reduce<WrongItem[]>((acc, q, idx) => {
		const userAnswer = answers[idx];
		if (userAnswer !== undefined && userAnswer !== q.correctAnswerIndex) {
			acc.push({
				questionIndex: idx,
				userAnswer,
				correctAnswer: q.correctAnswerIndex,
				questionText: q.questionText,
				options: q.options,
				explanation: q.explanation,
			});
		}
		return acc;
	}, []);

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
					<Ionicons name="arrow-back" size={20} color={AUTH_UI.colors.textPrimary} />
				</TouchableOpacity>
				<View style={styles.headerText}>
					<Text style={styles.headerTitle}>Câu Sai</Text>
					<Text style={styles.headerSub}>{wrongItems.length} câu cần ôn lại</Text>
				</View>
			</View>

			{wrongItems.length === 0 ? (
				<View style={styles.emptyCenter}>
					<Ionicons name="checkmark-circle-outline" size={56} color={AUTH_UI.colors.success} />
					<Text style={styles.emptyText}>Không có câu sai!</Text>
				</View>
			) : (
				<FlatList
					data={wrongItems}
					keyExtractor={(item) => String(item.questionIndex)}
					renderItem={({ item, index }) => (
						<WrongQuestionCard item={item} number={index + 1} />
					)}
					contentContainerStyle={styles.listContent}
					showsVerticalScrollIndicator={false}
				/>
			)}
		</SafeAreaView>
	);
}

function WrongQuestionCard({ item, number }: { item: WrongItem; number: number }) {
	const optionLabels = ["A", "B", "C", "D"];

	return (
		<View style={styles.card}>
			<View style={styles.cardHeader}>
				<View style={styles.cardHeaderLeft}>
					<View style={styles.wrongNumBadge}>
						<Text style={styles.wrongNumText}>{number}</Text>
					</View>
					<Text style={styles.wrongLabel}>Trả lời sai</Text>
				</View>
				<Ionicons name="close-circle" size={20} color={AUTH_UI.colors.danger} />
			</View>

			<Text style={styles.questionText}>{item.questionText}</Text>

			<View style={styles.optionsList}>
				{item.options.map((opt, i) => {
					const isCorrect = i === item.correctAnswer;
					const isUserWrong = i === item.userAnswer;
					const isDimmed = !isCorrect && !isUserWrong;

					let optionStyle = styles.optionDefault;
					let labelStyle = styles.optionLabelDefault;
					let textStyle = styles.optionTextDefault;
					let iconName: keyof typeof Ionicons.glyphMap | null = null;
					let iconColor = AUTH_UI.colors.textMuted;

					if (isCorrect) {
						optionStyle = styles.optionCorrect;
						labelStyle = styles.optionLabelCorrect;
						textStyle = styles.optionTextCorrect;
						iconName = "checkmark-circle";
						iconColor = AUTH_UI.colors.success;
					} else if (isUserWrong) {
						optionStyle = styles.optionWrong;
						labelStyle = styles.optionLabelWrong;
						textStyle = styles.optionTextWrong;
						iconName = "close-circle";
						iconColor = AUTH_UI.colors.danger;
					}

					return (
						<View key={i} style={[styles.option, optionStyle]}>
							<View style={[styles.optionLabel, labelStyle]}>
								<Text style={[styles.optionLabelText, isDimmed && styles.dimmedText]}>
									{optionLabels[i]}
								</Text>
							</View>
							<Text
								style={[
									styles.optionText,
									textStyle,
									isDimmed && styles.optionTextDimmed,
								]}
							>
								{opt}
							</Text>
							{iconName && (
								<Ionicons name={iconName} size={18} color={iconColor} />
							)}
						</View>
					);
				})}
			</View>

			<View style={styles.explanationBox}>
				<Text style={styles.explanationBulb}>💡</Text>
				<Text style={styles.explanationText}>
					Bạn chọn{" "}
					<Text style={styles.highlightWrong}>
						{optionLabels[item.userAnswer]} — {item.options[item.userAnswer]}
					</Text>
					. Đáp án đúng là{" "}
					<Text style={styles.highlightCorrect}>
						{optionLabels[item.correctAnswer]} — {item.options[item.correctAnswer]}
					</Text>
					.
					{item.explanation ? ` ${item.explanation}` : ""}
				</Text>
			</View>
		</View>
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
		paddingVertical: 12,
		gap: 12,
		borderBottomWidth: 1,
		borderBottomColor: AUTH_UI.colors.border,
	},
	backBtn: {
		width: 36,
		height: 36,
		borderRadius: 18,
		backgroundColor: AUTH_UI.colors.surface,
		alignItems: "center",
		justifyContent: "center",
	},
	headerText: {
		gap: 2,
	},
	headerTitle: {
		fontSize: 17,
		fontWeight: "700",
		color: AUTH_UI.colors.textPrimary,
	},
	headerSub: {
		fontSize: 12,
		color: AUTH_UI.colors.textSecondary,
	},
	listContent: {
		padding: 16,
		gap: 14,
		paddingBottom: 40,
	},
	card: {
		backgroundColor: AUTH_UI.colors.surface,
		borderRadius: AUTH_UI.radius.xl,
		padding: 16,
		gap: 12,
	},
	cardHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	cardHeaderLeft: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	wrongNumBadge: {
		width: 28,
		height: 28,
		borderRadius: 14,
		backgroundColor: "rgba(248,113,113,0.15)",
		borderWidth: 1,
		borderColor: "rgba(248,113,113,0.3)",
		alignItems: "center",
		justifyContent: "center",
	},
	wrongNumText: {
		fontSize: 13,
		fontWeight: "700",
		color: AUTH_UI.colors.danger,
	},
	wrongLabel: {
		fontSize: 13,
		fontWeight: "600",
		color: AUTH_UI.colors.danger,
	},
	questionText: {
		fontSize: 14,
		fontWeight: "600",
		color: AUTH_UI.colors.textPrimary,
		lineHeight: 22,
	},
	optionsList: {
		gap: 8,
	},
	option: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		borderRadius: AUTH_UI.radius.lg,
		padding: 10,
		borderWidth: 1,
	},
	optionDefault: {
		borderColor: "transparent",
		backgroundColor: "transparent",
	},
	optionCorrect: {
		borderColor: AUTH_UI.colors.success,
		backgroundColor: "rgba(83,209,141,0.12)",
	},
	optionWrong: {
		borderColor: AUTH_UI.colors.danger,
		backgroundColor: "rgba(248,113,113,0.12)",
	},
	optionLabel: {
		width: 28,
		height: 28,
		borderRadius: 14,
		alignItems: "center",
		justifyContent: "center",
	},
	optionLabelDefault: {
		backgroundColor: AUTH_UI.colors.surfaceMuted,
	},
	optionLabelCorrect: {
		backgroundColor: AUTH_UI.colors.success,
	},
	optionLabelWrong: {
		backgroundColor: AUTH_UI.colors.danger,
	},
	optionLabelText: {
		fontSize: 13,
		fontWeight: "700",
		color: AUTH_UI.colors.textPrimary,
	},
	dimmedText: {
		color: AUTH_UI.colors.textMuted,
	},
	optionText: {
		flex: 1,
		fontSize: 13,
		lineHeight: 20,
	},
	optionTextDefault: {
		color: AUTH_UI.colors.textMuted,
	},
	optionTextDimmed: {
		color: AUTH_UI.colors.textMuted,
		opacity: 0.7,
	},
	optionTextCorrect: {
		color: AUTH_UI.colors.success,
		fontWeight: "600",
	},
	optionTextWrong: {
		color: AUTH_UI.colors.danger,
		fontWeight: "600",
	},
	explanationBox: {
		flexDirection: "row",
		gap: 8,
		backgroundColor: AUTH_UI.colors.surfaceMuted,
		borderRadius: AUTH_UI.radius.lg,
		padding: 12,
	},
	explanationBulb: {
		fontSize: 14,
		marginTop: 1,
	},
	explanationText: {
		flex: 1,
		fontSize: 13,
		color: AUTH_UI.colors.textSecondary,
		lineHeight: 20,
	},
	highlightWrong: {
		color: AUTH_UI.colors.danger,
		fontWeight: "600",
	},
	highlightCorrect: {
		color: AUTH_UI.colors.success,
		fontWeight: "600",
	},
	emptyCenter: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		gap: 12,
	},
	emptyText: {
		fontSize: 16,
		fontWeight: "600",
		color: AUTH_UI.colors.textSecondary,
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
