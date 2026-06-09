import { BottomSheet } from "@/components/common/BottomSheet";
import { Button } from "@/components/common/Button";
import { StatBox } from "@/components/common/StatBox";
import { colors } from "@/theme";
import { ms, s, vs } from "@/utils/responsive";
import { StyleSheet, Text, View } from "react-native";

interface SubmitConfirmSheetProps {
	visible: boolean;
	onClose: () => void;
	answeredCount: number;
	skippedCount: number;
	bookmarkedCount: number;
	isSubmitting: boolean;
	onConfirm: () => void;
}

/** Bottom sheet xác nhận nộp bài: tóm tắt số câu đã làm/bỏ qua/gắn cờ + hành động. */
export function SubmitConfirmSheet({
	visible,
	onClose,
	answeredCount,
	skippedCount,
	bookmarkedCount,
	isSubmitting,
	onConfirm,
}: SubmitConfirmSheetProps) {
	return (
		<BottomSheet visible={visible} onClose={onClose}>
			<Text style={styles.title}>Nộp bài?</Text>
			<Text style={styles.subtitle}>Bạn có chắc muốn nộp bài thi này không?</Text>

			<View style={styles.stats}>
				<StatBox
					value={answeredCount}
					label="Đã làm"
					bg={colors.answeredBg}
					valueColor={colors.success}
					labelColor={colors.success}
				/>
				<StatBox
					value={skippedCount}
					label="Bỏ qua"
					bg={colors.skippedBg}
					valueColor={colors.danger}
					labelColor={colors.danger}
				/>
				<StatBox
					value={bookmarkedCount}
					label="Gắn cờ"
					bg={colors.bookmarkBg}
					valueColor={colors.warning}
					labelColor={colors.warning}
				/>
			</View>

			<View style={styles.actions}>
				<Button
					variant="secondary"
					label="Làm tiếp"
					flex
					onPress={onClose}
					style={styles.actionBtn}
				/>
				<Button
					variant="primary"
					label={isSubmitting ? "Đang nộp..." : "✓ Nộp bài"}
					flex
					disabled={isSubmitting}
					onPress={onConfirm}
					style={styles.actionBtn}
				/>
			</View>
		</BottomSheet>
	);
}

const styles = StyleSheet.create({
	title: {
		fontSize: ms(20),
		fontWeight: "700",
		color: colors.textPrimary,
		textAlign: "center",
		marginBottom: vs(6),
	},
	subtitle: {
		fontSize: ms(14),
		color: colors.textSecondary,
		textAlign: "center",
		marginBottom: vs(20),
	},
	stats: {
		flexDirection: "row",
		gap: s(10),
		marginBottom: vs(20),
	},
	actions: {
		flexDirection: "row",
		gap: s(10),
	},
	actionBtn: {
		height: vs(50),
	},
});
