import { BottomSheet } from "@/components/common/BottomSheet";
import { ExamSessionQuestion } from "@/models/examSession.model";
import { colors, radius } from "@/theme";
import { ms, s, vs } from "@/utils/responsive";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface QuestionNavigatorSheetProps {
	visible: boolean;
	onClose: () => void;
	questions: ExamSessionQuestion[];
	currentQuestionIndex: number;
	answers: Record<string, string | null>;
	bookmarks: Record<string, boolean>;
	onSelectIndex: (index: number) => void;
}

/** Bottom sheet lưới điều hướng nhanh giữa các câu hỏi, kèm chú thích trạng thái. */
export function QuestionNavigatorSheet({
	visible,
	onClose,
	questions,
	currentQuestionIndex,
	answers,
	bookmarks,
	onSelectIndex,
}: QuestionNavigatorSheetProps) {
	return (
		<BottomSheet visible={visible} onClose={onClose}>
			<Text style={styles.title}>Điều hướng câu hỏi</Text>

			<View style={styles.grid}>
				{questions.map((q, idx) => {
					const isCurrent = idx === currentQuestionIndex;
					const isAnswered =
						answers[q.questionId] !== null && answers[q.questionId] !== undefined;
					const isBookmarked = bookmarks[q.questionId];
					let bg = colors.surface;
					let textColor = colors.textSecondary;
					if (isCurrent) {
						bg = colors.accent;
						textColor = colors.accentText;
					} else if (isBookmarked) {
						bg = colors.bookmarkBg;
						textColor = colors.warning;
					} else if (isAnswered) {
						bg = colors.answeredBg;
						textColor = colors.success;
					}
					return (
						<TouchableOpacity
							key={q.questionId}
							style={[styles.gridItem, { backgroundColor: bg }]}
							onPress={() => onSelectIndex(idx)}>
							<Text style={[styles.gridText, { color: textColor }]}>{idx + 1}</Text>
						</TouchableOpacity>
					);
				})}
			</View>

			<View style={styles.legend}>
				<View style={styles.legendItem}>
					<View style={[styles.legendDot, { backgroundColor: colors.accent }]} />
					<Text style={styles.legendText}>Đang làm</Text>
				</View>
				<View style={styles.legendItem}>
					<View style={[styles.legendDot, { backgroundColor: colors.answeredBg }]} />
					<Text style={styles.legendText}>Đã trả lời</Text>
				</View>
				<View style={styles.legendItem}>
					<View style={[styles.legendDot, { backgroundColor: colors.bookmarkBg }]} />
					<Text style={styles.legendText}>Gắn cờ</Text>
				</View>
			</View>
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
	grid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: s(10),
	},
	gridItem: {
		width: s(40),
		height: s(40),
		borderRadius: ms(radius.lg),
		alignItems: "center",
		justifyContent: "center",
	},
	gridText: {
		fontSize: ms(14),
		fontWeight: "700",
	},
	legend: {
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
		color: colors.textSecondary,
	},
});
