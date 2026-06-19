import { AsyncContent } from "@/components/common/AsyncContent";
import { EmptyState } from "@/components/common/EmptyState";
import { InputField } from "@/components/common/InputField";
import { ExamCard } from "@/components/exam/ExamCard";
import { FilterTabs, TabItem } from "@/components/layout/FilterTabs";
import { ScreenWrapper } from "@/components/screen-wrapper";
import { AUTH_UI } from "@/constants/auth-ui";
import { ExamTemplate } from "@/models/examSession.model";
import { examService } from "@/services/exam.service";
import { colors, withAlpha } from "@/theme";
import { getErrorMessage } from "@/utils/error";
import { ms, s, vs } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	FlatList,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

type ExamType = "on-tap" | "sat-hach";

const TYPE_TABS: TabItem[] = [
	{ key: "on-tap", label: "Ôn tập", icon: "book-outline" },
	{ key: "sat-hach", label: "Sát hạch", icon: "trophy-outline" },
];

export default function ExamScreen() {
	const router = useRouter();
	const [activeType, setActiveType] = useState<ExamType>("sat-hach");
	const [searchText, setSearchText] = useState("");
	const [templates, setTemplates] = useState<ExamTemplate[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isStarting, setIsStarting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const loadTemplates = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		const result = await examService.getAvailableExams();
		if (result.success) {
			setTemplates(result.data.items);
		} else {
			setError(getErrorMessage(result.code, result.error));
		}
		setIsLoading(false);
	}, []);

	useEffect(() => {
		loadTemplates();
	}, [loadTemplates]);

	const filteredTemplates = useMemo(
		() =>
			templates.filter((t) =>
				t.name.toLowerCase().includes(searchText.toLowerCase().trim()),
			),
		[templates, searchText],
	);

	const handleStart = async (template: ExamTemplate) => {
		if (isStarting) return;
		setIsStarting(true);
		const result = await examService.startSession(template.id);
		console.log("start session");

		setIsStarting(false);
		if (result.success) {
			const session = result.data;
			const durationMinutes = Math.max(
				1,
				Math.round(
					(new Date(session.expiresAt).getTime() -
						new Date(session.startedAt).getTime()) /
						60000,
				),
			);
			router.push({
				pathname: "/exam-session/take/[id]",
				params: {
					id: session.id,
					durationMinutes: String(durationMinutes),
				},
			});
		} else {
			Alert.alert(
				"Không thể bắt đầu thi",
				getErrorMessage(result.code, result.error),
			);
		}
	};

	return (
		<ScreenWrapper
			backgroundColor={AUTH_UI.colors.background}
			edges={["top"]}
			scroll={false}>
			<View style={styles.container}>
				<View style={styles.header}>
					<Text style={styles.headerTitle}>Đề Thi Lý Thuyết</Text>
					<Text style={styles.headerSub}>
						Chọn loại đề và bắt đầu luyện tập
					</Text>
				</View>

				<FilterTabs
					tabs={TYPE_TABS}
					activeKey={activeType}
					onChange={(k) => setActiveType(k as ExamType)}
					variant="segment"
					style={styles.typeToggle}
				/>

				{activeType === "on-tap" ? (
					<View style={styles.onTapContainer}>
						<View style={styles.bannerOnTap}>
							<Ionicons
								name="book-outline"
								size={ms(18)}
								color={AUTH_UI.colors.accent}
							/>
							<Text style={styles.bannerText}>
								Ôn tập câu hỏi theo từng chủ đề. Xem đáp án
								ngay sau mỗi câu.
							</Text>
						</View>
						<TouchableOpacity
							style={styles.onTapButton}
							onPress={() => router.push("/questions" as never)}
							activeOpacity={0.7}>
							<Ionicons
								name="library-outline"
								size={ms(20)}
								color={AUTH_UI.colors.accent}
							/>
							<Text style={styles.onTapButtonText}>
								Chọn chủ đề để bắt đầu
							</Text>
							<Ionicons
								name="chevron-forward"
								size={ms(18)}
								color={AUTH_UI.colors.textSecondary}
							/>
						</TouchableOpacity>
					</View>
				) : (
					<>
						<InputField
							leftIcon="search-outline"
							rightIcon={
								searchText.length > 0
									? "close-circle"
									: undefined
							}
							onRightPress={() => setSearchText("")}
							placeholder="Tìm kiếm đề thi..."
							value={searchText}
							onChangeText={setSearchText}
							returnKeyType="search"
							containerStyle={styles.searchContainer}
						/>

						<View style={styles.bannerSatHach}>
							<Ionicons
								name="trophy-outline"
								size={ms(18)}
								color={colors.satHachText}
							/>
							<Text
								style={[
									styles.bannerText,
									styles.bannerTextPurple,
								]}>
								Mô phỏng sát hạch thực tế. Có câu điểm liệt.
								Thời gian giới hạn.
							</Text>
						</View>

						<AsyncContent
							loading={isLoading}
							error={error}
							onRetry={loadTemplates}>
							<FlatList
								data={filteredTemplates}
								keyExtractor={(item) => item.id}
								renderItem={({ item }) => (
									<ExamCard
										template={item}
										activeType={activeType}
										onStart={() => handleStart(item)}
									/>
								)}
								contentContainerStyle={styles.listContent}
								showsVerticalScrollIndicator={false}
								style={styles.list}
								ListEmptyComponent={
									<EmptyState
										icon="search-outline"
										title="Không tìm thấy đề thi phù hợp"
										style={styles.emptyState}
									/>
								}
							/>
						</AsyncContent>
					</>
				)}
			</View>

			{isStarting && (
				<View style={styles.startingOverlay}>
					<ActivityIndicator
						color={AUTH_UI.colors.accent}
						size="large"
					/>
					<Text style={styles.startingText}>
						Đang tạo buổi thi...
					</Text>
				</View>
			)}
		</ScreenWrapper>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	header: {
		paddingHorizontal: s(16),
		paddingTop: vs(16),
		paddingBottom: vs(12),
	},
	headerTitle: {
		fontSize: ms(22),
		fontWeight: "800",
		color: AUTH_UI.colors.textPrimary,
	},
	headerSub: {
		fontSize: ms(13),
		color: AUTH_UI.colors.textSecondary,
		marginTop: vs(3),
	},
	searchContainer: {
		marginHorizontal: s(16),
		marginBottom: vs(12),
	},
	typeToggle: {
		marginHorizontal: s(16),
		marginBottom: vs(12),
	},
	bannerOnTap: {
		flexDirection: "row",
		alignItems: "center",
		marginHorizontal: s(16),
		marginBottom: vs(12),
		backgroundColor: colors.onTapBg,
		borderWidth: 1,
		borderColor: colors.onTapBorder,
		borderRadius: ms(AUTH_UI.radius.lg),
		padding: s(12),
		gap: s(10),
	},
	bannerSatHach: {
		flexDirection: "row",
		alignItems: "center",
		marginHorizontal: s(16),
		marginBottom: vs(12),
		backgroundColor: colors.satHachBg,
		borderWidth: 1,
		borderColor: colors.satHachBorder,
		borderRadius: ms(AUTH_UI.radius.lg),
		padding: s(12),
		gap: s(10),
	},
	bannerText: {
		flex: 1,
		fontSize: ms(13),
		color: AUTH_UI.colors.textSecondary,
		lineHeight: ms(19),
	},
	bannerTextPurple: { color: colors.satHachTextLight },
	onTapContainer: {
		flex: 1,
		paddingHorizontal: s(16),
		gap: vs(12),
	},
	onTapButton: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: AUTH_UI.colors.surface,
		borderWidth: 1,
		borderColor: AUTH_UI.colors.border,
		borderRadius: ms(AUTH_UI.radius.lg),
		padding: s(16),
		gap: s(12),
	},
	onTapButtonText: {
		flex: 1,
		fontSize: ms(15),
		fontWeight: "600",
		color: AUTH_UI.colors.textPrimary,
	},
	list: { flex: 1 },
	listContent: {
		paddingHorizontal: s(16),
		paddingBottom: vs(24),
		gap: vs(12),
	},
	emptyState: { paddingTop: vs(60) },
	startingOverlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: withAlpha(colors.background, 0.8),
		alignItems: "center",
		justifyContent: "center",
		gap: vs(12),
	},
	startingText: {
		fontSize: ms(14),
		color: AUTH_UI.colors.textSecondary,
	},
});
