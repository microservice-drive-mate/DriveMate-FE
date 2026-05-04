import { AUTH_UI } from "@/constants/auth-ui";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function CircularProgress({
	percentage,
	size = 140,
	strokeWidth = 12,
	fillColor,
}: {
	percentage: number;
	size: number;
	strokeWidth: number;
	fillColor: string;
}) {
	const p = Math.min(100, Math.max(0, percentage));
	const rightP = Math.min(p, 50);
	const leftP = Math.max(0, p - 50);
	const half = size / 2;

	const θRight = 180 * (1 - rightP / 50);
	const θLeft = 180 * (1 - leftP / 50);

	const ringBase = {
		position: "absolute" as const,
		width: size,
		height: size,
		borderRadius: half,
		borderWidth: strokeWidth,
	};

	return (
		<View style={{ width: size, height: size }}>
			{/* Track */}
			<View style={[ringBase, { borderColor: AUTH_UI.colors.surfaceMuted }]} />

			{/* Right half clip: reveals 0-50% */}
			<View
				style={{
					position: "absolute",
					left: half,
					width: half,
					height: size,
					overflow: "hidden",
				}}>
				<View
					style={[
						ringBase,
						{
							right: 0,
							left: undefined,
							borderColor: fillColor,
							transform: [{ rotate: `${θRight}deg` }],
						},
					]}
				/>
			</View>

			{/* Left half clip: reveals 50-100% */}
			<View
				style={{
					position: "absolute",
					left: 0,
					width: half,
					height: size,
					overflow: "hidden",
				}}>
				<View
					style={[
						ringBase,
						{
							left: 0,
							borderColor: fillColor,
							transform: [{ rotate: `${θLeft}deg` }],
						},
					]}
				/>
			</View>
		</View>
	);
}

