import { AUTH_UI } from "@/constants/auth-ui";
import { ms, s, vs } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type HistoryCardProps = {
	title: string;
	meta: string;
	score: number;
	total: number;
	passed: boolean;
	onPress: () => void;
};

export function HistoryCard({
	title,
	meta,
	score,
	total,
	passed,
	onPress,
}: HistoryCardProps) {
	return (
		<TouchableOpacity
			style={styles.card}
			activeOpacity={0.86}
			onPress={onPress}>
			<View
				style={[
					styles.statusIconWrap,
					passed ? styles.statusPass : styles.statusFail,
				]}>
				<Ionicons
					name={
						passed
							? "checkmark-circle-outline"
							: "close-circle-outline"
					}
					size={ms(24)}
					color={
						passed ? AUTH_UI.colors.success : AUTH_UI.colors.danger
					}
				/>
			</View>

			<View style={styles.info}>
				<Text
					style={styles.title}
					numberOfLines={1}>
					{title}
				</Text>
				<Text style={styles.meta}>{meta}</Text>
			</View>

			<View style={styles.scoreWrap}>
				<Text
					style={[
						styles.score,
						passed ? styles.scorePass : styles.scoreFail,
					]}>
					{score}/{total}
				</Text>
				<View
					style={[
						styles.badge,
						passed ? styles.badgePass : styles.badgeFail,
					]}>
					<Text
						style={[
							styles.badgeText,
							passed
								? styles.badgeTextPass
								: styles.badgeTextFail,
						]}>
						{passed ? "Đạt" : "Không đạt"}
					</Text>
				</View>
			</View>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	card: {
		backgroundColor: AUTH_UI.colors.surfaceMuted,
		borderRadius: ms(18),
		borderWidth: 1,
		borderColor: AUTH_UI.colors.border,
		padding: s(14),
		flexDirection: "row",
		alignItems: "center",
		gap: s(12),
	},
	statusIconWrap: {
		width: s(52),
		height: s(52),
		borderRadius: ms(14),
		alignItems: "center",
		justifyContent: "center",
	},
	statusPass: {
		backgroundColor: "rgba(12, 117, 71, 0.35)",
	},
	statusFail: {
		backgroundColor: "rgba(124, 18, 18, 0.35)",
	},
	info: {
		flex: 1,
		gap: vs(3),
	},
	title: {
		fontSize: ms(15),
		fontWeight: "800",
		color: AUTH_UI.colors.textPrimary,
	},
	meta: {
		fontSize: ms(12),
		color: AUTH_UI.colors.textSecondary,
		fontWeight: "500",
	},
	scoreWrap: {
		alignItems: "flex-end",
		gap: s(8),
	},
	score: {
		fontSize: ms(17),
		fontWeight: "900",
	},
	scorePass: {
		color: AUTH_UI.colors.success,
	},
	scoreFail: {
		color: AUTH_UI.colors.danger,
	},
	badge: {
		borderRadius: 999,
		paddingHorizontal: s(10),
		paddingVertical: vs(3),
	},
	badgePass: {
		backgroundColor: "rgba(83, 209, 141, 0.18)",
	},
	badgeFail: {
		backgroundColor: "rgba(248, 113, 113, 0.16)",
	},
	badgeText: {
		fontSize: ms(12),
		fontWeight: "700",
	},
	badgeTextPass: {
		color: AUTH_UI.colors.success,
	},
	badgeTextFail: {
		color: AUTH_UI.colors.danger,
	},
});
