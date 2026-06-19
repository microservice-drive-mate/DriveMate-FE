import { AsyncContent } from "@/components/common/AsyncContent";
import { EmptyState } from "@/components/common/EmptyState";
import { InputField } from "@/components/common/InputField";
import { ScreenHeader } from "@/components/layout";
import { ScreenWrapper } from "@/components/screen-wrapper";
import { AUTH_UI } from "@/constants/auth-ui";
import type { QuestionTopic } from "@/models/question.model";
import { questionService } from "@/services/question.service";
import { getErrorMessage } from "@/utils/error";
import { ms, s, vs } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
	FlatList,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

export default function QuestionTopicsScreen() {
	const router = useRouter();
	const [topics, setTopics] = useState<QuestionTopic[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [search, setSearch] = useState("");

	const load = async () => {
		setIsLoading(true);
		setError(null);
		const result = await questionService.getTopics({ size: 100 });
		if (result.success) {
			setTopics(result.data.items);
		} else {
			setError(getErrorMessage(result.code, result.error));
		}
		setIsLoading(false);
	};

	useEffect(() => {
		load();
	}, []);

	const filtered = useMemo(
		() =>
			topics.filter((t) =>
				t.name.toLowerCase().includes(search.toLowerCase().trim()),
			),
		[topics, search],
	);

	return (
		<ScreenWrapper backgroundColor={AUTH_UI.colors.background} scroll={false}>
			<ScreenHeader
				title="Ôn tập câu hỏi"
				subtitle="Chọn chủ đề để bắt đầu luyện tập"
				onBack={() => router.back()}
				centered
			/>

			<InputField
				leftIcon="search-outline"
				rightIcon={search.length > 0 ? "close-circle" : undefined}
				onRightPress={() => setSearch("")}
				placeholder="Tìm chủ đề..."
				value={search}
				onChangeText={setSearch}
				returnKeyType="search"
				containerStyle={styles.search}
			/>

			<AsyncContent loading={isLoading} error={error} onRetry={load}>
				<FlatList
					data={filtered}
					keyExtractor={(item) => item.id}
					renderItem={({ item }) => (
						<TouchableOpacity
							style={styles.topicItem}
							onPress={() =>
								router.push({
									pathname: "/questions/[topicId]" as never,
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
								<Text style={styles.topicName}>{item.name}</Text>
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
					contentContainerStyle={styles.list}
					showsVerticalScrollIndicator={false}
					ListEmptyComponent={
						<EmptyState
							icon="library-outline"
							title="Không tìm thấy chủ đề"
						/>
					}
				/>
			</AsyncContent>
		</ScreenWrapper>
	);
}

const styles = StyleSheet.create({
	search: {
		marginHorizontal: s(16),
		marginBottom: vs(8),
	},
	list: {
		flexGrow: 1,
		paddingHorizontal: s(16),
		paddingBottom: vs(24),
		gap: vs(8),
	},
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
});
