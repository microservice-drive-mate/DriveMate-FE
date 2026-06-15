import { Button } from "@/components/common/Button";
import { StatBox } from "@/components/common/StatBox";
import { CircularProgress } from "@/components/exam/CircularProgress";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { AUTH_UI } from "@/constants/auth-ui";
import { ERROR_MESSAGES } from "@/constants/api";
import { ExamSession } from "@/models/examSession.model";
import { examService } from "@/services/exam.service";
import { formatDuration } from "@/utils/examFormat";
import { ms, s, vs } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
	ActivityIndicator,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const elapsedSeconds = (session: ExamSession) => {
	if (!session.finishedAt) return 0;
	return Math.max(
		0,
		Math.round(
			(new Date(session.finishedAt).getTime() -
				new Date(session.startedAt).getTime()) /
				1000,
		),
	);
};

export default function ExamResultScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const router = useRouter();
	const sessionId = id ?? "";

	const [session, setSession] = useState<ExamSession | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;
		const load = async () => {
			setIsLoading(true);
			setError(null);
			const result = await examService.getSessionResult(sessionId);
			if (cancelled) return;
			if (result.success) {
				setSession(result.data);
			} else {
				setError(
					ERROR_MESSAGES[result.code as keyof typeof ERROR_MESSAGES] ??
						result.error,
				);
			}
			setIsLoading(false);
		};
		load();
		return () => {
			cancelled = true;
		};
	}, [sessionId]);

	if (isLoading) {
		return (
			<SafeAreaView style={styles.container}>
				<ScreenHeader title="Kết Quả Thi" onBack={() => router.back()} centered />
				<View style={styles.centerState}>
					<ActivityIndicator color={AUTH_UI.colors.accent} size="large" />
					<Text style={styles.stateText}>Đang tải kết quả...</Text>
				</View>
			</SafeAreaView>
		);
	}

	if (error || !session) {
		return (
			<SafeAreaView style={styles.container}>
				<ScreenHeader title="Kết Quả Thi" onBack={() => router.back()} centered />
				<View style={styles.centerState}>
					<Text style={styles.stateText}>
						{error ?? "Không tìm thấy kết quả bài thi."}
					</Text>
					<Button
						variant="secondary"
						label="Quay lại"
						onPress={() => router.back()}
						style={styles.backBtn}
					/>
				</View>
			</SafeAreaView>
		);
	}

	const total = session.questions.length;
	const scoreCount = session.score ?? 0;
	const skippedCount = session.questions.filter((q) => !q.selectedOptionId).length;
	const wrongCount = Math.max(0, total - scoreCount - skippedCount);
	const isPassed = session.isPassed === true;
	const isCritical = session.failedByCritical;
	const percentage = total > 0 ? Math.round((scoreCount / total) * 100) : 0;
	const fillColor = isPassed ? AUTH_UI.colors.success : AUTH_UI.colors.danger;
	const elapsedStr = formatDuration(elapsedSeconds(session));

	return (
		<SafeAreaView style={styles.container}>
			<ScreenHeader title="Kết Quả Thi" onBack={() => router.back()} centered />

			<ScrollView
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}>
				<View style={styles.progressContainer}>
					<CircularProgress
						percentage={percentage}
						size={s(140)}
						strokeWidth={s(12)}
						fillColor={fillColor}
					/>
					<View style={styles.progressCenter}>
						<Text style={[styles.percentText, { color: fillColor }]}>
							{percentage}%
						</Text>
						<Text style={styles.correctLabel}>
							{scoreCount}/{total} đúng
						</Text>
					</View>
				</View>

				<View
					style={[
						styles.resultBadge,
						isPassed ? styles.resultBadgePassed : styles.resultBadgeFailed,
					]}>
					<Text
						style={[
							styles.resultBadgeText,
							{ color: isPassed ? AUTH_UI.colors.success : AUTH_UI.colors.danger },
						]}>
						{isPassed ? "✓ ĐẠT" : "✕ KHÔNG ĐẠT"}
					</Text>
				</View>

				{isCritical && (
					<View style={styles.criticalWarning}>
						<Ionicons
							name="warning-outline"
							size={ms(18)}
							color={AUTH_UI.colors.danger}
						/>
						<View style={styles.criticalWarningText}>
							<Text style={styles.criticalTitle}>Dính câu điểm liệt!</Text>
							<Text style={styles.criticalSubtitle}>
								Bạn đã trả lời sai câu điểm liệt. Hãy ôn lại kỹ các quy định
								quan trọng.
							</Text>
						</View>
					</View>
				)}

				<View style={styles.statsRow}>
					<StatBox
						value={scoreCount}
						label="Đúng"
						bg="#1B4332"
						valueColor={AUTH_UI.colors.success}
						labelColor={AUTH_UI.colors.success}
					/>
					<StatBox
						value={wrongCount}
						label="Sai"
						bg="#3B0F0F"
						valueColor={AUTH_UI.colors.danger}
						labelColor={AUTH_UI.colors.danger}
					/>
					<StatBox
						value={skippedCount}
						label="Bỏ"
						bg={AUTH_UI.colors.surfaceMuted}
						valueColor={AUTH_UI.colors.textSecondary}
						labelColor={AUTH_UI.colors.textSecondary}
					/>
					<StatBox
						value={elapsedStr}
						label="Thời gian"
						bg="#2A2200"
						valueColor="#C9A227"
						labelColor="#C9A227"
					/>
				</View>

				{wrongCount > 0 && (
					<Button
						variant="secondary"
						label="Xem câu sai"
						icon="eye-outline"
						style={styles.reviewBtn}
						onPress={() =>
							router.push({
								pathname: "/exam-session/review/[id]",
								params: { id: sessionId },
							})
						}
					/>
				)}

				<View style={styles.actions}>
					<Button
						variant="secondary"
						label="Thi lại"
						icon="refresh-outline"
						flex
						style={styles.actionBtn}
						onPress={() => router.replace("/(tabs)/exam")}
					/>
					<Button
						variant="primary"
						label="Trang chủ"
						icon="home-outline"
						flex
						style={styles.actionBtn}
						onPress={() => router.replace("/(tabs)")}
					/>
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
	centerState: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		gap: vs(14),
		paddingHorizontal: s(32),
	},
	stateText: {
		fontSize: ms(14),
		color: AUTH_UI.colors.textSecondary,
		textAlign: "center",
	},
	backBtn: {
		paddingHorizontal: s(24),
	},
	content: {
		paddingHorizontal: s(20),
		paddingTop: vs(24),
		paddingBottom: vs(40),
		alignItems: "center",
		gap: vs(20),
	},
	progressContainer: {
		width: s(140),
		height: s(140),
		alignItems: "center",
		justifyContent: "center",
	},
	progressCenter: {
		position: "absolute",
		alignItems: "center",
		gap: vs(2),
	},
	percentText: {
		fontSize: ms(28),
		fontWeight: "800",
	},
	correctLabel: {
		fontSize: ms(12),
		color: AUTH_UI.colors.textSecondary,
	},
	resultBadge: {
		paddingHorizontal: s(20),
		paddingVertical: vs(8),
		borderRadius: ms(20),
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
		fontSize: ms(14),
		fontWeight: "700",
		letterSpacing: 1,
	},
	criticalWarning: {
		flexDirection: "row",
		alignItems: "flex-start",
		gap: s(10),
		backgroundColor: "rgba(248,113,113,0.1)",
		borderRadius: ms(AUTH_UI.radius.xl),
		borderWidth: 1,
		borderColor: "rgba(248,113,113,0.25)",
		padding: s(14),
		width: "100%",
	},
	criticalWarningText: {
		flex: 1,
		gap: vs(4),
	},
	criticalTitle: {
		fontSize: ms(14),
		fontWeight: "700",
		color: AUTH_UI.colors.danger,
	},
	criticalSubtitle: {
		fontSize: ms(13),
		color: AUTH_UI.colors.textSecondary,
		lineHeight: ms(18),
	},
	statsRow: {
		flexDirection: "row",
		gap: s(10),
		width: "100%",
	},
	reviewBtn: {
		height: vs(50),
		width: "100%",
	},
	actions: {
		flexDirection: "row",
		gap: s(10),
		width: "100%",
	},
	actionBtn: {
		height: vs(50),
	},
});
