import { colors } from "@/theme";
import { ms, s, vs } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { ReactNode } from "react";
import {
	ActivityIndicator,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
	ViewStyle,
} from "react-native";

interface AsyncContentProps {
	loading: boolean;
	error?: string | null;
	/** Hiển thị nút "Thử lại" khi có lỗi. */
	onRetry?: () => void;
	children: ReactNode;
	/** Style bổ sung cho vùng canh giữa (loading/error). */
	centerStyle?: ViewStyle;
}

/**
 * Bọc trạng thái bất đồng bộ chung: loading → spinner, error → thông báo + nút thử lại,
 * còn lại render children. Thay cho block `isLoading ? ... : error ? ... : content` lặp lại.
 */
export function AsyncContent({
	loading,
	error,
	onRetry,
	children,
	centerStyle,
}: AsyncContentProps) {
	if (loading) {
		return (
			<View style={[styles.center, centerStyle]}>
				<ActivityIndicator color={colors.accent} size="large" />
			</View>
		);
	}

	if (error) {
		return (
			<View style={[styles.center, centerStyle]}>
				<Text style={styles.errorText}>{error}</Text>
				{onRetry && (
					<TouchableOpacity onPress={onRetry} style={styles.retryBtn}>
						<Ionicons name="refresh-outline" size={ms(16)} color={colors.accent} />
						<Text style={styles.retryText}>Thử lại</Text>
					</TouchableOpacity>
				)}
			</View>
		);
	}

	return <>{children}</>;
}

const styles = StyleSheet.create({
	center: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		gap: vs(12),
	},
	errorText: {
		fontSize: ms(14),
		color: colors.textSecondary,
		textAlign: "center",
		paddingHorizontal: s(32),
	},
	retryBtn: {
		flexDirection: "row",
		alignItems: "center",
		gap: s(6),
		paddingHorizontal: s(16),
		paddingVertical: vs(8),
		borderRadius: ms(12),
		borderWidth: 1,
		borderColor: colors.accent,
	},
	retryText: {
		fontSize: ms(14),
		fontWeight: "600",
		color: colors.accent,
	},
});
