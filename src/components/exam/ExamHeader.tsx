import { Button } from "@/components/common/Button";
import { colors, radius, withAlpha } from "@/theme";
import { formatDuration } from "@/utils/examFormat";
import { ms, s, vs } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ExamHeaderProps {
	remainingSeconds: number;
	isTimeLow: boolean;
	isBookmarked: boolean;
	currentIndex: number;
	totalQuestions: number;
	onBack: () => void;
	onToggleBookmark: () => void;
	onOpenNav: () => void;
}

/** Thanh trên cùng của màn làm bài: nút quay lại, đồng hồ, gắn cờ, bộ đếm câu. */
export function ExamHeader({
	remainingSeconds,
	isTimeLow,
	isBookmarked,
	currentIndex,
	totalQuestions,
	onBack,
	onToggleBookmark,
	onOpenNav,
}: ExamHeaderProps) {
	return (
		<View style={styles.header}>
			<Button variant="icon" icon="arrow-back" onPress={onBack} />

			<TouchableOpacity
				style={[styles.timerBadge, isTimeLow && styles.timerBadgeLow]}
				activeOpacity={1}>
				<Ionicons
					name="timer-outline"
					size={ms(16)}
					color={isTimeLow ? colors.danger : colors.accent}
				/>
				<Text style={[styles.timerText, isTimeLow && styles.timerTextLow]}>
					{formatDuration(remainingSeconds)}
				</Text>
			</TouchableOpacity>

			<Button
				variant="icon"
				icon={isBookmarked ? "flag" : "flag-outline"}
				onPress={onToggleBookmark}
				style={isBookmarked ? styles.flaggedBtn : undefined}
			/>

			<TouchableOpacity style={styles.counterBadge} onPress={onOpenNav}>
				<Text style={styles.counterText}>
					{currentIndex + 1}/{totalQuestions}
				</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
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
		backgroundColor: colors.surface,
		borderRadius: ms(radius.xl),
		paddingVertical: vs(8),
		borderWidth: 1,
		borderColor: colors.border,
	},
	timerBadgeLow: {
		borderColor: withAlpha(colors.danger, 0.5),
		backgroundColor: withAlpha(colors.danger, 0.1),
	},
	timerText: {
		fontSize: ms(16),
		fontWeight: "700",
		color: colors.accent,
	},
	timerTextLow: {
		color: colors.danger,
	},
	flaggedBtn: {
		backgroundColor: withAlpha(colors.accent, 0.15),
	},
	counterBadge: {
		backgroundColor: colors.surface,
		borderRadius: ms(radius.lg),
		paddingHorizontal: s(12),
		paddingVertical: vs(8),
		borderWidth: 1,
		borderColor: colors.border,
	},
	counterText: {
		fontSize: ms(14),
		fontWeight: "600",
		color: colors.textPrimary,
	},
});
