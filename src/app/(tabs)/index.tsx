import { ScreenWrapper } from "@/components/screen-wrapper";
import { AUTH_UI } from "@/constants/auth-ui";
import { ms, s, vs } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { analyticsService } from "@/services/analytics.service";
import { historyService } from "@/services/history.service";
import type { ProgressDashboard } from "@/models/analytics.model";
import type { ExamHistoryAttempt } from "@/models/history.model";

const successTint = "rgba(83,209,141,0.13)";
const dangerTint = "rgba(248,113,113,0.13)";

function formatDate(iso: string): string {
	const d = new Date(iso);
	return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

export default function Home() {
	const router = useRouter();
	const [dashboard, setDashboard] = useState<ProgressDashboard | null>(null);
	const [recentAttempts, setRecentAttempts] = useState<ExamHistoryAttempt[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		let cancelled = false;
		const load = async () => {
			const [analyticsResult, historyResult] = await Promise.all([
				analyticsService.getMyProgress(),
				historyService.getAttempts(),
			]);
			if (cancelled) return;
			if (analyticsResult.success) setDashboard(analyticsResult.data);
			if (historyResult.success) setRecentAttempts(historyResult.items.slice(0, 3));
			setIsLoading(false);
		};
		load();
		return () => { cancelled = true; };
	}, []);

	const completionPct = dashboard?.completionPct ?? 0;
	const attemptCount = dashboard?.attemptCount ?? 0;
	const passRate = dashboard?.passRate ?? 0;
	const totalStudyMinutes = dashboard?.totalStudyMinutes ?? 0;
	const weakTopics = dashboard?.weakTopics ?? [];

	const metrics = [
		{ id: "1", label: "Bài thi", value: String(attemptCount), icon: "document-text-outline" as const },
		{ id: "2", label: "Tỷ lệ đạt", value: `${passRate}%`, icon: "stats-chart-outline" as const },
		{ id: "3", label: "Phút học", value: String(totalStudyMinutes), icon: "time-outline" as const },
	];

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
						<Text style={styles.levelLabel}>Hạng bằng đang học</Text>
						<Text style={styles.level}>B1</Text>
						<Text style={styles.vehicle}>Ô tô dưới 9 chỗ</Text>
					</View>
					<View style={styles.progressRight}>
						<Text style={styles.progressLabel}>Tiến độ</Text>
						<Text style={styles.progressPercent}>{completionPct}%</Text>
					</View>
					<View style={styles.progressBarTrack}>
						<View style={[styles.progressBarFill, { width: `${completionPct}%` }]} />
					</View>
				</View>

				{/* Metrics */}
				{isLoading ? (
					<View style={styles.loadingRow}>
						<ActivityIndicator color={AUTH_UI.colors.accent} />
					</View>
				) : (
					<View style={styles.metricsRow}>
						{metrics.map((m) => (
							<View key={m.id} style={styles.metricCard}>
								<Ionicons name={m.icon} size={ms(20)} color={AUTH_UI.colors.accent} />
								<Text style={styles.metricValue}>{m.value}</Text>
								<Text style={styles.metricLabel}>{m.label}</Text>
							</View>
						))}
					</View>
				)}

				{/* Quick Practice */}
				<Text style={styles.sectionTitle}>Luyện tập nhanh</Text>
				<View style={styles.quickRow}>
					<TouchableOpacity
						style={[styles.btn, styles.btnPrimary]}
						onPress={() => router.push("/(tabs)/exam" as never)}>
						<Ionicons name="flash" size={ms(16)} color={AUTH_UI.colors.accentText} />
						<Text style={styles.btnText}>Thi ngay</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.btn}>
						<Ionicons name="book-outline" size={ms(16)} color={AUTH_UI.colors.textSecondary} />
						<Text style={styles.btnTextMuted}>Ôn yếu điểm</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.btn}>
						<Ionicons name="map-outline" size={ms(16)} color={AUTH_UI.colors.textSecondary} />
						<Text style={styles.btnTextMuted}>Sa hình</Text>
					</TouchableOpacity>
				</View>

				{/* Weak Topics */}
				<View style={styles.sectionHeader}>
					<Text style={styles.sectionTitle}>Điểm yếu cần ôn</Text>
				</View>
				{!isLoading && weakTopics.length === 0 && (
					<Text style={styles.emptyText}>Chưa có dữ liệu điểm yếu</Text>
				)}
				{weakTopics.map((topic) => {
					const pct = Math.round(topic.accuracyRate * 100);
					const isLow = pct < 65;
					const barColor = isLow ? AUTH_UI.colors.danger : AUTH_UI.colors.accent;
					return (
						<View key={topic.topicId} style={styles.weakItem}>
							<View style={styles.weakIconBox}>
								<Ionicons name="ribbon-outline" size={ms(16)} color={AUTH_UI.colors.accent} />
							</View>
							<View style={styles.weakCenter}>
								<Text style={styles.weakLabel}>{topic.topicName}</Text>
								<View style={styles.weakBarTrack}>
									<View style={[styles.weakBarFill, { width: `${pct}%`, backgroundColor: barColor }]} />
								</View>
							</View>
							<Text style={[styles.weakPct, { color: barColor }]}>{pct}%</Text>
						</View>
					);
				})}

				{/* Recent Tests */}
				<View style={styles.sectionHeader}>
					<Text style={styles.sectionTitle}>Bài thi gần đây</Text>
					<TouchableOpacity onPress={() => router.push("/(tabs)/history" as never)}>
						<Text style={styles.sectionLink}>Tất cả →</Text>
					</TouchableOpacity>
				</View>
				{!isLoading && recentAttempts.length === 0 && (
					<Text style={styles.emptyText}>Chưa có bài thi nào</Text>
				)}
				{recentAttempts.map((item) => (
					<View key={item.id} style={styles.testRow}>
						<View style={[styles.testIconBox, { backgroundColor: item.passed ? successTint : dangerTint }]}>
							<Ionicons
								name="document-text-outline"
								size={ms(18)}
								color={item.passed ? AUTH_UI.colors.success : AUTH_UI.colors.danger}
							/>
						</View>
						<View style={styles.testMid}>
							<Text style={styles.testTitle}>{item.title}</Text>
							<Text style={styles.testDate}>{formatDate(item.takenAt)}</Text>
						</View>
						<View style={styles.testRight}>
							<Text style={[styles.testScore, item.passed ? styles.success : styles.danger]}>
								{item.score}/{item.totalQuestions}
							</Text>
							<View style={[styles.testBadge, { backgroundColor: item.passed ? successTint : dangerTint }]}>
								<Text style={[styles.testBadgeText, { color: item.passed ? AUTH_UI.colors.success : AUTH_UI.colors.danger }]}>
									{item.passed ? "Đạt" : "Không đạt"}
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
	name: { color: AUTH_UI.colors.textPrimary, fontSize: ms(16), fontWeight: "700" },
	bell: {
		width: s(40),
		height: s(40),
		borderRadius: ms(12),
		backgroundColor: AUTH_UI.colors.surface,
		alignItems: "center",
		justifyContent: "center",
	},

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
	level: { fontSize: ms(36), fontWeight: "800", color: AUTH_UI.colors.accentText },
	vehicle: { color: AUTH_UI.colors.accentText, fontSize: ms(13) },
	progressRight: { alignItems: "flex-end" },
	progressLabel: { color: AUTH_UI.colors.accentText, fontSize: ms(12), marginBottom: vs(2) },
	progressPercent: { color: AUTH_UI.colors.accentText, fontWeight: "800", fontSize: ms(24) },
	progressBarTrack: { position: "absolute", bottom: 0, left: 0, right: 0, height: vs(6), backgroundColor: "#D4A832" },
	progressBarFill: { height: vs(6), backgroundColor: AUTH_UI.colors.accentText },

	loadingRow: { alignItems: "center", paddingVertical: vs(16) },

	metricsRow: { flexDirection: "row", gap: s(8), marginTop: vs(12) },
	metricCard: {
		flex: 1,
		backgroundColor: AUTH_UI.colors.surface,
		borderRadius: ms(12),
		padding: s(12),
		alignItems: "center",
		gap: vs(4),
	},
	metricValue: { color: AUTH_UI.colors.accent, fontWeight: "800", fontSize: ms(18) },
	metricLabel: { color: AUTH_UI.colors.textSecondary, fontSize: ms(11), textAlign: "center" },

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
	sectionLink: { color: AUTH_UI.colors.accent, fontSize: ms(12), fontWeight: "600" },

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
	weakLabel: { color: AUTH_UI.colors.textPrimary, fontSize: ms(13), fontWeight: "600" },
	weakBarTrack: { height: vs(4), borderRadius: 999, backgroundColor: AUTH_UI.colors.surfaceMuted, overflow: "hidden" },
	weakBarFill: { height: vs(4), borderRadius: 999 },
	weakPct: { fontSize: ms(13), fontWeight: "700", minWidth: s(36), textAlign: "right" },

	testRow: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: AUTH_UI.colors.surface,
		padding: s(12),
		borderRadius: ms(12),
		marginBottom: vs(10),
		gap: s(12),
	},
	testIconBox: { width: s(40), height: s(40), borderRadius: ms(10), alignItems: "center", justifyContent: "center" },
	testMid: { flex: 1 },
	testTitle: { color: AUTH_UI.colors.textPrimary, fontWeight: "700", fontSize: ms(13) },
	testDate: { color: AUTH_UI.colors.textSecondary, marginTop: vs(2), fontSize: ms(12) },
	testRight: { alignItems: "flex-end", gap: s(4) },
	testScore: { fontWeight: "800", fontSize: ms(14) },
	testBadge: { borderRadius: ms(6), paddingHorizontal: s(6), paddingVertical: vs(2) },
	testBadgeText: { fontSize: ms(11), fontWeight: "600" },
	success: { color: AUTH_UI.colors.success },
	danger: { color: AUTH_UI.colors.danger },

	emptyText: { color: AUTH_UI.colors.textMuted, fontSize: ms(13), textAlign: "center", paddingVertical: vs(8) },
});