export default function ExamResultScreen() {
	const { id, correct, wrong, skipped, elapsed, hitCritical, total, answersJson } =
		useLocalSearchParams<{
			id: string;
			correct: string;
			wrong: string;
			skipped: string;
			elapsed: string;
			hitCritical: string;
			total: string;
			answersJson: string;
		}>();

	const router = useRouter();

	const correctCount = parseInt(correct ?? "0", 10);
	const wrongCount = parseInt(wrong ?? "0", 10);
	const skippedCount = parseInt(skipped ?? "0", 10);
	const totalCount = parseInt(total ?? "1", 10);
	const isCritical = hitCritical === "1";

	const percentage = Math.round((correctCount / totalCount) * 100);
	const isPassed = percentage >= 80 && !isCritical;
	const fillColor = isPassed ? AUTH_UI.colors.success : AUTH_UI.colors.danger;

	return (
		<SafeAreaView style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity
					style={styles.backBtn}
					onPress={() => router.back()}>
					<Ionicons name="arrow-back" size={20} color={AUTH_UI.colors.textPrimary} />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Kết Quả Thi</Text>
				<View style={styles.backBtn} />
			</View>

			<ScrollView
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}>
				{/* Circular progress */}
				<View style={styles.progressContainer}>
					<CircularProgress
						percentage={percentage}
						size={140}
						strokeWidth={12}
						fillColor={fillColor}
					/>
					<View style={styles.progressCenter}>
						<Text style={[styles.percentText, { color: fillColor }]}>
							{percentage}%
						</Text>
						<Text style={styles.correctLabel}>
							{correctCount}/{totalCount} đúng
						</Text>
					</View>
				</View>

				{/* Pass / Fail badge */}
				<View
					style={[
						styles.resultBadge,
						isPassed ? styles.resultBadgePassed : styles.resultBadgeFailed,
					]}>
					<Text
						style={[
							styles.resultBadgeText,
							{
								color: isPassed
									? AUTH_UI.colors.success
									: AUTH_UI.colors.danger,
							},
						]}>
						{isPassed ? "✓ ĐẠT" : "✕ KHÔNG ĐẠT"}
					</Text>
				</View>

				{/* Critical question warning */}
				{isCritical && (
					<View style={styles.criticalWarning}>
						<Ionicons name="warning-outline" size={18} color={AUTH_UI.colors.danger} />
						<View style={styles.criticalWarningText}>
							<Text style={styles.criticalTitle}>Dính câu điểm liệt!</Text>
							<Text style={styles.criticalSubtitle}>
								Bạn đã trả lời sai câu điểm liệt. Hãy ôn lại kỹ các quy định
								quan trọng.
							</Text>
						</View>
					</View>
				)}

				{/* Stats grid */}
				<View style={styles.statsRow}>
					<View style={[styles.statBox, { backgroundColor: "#1B4332" }]}>
						<Text style={[styles.statNum, { color: AUTH_UI.colors.success }]}>
							{correctCount}
						</Text>
						<Text style={[styles.statLbl, { color: AUTH_UI.colors.success }]}>
							Đúng
						</Text>
					</View>
					<View style={[styles.statBox, { backgroundColor: "#3B0F0F" }]}>
						<Text style={[styles.statNum, { color: AUTH_UI.colors.danger }]}>
							{wrongCount}
						</Text>
						<Text style={[styles.statLbl, { color: AUTH_UI.colors.danger }]}>
							Sai
						</Text>
					</View>
					<View style={[styles.statBox, { backgroundColor: AUTH_UI.colors.surfaceMuted }]}>
						<Text style={[styles.statNum, { color: AUTH_UI.colors.textSecondary }]}>
							{skippedCount}
						</Text>
						<Text style={[styles.statLbl, { color: AUTH_UI.colors.textSecondary }]}>
							Bỏ
						</Text>
					</View>
					<View style={[styles.statBox, { backgroundColor: "#2A2200" }]}>
						<Text style={[styles.statNum, { color: "#C9A227" }]}>{elapsed}</Text>
						<Text style={[styles.statLbl, { color: "#C9A227" }]}>Thời gian</Text>
					</View>
				</View>

				{/* Review wrong answers */}
				{wrongCount > 0 && (
					<TouchableOpacity
						style={styles.reviewBtn}
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						onPress={() =>
							(router.push as any)({
								pathname: "/exam-session/review/[id]",
								params: { id: id ?? "", answersJson: answersJson ?? "{}" },
							})
						}>
						<Ionicons name="eye-outline" size={18} color={AUTH_UI.colors.textPrimary} />
						<Text style={styles.reviewBtnText}>Xem lại câu sai ({wrongCount})</Text>
					</TouchableOpacity>
				)}

				{/* Action buttons */}
				<View style={styles.actions}>
					<TouchableOpacity
						style={styles.retryBtn}
						onPress={() =>
							// eslint-disable-next-line @typescript-eslint/no-explicit-any
							(router.replace as any)({
								pathname: "/exam-session/take/[id]",
								params: { id: id ?? "" },
							})
						}>
						<Ionicons name="refresh-outline" size={18} color={AUTH_UI.colors.textPrimary} />
						<Text style={styles.retryBtnText}>Làm lại</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.homeBtn}
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						onPress={() => (router.replace as any)("/")}>
						<Ionicons name="home-outline" size={18} color={AUTH_UI.colors.accentText} />
						<Text style={styles.homeBtnText}>Trang chủ</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</SafeAreaView>
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
	},
	backBtn: {
		width: 36,
		height: 36,
		borderRadius: 18,
		backgroundColor: AUTH_UI.colors.surface,
		alignItems: "center",
		justifyContent: "center",
	},
	headerTitle: {
		flex: 1,
		fontSize: 18,
		fontWeight: "700",
		color: AUTH_UI.colors.textPrimary,
		textAlign: "center",
	},
	content: {
		paddingHorizontal: 20,
		paddingTop: 24,
		paddingBottom: 40,
		alignItems: "center",
		gap: 20,
	},
	progressContainer: {
		width: 140,
		height: 140,
		alignItems: "center",
		justifyContent: "center",
	},
	progressCenter: {
		position: "absolute",
		alignItems: "center",
		gap: 2,
	},
	percentText: {
		fontSize: 28,
		fontWeight: "800",
	},
	correctLabel: {
		fontSize: 12,
		color: AUTH_UI.colors.textSecondary,
	},
	resultBadge: {
		paddingHorizontal: 20,
		paddingVertical: 8,
		borderRadius: 20,
	},
	resultBadgePassed: {
		backgroundColor: "rgba(83,209,141,0.15)",
		borderWidth: 1,
		borderColor: "rgba(83,209,141,0.3)",
	},
	resultBadgeFailed: {
		backgroundColor: "rgba(248,113,113,0.15)",
		borderWidth: 1,
		borderColor: "rgba(248,113,113,0.3)",
	},
	resultBadgeText: {
		fontSize: 14,
		fontWeight: "700",
		letterSpacing: 1,
	},
	criticalWarning: {
		flexDirection: "row",
		alignItems: "flex-start",
		gap: 10,
		backgroundColor: "rgba(248,113,113,0.1)",
		borderRadius: AUTH_UI.radius.xl,
		borderWidth: 1,
		borderColor: "rgba(248,113,113,0.25)",
		padding: 14,
		width: "100%",
	},
	criticalWarningText: {
		flex: 1,
		gap: 4,
	},
	criticalTitle: {
		fontSize: 14,
		fontWeight: "700",
		color: AUTH_UI.colors.danger,
	},
	criticalSubtitle: {
		fontSize: 13,
		color: AUTH_UI.colors.textSecondary,
		lineHeight: 18,
	},
	statsRow: {
		flexDirection: "row",
		gap: 10,
		width: "100%",
	},
	statBox: {
		flex: 1,
		borderRadius: AUTH_UI.radius.xl,
		padding: 12,
		alignItems: "center",
		gap: 4,
	},
	statNum: {
		fontSize: 18,
		fontWeight: "700",
	},
	statLbl: {
		fontSize: 11,
		fontWeight: "500",
	},
	reviewBtn: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		backgroundColor: AUTH_UI.colors.surface,
		borderRadius: AUTH_UI.radius.xl,
		paddingVertical: 14,
		paddingHorizontal: 20,
		width: "100%",
		justifyContent: "center",
		borderWidth: 1,
		borderColor: AUTH_UI.colors.border,
	},
	reviewBtnText: {
		fontSize: 15,
		fontWeight: "600",
		color: AUTH_UI.colors.textPrimary,
	},
	actions: {
		flexDirection: "row",
		gap: 10,
		width: "100%",
	},
	retryBtn: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
		backgroundColor: AUTH_UI.colors.surface,
		borderRadius: AUTH_UI.radius.xl,
		paddingVertical: 14,
		borderWidth: 1,
		borderColor: AUTH_UI.colors.border,
	},
	retryBtnText: {
		fontSize: 15,
		fontWeight: "600",
		color: AUTH_UI.colors.textPrimary,
	},
	homeBtn: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
		backgroundColor: AUTH_UI.colors.accent,
		borderRadius: AUTH_UI.radius.xl,
		paddingVertical: 14,
	},
	homeBtnText: {
		fontSize: 15,
		fontWeight: "700",
		color: AUTH_UI.colors.accentText,
	},
});
