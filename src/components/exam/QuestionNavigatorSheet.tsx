import { BottomSheet } from "@/components/common/BottomSheet";
import { ExamSessionQuestion } from "@/models/examSession.model";
import { colors, radius, withAlpha } from "@/theme";
import { ms, s, vs } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface QuestionNavigatorSheetProps {
	visible: boolean;
	onClose: () => void;
	questions: ExamSessionQuestion[];
	currentQuestionIndex: number;
	answers: Record<string, string | null>;
	bookmarks: Record<string, boolean>;
	onSelectIndex: (index: number) => void;
}

type Filter = "all" | "answered" | "unanswered" | "flagged";

/** Bottom sheet điều hướng câu hỏi: lọc theo trạng thái + danh sách kèm nội dung. */
export function QuestionNavigatorSheet({
	visible,
	onClose,
	questions,
	currentQuestionIndex,
	answers,
	bookmarks,
	onSelectIndex,
}: QuestionNavigatorSheetProps) {
	const [filter, setFilter] = useState<Filter>("all");

	const counts = useMemo(() => {
		let answered = 0;
		let flagged = 0;
		questions.forEach((q) => {
			if (answers[q.questionId] != null) answered += 1;
			if (bookmarks[q.questionId]) flagged += 1;
		});
		return {
			all: questions.length,
			answered,
			unanswered: questions.length - answered,
			flagged,
		};
	}, [questions, answers, bookmarks]);

	const filteredItems = useMemo(
		() =>
			questions
				.map((q, idx) => ({ q, idx }))
				.filter(({ q }) => {
					const isAnswered = answers[q.questionId] != null;
					const isBookmarked = bookmarks[q.questionId];
					if (filter === "answered") return isAnswered;
					if (filter === "unanswered") return !isAnswered;
					if (filter === "flagged") return isBookmarked;
					return true;
				}),
		[questions, answers, bookmarks, filter],
	);

	const tabs: { key: Filter; label: string; count: number }[] = [
		{ key: "all", label: "Tất cả", count: counts.all },
		{ key: "answered", label: "Đã làm", count: counts.answered },
		{ key: "unanswered", label: "Chưa làm", count: counts.unanswered },
		{ key: "flagged", label: "Gắn cờ", count: counts.flagged },
	];

	return (
		<BottomSheet visible={visible} onClose={onClose}>
			<Text style={styles.title}>Điều hướng câu hỏi</Text>

			<View style={styles.tabs}>
				{tabs.map((tab) => {
					const active = filter === tab.key;
					return (
						<TouchableOpacity
							key={tab.key}
							style={[styles.tab, active && styles.tabActive]}
							onPress={() => setFilter(tab.key)}>
							<Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
								{tab.label}
							</Text>
							<Text style={[styles.tabCount, active && styles.tabCountActive]}>
								{tab.count}
							</Text>
						</TouchableOpacity>
					);
				})}
			</View>

			{filteredItems.length === 0 ? (
				<View style={styles.empty}>
					<Text style={styles.emptyText}>Không có câu nào</Text>
				</View>
			) : (
				<ScrollView
					style={styles.list}
					contentContainerStyle={styles.listContent}
					showsVerticalScrollIndicator={false}>
					{filteredItems.map(({ q, idx }) => {
						const isCurrent = idx === currentQuestionIndex;
						const isAnswered = answers[q.questionId] != null;
						const isBookmarked = bookmarks[q.questionId];

						let badgeBg = colors.surfaceMuted;
						let badgeColor = colors.textSecondary;
						if (isCurrent) {
							badgeBg = colors.accent;
							badgeColor = colors.accentText;
						} else if (isBookmarked) {
							badgeBg = colors.bookmarkBg;
							badgeColor = colors.warning;
						} else if (isAnswered) {
							badgeBg = colors.answeredBg;
							badgeColor = colors.success;
						}

						return (
							<TouchableOpacity
								key={q.questionId}
								style={[styles.row, isCurrent && styles.rowCurrent]}
								onPress={() => onSelectIndex(idx)}>
								<View style={[styles.badge, { backgroundColor: badgeBg }]}>
									<Text style={[styles.badgeText, { color: badgeColor }]}>
										{idx + 1}
									</Text>
								</View>

								<Text style={styles.rowContent} numberOfLines={2}>
									{q.content}
								</Text>

								<View style={styles.status}>
									{isBookmarked && (
										<Ionicons name="flag" size={ms(16)} color={colors.warning} />
									)}
									{isAnswered ? (
										<Ionicons
											name="checkmark-circle"
											size={ms(16)}
											color={colors.success}
										/>
									) : (
										<Text style={styles.statusMuted}>Chưa làm</Text>
									)}
								</View>
							</TouchableOpacity>
						);
					})}
				</ScrollView>
			)}
		</BottomSheet>
	);
}

const styles = StyleSheet.create({
	title: {
		fontSize: ms(16),
		fontWeight: "700",
		color: colors.textPrimary,
		marginBottom: vs(16),
	},
	tabs: {
		flexDirection: "row",
		gap: s(8),
		marginBottom: vs(12),
	},
	tab: {
		flex: 1,
		alignItems: "center",
		paddingVertical: vs(8),
		borderRadius: ms(radius.lg),
		backgroundColor: colors.surfaceMuted,
		gap: vs(2),
	},
	tabActive: {
		backgroundColor: colors.accent,
	},
	tabLabel: {
		fontSize: ms(12),
		fontWeight: "600",
		color: colors.textSecondary,
	},
	tabLabelActive: {
		color: colors.accentText,
	},
	tabCount: {
		fontSize: ms(13),
		fontWeight: "700",
		color: colors.textPrimary,
	},
	tabCountActive: {
		color: colors.accentText,
	},
	list: {
		maxHeight: vs(360),
	},
	listContent: {
		gap: s(8),
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		gap: s(12),
		padding: s(10),
		borderRadius: ms(radius.lg),
		backgroundColor: colors.surface,
		borderWidth: 1,
		borderColor: "transparent",
	},
	rowCurrent: {
		borderColor: colors.accent,
		backgroundColor: withAlpha(colors.accent, 0.1),
	},
	badge: {
		width: s(36),
		height: s(36),
		borderRadius: ms(radius.lg),
		alignItems: "center",
		justifyContent: "center",
	},
	badgeText: {
		fontSize: ms(14),
		fontWeight: "700",
	},
	rowContent: {
		flex: 1,
		fontSize: ms(13),
		lineHeight: ms(18),
		color: colors.textPrimary,
	},
	status: {
		flexDirection: "row",
		alignItems: "center",
		gap: s(6),
	},
	statusMuted: {
		fontSize: ms(11),
		color: colors.textMuted,
	},
	empty: {
		paddingVertical: vs(40),
		alignItems: "center",
	},
	emptyText: {
		fontSize: ms(14),
		color: colors.textSecondary,
	},
});
