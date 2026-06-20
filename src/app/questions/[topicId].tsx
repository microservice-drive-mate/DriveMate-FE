import { AsyncContent } from "@/components/common/AsyncContent";
import { EmptyState } from "@/components/common/EmptyState";
import { ScreenHeader } from "@/components/layout";
import { ScreenWrapper } from "@/components/screen-wrapper";
import { AUTH_UI } from "@/constants/auth-ui";
import type { PracticeQuestion } from "@/models/question.model";
import { questionService } from "@/services/question.service";
import { colors, withAlpha } from "@/theme";
import { getErrorMessage } from "@/utils/error";
import { getPracticeAnswers, setPracticeAnswers } from "@/utils/storage";
import { answersCache } from "@/utils/practiceAnswersCache";
import { ms, s, vs } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	Alert,
	FlatList,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

const PAGE_SIZE = 20;

export default function PracticeScreen() {
	const { topicId, topicName } = useLocalSearchParams<{
		topicId: string;
		topicName: string;
	}>();
	const router = useRouter();

	const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	// Map: questionId → selectedOptionId
	const [answers, setAnswers] = useState<Record<string, string>>(
		() => answersCache.get(topicId) ?? {},
	);
	const page = useRef(1);

	const load = useCallback(async () => {
		page.current = 1;
		setIsLoading(true);
		setError(null);
		if (!answersCache.has(topicId)) {
			const stored = await getPracticeAnswers();
			if (stored?.[topicId]) {
				answersCache.set(topicId, stored[topicId]);
				setAnswers(stored[topicId]);
			}
		}
		const result = await questionService.getPracticeQuestions({
			topicId,
			page: 1,
			size: PAGE_SIZE,
		});
		if (result.success) {
			setQuestions(result.data.items);
			setHasMore(result.data.items.length === PAGE_SIZE);
		} else {
			setError(getErrorMessage(result.code, result.error));
		}
		setIsLoading(false);
	}, [topicId]);

	useEffect(() => {
		load();
	}, [load]);

	const loadMore = async () => {
		if (isLoadingMore || !hasMore) return;
		setIsLoadingMore(true);
		const nextPage = page.current + 1;
		const result = await questionService.getPracticeQuestions({
			topicId,
			page: nextPage,
			size: PAGE_SIZE,
		});
		if (result.success) {
			page.current = nextPage;
			setQuestions((prev) => [...prev, ...result.data.items]);
			setHasMore(result.data.items.length === PAGE_SIZE);
		}
		setIsLoadingMore(false);
	};

	const handleSelectOption = (questionId: string, optionId: string) => {
		if (answers[questionId]) return;
		const next = { ...answers, [questionId]: optionId };
		answersCache.set(topicId, next);
		setAnswers(next);
		getPracticeAnswers().then((stored) => {
			setPracticeAnswers({ ...stored, [topicId]: next });
		});
	};

	const handleReport = (question: PracticeQuestion) => {
		Alert.prompt(
			"Báo lỗi câu hỏi",
			"Mô tả vấn đề bạn gặp phải:",
			[
				{ text: "Hủy", style: "cancel" },
				{
					text: "Gửi",
					onPress: async (message: string | undefined) => {
						if (!message?.trim()) return;
						const result = await questionService.reportQuestion(
							question.id,
							{ reason: "WRONG_ANSWER", message: message.trim() },
						);
						Alert.alert(
							result.success ? "Đã gửi báo lỗi" : "Gửi thất bại",
							result.success
								? "Cảm ơn bạn đã phản hồi."
								: getErrorMessage(result.code, result.error),
						);
					},
				},
			],
			"plain-text",
		);
	};

	const renderQuestion = ({ item, index }: { item: PracticeQuestion; index: number }) => {
		const selected = answers[item.id];
		return (
			<View style={styles.card}>
				<View style={styles.cardHeader}>
					<Text style={styles.questionIndex}>Câu {index + 1}</Text>
					<TouchableOpacity
						onPress={() => handleReport(item)}
						hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
						<Ionicons
							name="flag-outline"
							size={ms(16)}
							color={AUTH_UI.colors.textSecondary}
						/>
					</TouchableOpacity>
				</View>

				<Text style={styles.questionContent}>{item.content}</Text>

				<View style={styles.options}>
					{[...item.options]
						.sort((a, b) => a.displayOrder - b.displayOrder)
						.map((opt) => {
							const isSelected = selected === opt.id;
							const isCorrect = opt.id === item.correctOptionId;
							const showFeedback = !!selected;

							let optStyle = styles.option;
							let optTextStyle = styles.optionText;

							if (showFeedback && isCorrect) {
								optStyle = styles.optionCorrect;
								optTextStyle = styles.optionTextCorrect;
							} else if (showFeedback && isSelected && !isCorrect) {
								optStyle = styles.optionWrong;
								optTextStyle = styles.optionTextWrong;
							} else if (isSelected) {
								optStyle = styles.optionSelected;
							}

							return (
								<TouchableOpacity
									key={opt.id}
									style={optStyle}
									onPress={() =>
										handleSelectOption(item.id, opt.id)
									}
									activeOpacity={selected ? 1 : 0.7}
									disabled={!!selected}>
									{showFeedback && isCorrect ? (
										<Ionicons
											name="checkmark-circle"
											size={ms(16)}
											color={colors.success}
										/>
									) : showFeedback && isSelected && !isCorrect ? (
										<Ionicons
											name="close-circle"
											size={ms(16)}
											color={colors.danger}
										/>
									) : (
										<View
											style={[
												styles.optionDot,
												isSelected &&
													styles.optionDotSelected,
											]}
										/>
									)}
									<Text style={optTextStyle}>{opt.content}</Text>
								</TouchableOpacity>
							);
						})}
				</View>
			</View>
		);
	};

	return (
		<ScreenWrapper backgroundColor={AUTH_UI.colors.background} scroll={false}>
			<ScreenHeader
				title={topicName ?? "Luyện tập"}
				onBack={() => router.back()}
			/>

			<AsyncContent loading={isLoading} error={error} onRetry={load}>
				<FlatList
					data={questions}
					keyExtractor={(item) => item.id}
					renderItem={renderQuestion}
					contentContainerStyle={styles.list}
					showsVerticalScrollIndicator={false}
					onEndReached={loadMore}
					onEndReachedThreshold={0.3}
					ListEmptyComponent={
						<EmptyState
							icon="book-outline"
							title="Chủ đề này chưa có câu hỏi"
						/>
					}
					ListFooterComponent={
						isLoadingMore ? (
							<Text style={styles.loadingMore}>
								Đang tải thêm...
							</Text>
						) : null
					}
				/>
			</AsyncContent>
		</ScreenWrapper>
	);
}

