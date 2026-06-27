import { AsyncContent } from "@/components/common/AsyncContent";
import { EmptyState } from "@/components/common/EmptyState";
import { InputField } from "@/components/common/InputField";
import { ExamCard } from "@/components/exam/ExamCard";
import { FilterTabs, TabItem } from "@/components/layout/FilterTabs";
import { ScreenWrapper } from "@/components/screen-wrapper";
import { AUTH_UI } from "@/constants/auth-ui";
import { ExamTemplate } from "@/models/examSession.model";
import type { QuestionTopic } from "@/models/question.model";
import { examService } from "@/services/exam.service";
import { questionService } from "@/services/question.service";
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
	const [activeType, setActiveType] = useState<ExamType>("on-tap");
	const [searchText, setSearchText] = useState("");
	const [templates, setTemplates] = useState<ExamTemplate[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isStarting, setIsStarting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [topics, setTopics] = useState<QuestionTopic[]>([]);
	const [topicsLoading, setTopicsLoading] = useState(false);
	const [topicsError, setTopicsError] = useState<string | null>(null);
	const [topicSearch, setTopicSearch] = useState("");

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

	const loadTopics = useCallback(async () => {
		setTopicsLoading(true);
		setTopicsError(null);
		const result = await questionService.getTopics({ size: 100 });
		if (result.success) {
			setTopics(result.data.items);
		} else {
			setTopicsError(getErrorMessage(result.code, result.error));
		}
		setTopicsLoading(false);
	}, []);

	useEffect(() => {
		loadTopics();
	}, [loadTopics]);

	const filteredTemplates = useMemo(
		() =>
			templates.filter((t) =>
				t.name.toLowerCase().includes(searchText.toLowerCase().trim()),
			),
		[templates, searchText],
	);

	const filteredTopics = useMemo(
		() =>
			topics.filter((t) =>
				t.name.toLowerCase().includes(topicSearch.toLowerCase().trim()),
			),
		[topics, topicSearch],
	);

	const goToSession = (id: string, expiresAt: string) => {
		router.push({
			pathname: "/exam-session/take/[id]",
			params: { id, expiresAt },
		});
	};

	const createSession = async (template: ExamTemplate) => {
		setIsStarting(true);
		const result = await examService.startSession(template.id);
		setIsStarting(false);
		if (result.success) {
			goToSession(result.data.id, result.data.expiresAt);
		} else {
			Alert.alert(
				"Không thể bắt đầu thi",
				getErrorMessage(result.code, result.error),
			);
		}
	};

	const handleStart = async (template: ExamTemplate) => {
		if (isStarting) return;
		setIsStarting(true);
		const inProgress = await examService.listSessions({
			status: "IN_PROGRESS",
			size: 100,
		});
		setIsStarting(false);

		const resumable = inProgress.success
			? inProgress.data.items.find(
					(s) =>
						s.templateId === template.id &&
						new Date(s.expiresAt) > new Date(),
				)
			: undefined;

		if (resumable) {
			Alert.alert(
				"Bạn có bài thi đang làm dở",
				"Tiếp tục bài đang làm hay bắt đầu một lượt thi mới?",
				[
					{ text: "Hủy", style: "cancel" },
					{
						text: "Tiếp tục",
						onPress: () => goToSession(resumable.id, resumable.expiresAt),
					},
					{
						text: "Bắt đầu mới",
						style: "destructive",
						onPress: () => createSession(template),
					},
				],
			);
			return;
		}

		createSession(template);
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
					<>
						<InputField
							leftIcon="search-outline"
							rightIcon={
								topicSearch.length > 0
									? "close-circle"
									: undefined
							}
							onRightPress={() => setTopicSearch("")}
							placeholder="Tìm chủ đề..."
							value={topicSearch}
							onChangeText={setTopicSearch}
							returnKeyType="search"
							containerStyle={styles.searchContainer}
						/>

						<View style={styles.bannerOnTap}>
							<Ionicons
								name="book-outline"
								size={ms(18)}
								color={AUTH_UI.colors.accent}
							/>
							<Text style={styles.bannerText}>
								Ôn tập câu hỏi theo từng chủ đề. Xem đáp án ngay
								sau mỗi câu.
							</Text>
						</View>

						<AsyncContent
							loading={topicsLoading}
							error={topicsError}
							onRetry={loadTopics}>
							<FlatList
								data={filteredTopics}
								keyExtractor={(item) => item.id}
								renderItem={({ item }) => (
									<TouchableOpacity
										style={styles.topicItem}
										onPress={() =>
											router.push({
												pathname:
													"/questions/[topicId]" as never,
												params: {
													topicId: item.id,
													topicName: item.name,
												},
											})
										}
										activeOpacity={0.7}>
										<View style={styles.topicIcon}>
											<Ionicons
												name="book-outline"
												size={ms(18)}
												color={AUTH_UI.colors.accent}
											/>
										</View>
										<View style={styles.topicInfo}>
											<Text style={styles.topicName}>
												{item.name}
											</Text>
											{item.description ? (
												<Text
													style={styles.topicDesc}
													numberOfLines={1}>
													{item.description}
												</Text>
											) : null}
										</View>
										<Ionicons
											name="chevron-forward"
											size={ms(16)}
											color={AUTH_UI.colors.textSecondary}
										/>
									</TouchableOpacity>
								)}
								contentContainerStyle={styles.listContent}
								showsVerticalScrollIndicator={false}
								style={styles.list}
								ListEmptyComponent={
									<EmptyState
										icon="library-outline"
										title="Không tìm thấy chủ đề"
										style={styles.emptyState}
									/>
								}
							/>
						</AsyncContent>
					</>
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
	topicItem: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: AUTH_UI.colors.surface,
		borderRadius: ms(AUTH_UI.radius.lg),
		padding: s(14),
		gap: s(12),
		borderWidth: 1,
		borderColor: AUTH_UI.colors.border,
	},
	topicIcon: {
		width: ms(36),
		height: ms(36),
		borderRadius: ms(18),
		backgroundColor: AUTH_UI.colors.background,
		alignItems: "center",
		justifyContent: "center",
	},
	topicInfo: {
		flex: 1,
		gap: vs(2),
	},
	topicName: {
		fontSize: ms(14),
		fontWeight: "600",
		color: AUTH_UI.colors.textPrimary,
	},
	topicDesc: {
		fontSize: ms(12),
		color: AUTH_UI.colors.textSecondary,
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
