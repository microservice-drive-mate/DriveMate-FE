import { ScreenWrapper } from "@/components/screen-wrapper";
import { AUTH_UI } from "@/constants/auth-ui";
import { ms, s, vs } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const successTint = "rgba(83,209,141,0.13)";
const dangerTint = "rgba(248,113,113,0.13)";

const metrics = [
	{ id: "1", label: "Ngày liên tục", value: "7", icon: "flame" as const },
	{
		id: "2",
		label: "Bài thi",
		value: "34",
		icon: "document-text-outline" as const,
	},
	{
		id: "3",
		label: "Tỷ lệ đạt",
		value: "91%",
		icon: "stats-chart-outline" as const,
	},
];

const weakPoints = [
	{ id: "w1", label: "Biển báo cấm", pct: 60 },
	{ id: "w2", label: "Tốc độ tối đa", pct: 55 },
	{ id: "w3", label: "Nhường đường", pct: 70 },
];

const recentTests = [
	{
		id: "a",
		title: "Đề thi B1 - Số 12",
		date: "07/04/2026",
		score: "42/45",
		ok: true,
	},
	{
		id: "b",
		title: "Đề thi B1 - Số 08",
		date: "05/04/2026",
		score: "38/45",
		ok: false,
	},
	{
		id: "c",
		title: "Đề thi B1 - Số 15",
		date: "03/04/2026",
		score: "44/45",
		ok: true,
	},
];