const styles = StyleSheet.create({
	list: {
		flexGrow: 1,
		paddingHorizontal: s(16),
		paddingTop: vs(8),
		paddingBottom: vs(24),
		gap: vs(16),
	},
	card: {
		backgroundColor: AUTH_UI.colors.surface,
		borderRadius: ms(AUTH_UI.radius.lg),
		borderWidth: 1,
		borderColor: AUTH_UI.colors.border,
		padding: s(16),
		gap: vs(12),
	},
	cardHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	questionIndex: {
		fontSize: ms(12),
		fontWeight: "600",
		color: AUTH_UI.colors.accent,
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
	questionContent: {
		fontSize: ms(14),
		color: AUTH_UI.colors.textPrimary,
		lineHeight: ms(21),
		fontWeight: "500",
	},
	options: {
		gap: vs(8),
	},
	option: {
		flexDirection: "row",
		alignItems: "center",
		gap: s(10),
		padding: s(12),
		borderRadius: ms(AUTH_UI.radius.lg),
		borderWidth: 1,
		borderColor: AUTH_UI.colors.border,
		backgroundColor: AUTH_UI.colors.background,
	},
	optionSelected: {
		flexDirection: "row",
		alignItems: "center",
		gap: s(10),
		padding: s(12),
		borderRadius: ms(AUTH_UI.radius.lg),
		borderWidth: 1,
		borderColor: AUTH_UI.colors.accent,
		backgroundColor: AUTH_UI.colors.background,
	},
	optionCorrect: {
		flexDirection: "row",
		alignItems: "center",
		gap: s(10),
		padding: s(12),
		borderRadius: ms(AUTH_UI.radius.lg),
		borderWidth: 1,
		borderColor: colors.success,
		backgroundColor: withAlpha(colors.success, 0.12),
	},
	optionWrong: {
		flexDirection: "row",
		alignItems: "center",
		gap: s(10),
		padding: s(12),
		borderRadius: ms(AUTH_UI.radius.lg),
		borderWidth: 1,
		borderColor: colors.danger,
		backgroundColor: withAlpha(colors.danger, 0.12),
	},
	optionDot: {
		width: ms(16),
		height: ms(16),
		borderRadius: ms(8),
		borderWidth: 1.5,
		borderColor: AUTH_UI.colors.textSecondary,
	},
	optionDotSelected: {
		borderColor: AUTH_UI.colors.accent,
		backgroundColor: AUTH_UI.colors.accent,
	},
	optionText: {
		flex: 1,
		fontSize: ms(13),
		color: AUTH_UI.colors.textPrimary,
		lineHeight: ms(19),
	},
	optionTextCorrect: {
		flex: 1,
		fontSize: ms(13),
		color: colors.success,
		lineHeight: ms(19),
		fontWeight: "600",
	},
	optionTextWrong: {
		flex: 1,
		fontSize: ms(13),
		color: colors.danger,
		lineHeight: ms(19),
	},
	loadingMore: {
		textAlign: "center",
		color: AUTH_UI.colors.textSecondary,
		fontSize: ms(13),
		paddingVertical: vs(12),
	},
});