export default function Home() {
	const router = useRouter();
	return (
		<ScreenWrapper
			backgroundColor={AUTH_UI.colors.background}
			edges={["top", "bottom"]}
			scroll={true}>
			<View style={styles.container}>
				{/* Header */}
				<View style={styles.header}>
					<View style={styles.avatar}>
						<Text style={styles.avatarText}>NV</Text>
					</View>
					<View style={{ flex: 1, marginLeft: s(12) }}>
						<Text style={styles.hello}>Xin chào 🔥</Text>
						<Text style={styles.name}>Nguyễn Văn An</Text>
					</View>
					<TouchableOpacity
						style={styles.bell}
						onPress={() => router.push("/notifications")}>
						<Ionicons
							name="notifications-outline"
							size={ms(20)}
							color={AUTH_UI.colors.textSecondary}
						/>
					</TouchableOpacity>
				</View>

				{/* Progress Card */}
				<View style={styles.progressCard}>
					<View>
						<Text style={styles.levelLabel}>
							Hạng bằng đang học
						</Text>
						<Text style={styles.level}>B1</Text>
						<Text style={styles.vehicle}>Ô tô dưới 9 chỗ</Text>
					</View>
					<View style={styles.progressRight}>
						<Text style={styles.progressLabel}>Tiến độ</Text>
						<Text style={styles.progressPercent}>72%</Text>
					</View>
					<View style={styles.progressBarTrack}>
						<View
							style={[styles.progressBarFill, { width: "72%" }]}
						/>
					</View>
				</View>

				{/* Metrics */}
				<View style={styles.metricsRow}>
					{metrics.map((m) => (
						<View
							key={m.id}
							style={styles.metricCard}>
							<Ionicons
								name={m.icon}
								size={ms(20)}
								color={AUTH_UI.colors.accent}
							/>
							<Text style={styles.metricValue}>{m.value}</Text>
							<Text style={styles.metricLabel}>{m.label}</Text>
						</View>
					))}
				</View>

				{/* Quick Practice */}
				<Text style={styles.sectionTitle}>Luyện tập nhanh</Text>
				<View style={styles.quickRow}>
					<TouchableOpacity style={[styles.btn, styles.btnPrimary]}>
						<Ionicons
							name="flash"
							size={ms(16)}
							color={AUTH_UI.colors.accentText}
						/>
						<Text style={styles.btnText}>Thi ngay</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.btn}>
						<Ionicons
							name="book-outline"
							size={ms(16)}
							color={AUTH_UI.colors.textSecondary}
						/>
						<Text style={styles.btnTextMuted}>Ôn yếu điểm</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.btn}>
						<Ionicons
							name="map-outline"
							size={ms(16)}
							color={AUTH_UI.colors.textSecondary}
						/>
						<Text style={styles.btnTextMuted}>Sa hình</Text>
					</TouchableOpacity>
				</View>

				{/* Weak Points */}
				<View style={styles.sectionHeader}>
					<Text style={styles.sectionTitle}>Điểm yếu cần ôn</Text>
					<TouchableOpacity>
						<Text style={styles.sectionLink}>Xem tất cả →</Text>
					</TouchableOpacity>
				</View>
				{weakPoints.map((wp) => {
					const isLow = wp.pct < 65;
					const barColor = isLow
						? AUTH_UI.colors.danger
						: AUTH_UI.colors.accent;
					return (
						<View
							key={wp.id}
							style={styles.weakItem}>
							<View style={styles.weakIconBox}>
								<Ionicons
									name="ribbon-outline"
									size={ms(16)}
									color={AUTH_UI.colors.accent}
								/>
							</View>
							<View style={styles.weakCenter}>
								<Text style={styles.weakLabel}>{wp.label}</Text>
								<View style={styles.weakBarTrack}>
									<View
										style={[
											styles.weakBarFill,
											{
												width: `${wp.pct}%`,
												backgroundColor: barColor,
											},
										]}
									/>
								</View>
							</View>
							<Text style={[styles.weakPct, { color: barColor }]}>
								{wp.pct}%
							</Text>
						</View>
					);
				})}

				{/* Recent Tests */}
				<View style={styles.sectionHeader}>
					<Text style={styles.sectionTitle}>Bài thi gần đây</Text>
					<TouchableOpacity>
						<Text style={styles.sectionLink}>Tất cả →</Text>
					</TouchableOpacity>
				</View>
				{recentTests.map((item) => (
					<View
						key={item.id}
						style={styles.testRow}>
						<View
							style={[
								styles.testIconBox,
								{
									backgroundColor: item.ok
										? successTint
										: dangerTint,
								},
							]}>
							<Ionicons
								name="document-text-outline"
								size={ms(18)}
								color={
									item.ok
										? AUTH_UI.colors.success
										: AUTH_UI.colors.danger
								}
							/>
						</View>
						<View style={styles.testMid}>
							<Text style={styles.testTitle}>{item.title}</Text>
							<Text style={styles.testDate}>{item.date}</Text>
						</View>
						<View style={styles.testRight}>
							<Text
								style={[
									styles.testScore,
									item.ok ? styles.success : styles.danger,
								]}>
								{item.score}
							</Text>
							<View
								style={[
									styles.testBadge,
									{
										backgroundColor: item.ok
											? successTint
											: dangerTint,
									},
								]}>
								<Text
									style={[
										styles.testBadgeText,
										{
											color: item.ok
												? AUTH_UI.colors.success
												: AUTH_UI.colors.danger,
										},
									]}>
									{item.ok ? "Đạt" : "Không đạt"}
								</Text>
							</View>
						</View>
					</View>
				))}
			</View>
		</ScreenWrapper>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: s(16), paddingBottom: vs(32), gap: vs(10) },

	// Header
	header: { flexDirection: "row", alignItems: "center", marginBottom: vs(12) },
	avatar: {
		width: s(48),
		height: s(48),
		borderRadius: ms(24),
		backgroundColor: AUTH_UI.colors.accent,
		alignItems: "center",
		justifyContent: "center",
	},
	avatarText: { color: AUTH_UI.colors.accentText, fontWeight: "700" },
	hello: { color: AUTH_UI.colors.textSecondary, fontSize: ms(12) },
	name: {
		color: AUTH_UI.colors.textPrimary,
		fontSize: ms(16),
		fontWeight: "700",
	},
	bell: {
		width: s(40),
		height: s(40),
		borderRadius: ms(12),
		backgroundColor: AUTH_UI.colors.surface,
		alignItems: "center",
		justifyContent: "center",
	},

	// Progress Card
	progressCard: {
		marginTop: vs(6),
		backgroundColor: AUTH_UI.colors.accent,
		borderRadius: ms(14),
		padding: s(16),
		paddingBottom: vs(26),
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		overflow: "hidden",
	},
	levelLabel: { color: AUTH_UI.colors.accentText, fontSize: ms(12) },
	level: {
		fontSize: ms(36),
		fontWeight: "800",
		color: AUTH_UI.colors.accentText,
	},
	vehicle: { color: AUTH_UI.colors.accentText, fontSize: ms(13) },
	progressRight: { alignItems: "flex-end" },
	progressLabel: {
		color: AUTH_UI.colors.accentText,
		fontSize: ms(12),
		marginBottom: vs(2),
	},
	progressPercent: {
		color: AUTH_UI.colors.accentText,
		fontWeight: "800",
		fontSize: ms(24),
	},
	progressBarTrack: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		height: vs(6),
		backgroundColor: "#D4A832",
	},
	progressBarFill: { height: vs(6), backgroundColor: AUTH_UI.colors.accentText },

	// Metrics
	metricsRow: { flexDirection: "row", gap: s(8), marginTop: vs(12) },
	metricCard: {
		flex: 1,
		backgroundColor: AUTH_UI.colors.surface,
		borderRadius: ms(12),
		padding: s(12),
		alignItems: "center",
		gap: vs(4),
	},
	metricValue: {
		color: AUTH_UI.colors.accent,
		fontWeight: "800",
		fontSize: ms(18),
	},
	metricLabel: {
		color: AUTH_UI.colors.textSecondary,
		fontSize: ms(11),
		textAlign: "center",
	},

	// Section headers
	sectionHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginVertical: vs(4),
	},
	sectionTitle: {
		color: AUTH_UI.colors.textPrimary,
		fontWeight: "700",
		fontSize: ms(15),
		marginVertical: vs(4),
	},
	sectionLink: {
		color: AUTH_UI.colors.accent,
		fontSize: ms(12),
		fontWeight: "600",
	},

	// Quick Practice
	quickRow: { flexDirection: "row", gap: s(8) },
	btn: {
		flex: 1,
		backgroundColor: AUTH_UI.colors.surface,
		borderRadius: ms(12),
		paddingVertical: vs(12),
		paddingHorizontal: s(8),
		alignItems: "center",
		justifyContent: "center",
		flexDirection: "row",
		gap: s(6),
	},
	btnPrimary: { backgroundColor: AUTH_UI.colors.accent },
	btnText: { color: AUTH_UI.colors.accentText, fontWeight: "700" },
	btnTextMuted: { color: AUTH_UI.colors.textSecondary, fontSize: ms(12) },

	// Weak Points
	weakItem: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: AUTH_UI.colors.surface,
		borderRadius: ms(12),
		padding: s(12),
		marginBottom: vs(8),
		gap: s(12),
	},
	weakIconBox: {
		width: s(32),
		height: s(32),
		borderRadius: ms(8),
		backgroundColor: AUTH_UI.colors.surfaceMuted,
		alignItems: "center",
		justifyContent: "center",
	},
	weakCenter: { flex: 1, gap: vs(6) },
	weakLabel: {
		color: AUTH_UI.colors.textPrimary,
		fontSize: ms(13),
		fontWeight: "600",
	},
	weakBarTrack: {
		height: vs(4),
		borderRadius: 999,
		backgroundColor: AUTH_UI.colors.surfaceMuted,
		overflow: "hidden",
	},
	weakBarFill: { height: vs(4), borderRadius: 999 },
	weakPct: {
		fontSize: ms(13),
		fontWeight: "700",
		minWidth: s(36),
		textAlign: "right",
	},

	// Recent Tests
	testRow: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: AUTH_UI.colors.surface,
		padding: s(12),
		borderRadius: ms(12),
		marginBottom: vs(10),
		gap: s(12),
	},
	testIconBox: {
		width: s(40),
		height: s(40),
		borderRadius: ms(10),
		alignItems: "center",
		justifyContent: "center",
	},
	testMid: { flex: 1 },
	testTitle: {
		color: AUTH_UI.colors.textPrimary,
		fontWeight: "700",
		fontSize: ms(13),
	},
	testDate: {
		color: AUTH_UI.colors.textSecondary,
		marginTop: vs(2),
		fontSize: ms(12),
	},
	testRight: { alignItems: "flex-end", gap: s(4) },
	testScore: { fontWeight: "800", fontSize: ms(14) },
	testBadge: { borderRadius: ms(6), paddingHorizontal: s(6), paddingVertical: vs(2) },
	testBadgeText: { fontSize: ms(11), fontWeight: "600" },
	success: { color: AUTH_UI.colors.success },
	danger: { color: AUTH_UI.colors.danger },
});
