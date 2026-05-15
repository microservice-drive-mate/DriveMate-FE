import { EmptyState } from "@/components/common/EmptyState";
import { InputField } from "@/components/common/InputField";
import { StatBox } from "@/components/common/StatBox";
import { HistoryCard } from "@/components/history";
import { ScreenWrapper } from "@/components/screen-wrapper";
import { AUTH_UI } from "@/constants/auth-ui";
import { ms, s, vs } from "@/utils/responsive";
import { HistoryFilterStatus } from "@/models/history.model";
import { historyService } from "@/services/history.service";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
	ActivityIndicator,
	FlatList,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

const PAGE_SIZE = 4;

const FILTER_OPTIONS: {
	key: HistoryFilterStatus;
	label: string;
	icon: keyof typeof Ionicons.glyphMap;
}[] = [
	{ key: "all", label: "Tất cả", icon: "list-outline" },
	{ key: "passed", label: "Đạt", icon: "checkmark-outline" },
	{ key: "failed", label: "Chưa đạt", icon: "close-outline" },
];

const formatDate = (iso: string) =>
	new Date(iso).toLocaleDateString("vi-VN", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});

const formatTime = (iso: string) =>
	new Date(iso).toLocaleTimeString("vi-VN", {
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	});

const formatDuration = (seconds: number) => {
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

export default function History() {
	const router = useRouter();
	const [activeFilter, setActiveFilter] =
		useState<HistoryFilterStatus>("all");
	const [searchText, setSearchText] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

	useEffect(() => {
		const timeout = setTimeout(() => {
			setDebouncedSearch(searchText.trim());
		}, 250);

		return () => clearTimeout(timeout);
	}, [searchText]);

	const result = useMemo(
		() =>
			historyService.getHistory({
				status: activeFilter,
				searchText: debouncedSearch,
			}),
		[activeFilter, debouncedSearch],
	);

	useEffect(() => {
		setVisibleCount(PAGE_SIZE);
	}, [activeFilter, debouncedSearch]);

	const visibleItems = useMemo(
		() => result.items.slice(0, visibleCount),
		[result.items, visibleCount],
	);

	const hasMore = visibleCount < result.items.length;

	const handleLoadMore = () => {
		if (!hasMore) return;
		setVisibleCount((current) => current + PAGE_SIZE);
	};

	const handleOpenAttempt = (attemptId: string) => {
		(router.push as any)({
			pathname: "/exam-session/history-detail/[id]",
			params: { id: attemptId },
		});
	};

	return (
		<ScreenWrapper
			backgroundColor={AUTH_UI.colors.background}
			edges={["top"]}>
			<View style={styles.container}>
				<View style={styles.header}>
					<Text style={styles.title}>Lịch Sử Thi</Text>
					<Text style={styles.subtitle}>
						{result.stats.total} bài thi đã thực hiện
					</Text>
				</View>

				<View style={styles.statRow}>
					<StatBox
						value={result.stats.total}
						label="Tổng bài"
						bg={AUTH_UI.colors.surfaceMuted}
						valueColor={AUTH_UI.colors.accent}
					/>
					<StatBox
						value={result.stats.passed}
						label="Đã đạt"
						bg={AUTH_UI.colors.surfaceMuted}
						valueColor={AUTH_UI.colors.success}
					/>
					<StatBox
						value={result.stats.failed}
						label="Chưa đạt"
						bg={AUTH_UI.colors.surfaceMuted}
						valueColor={AUTH_UI.colors.danger}
					/>
				</View>

				<InputField
					leftIcon="search-outline"
					rightIcon={
						searchText.length > 0 ? "close-circle" : undefined
					}
					onRightPress={() => setSearchText("")}
					placeholder="Tìm kiếm..."
					value={searchText}
					onChangeText={setSearchText}
					containerStyle={styles.searchInput}
					returnKeyType="search"
				/>

				<View style={styles.filters}>
					{FILTER_OPTIONS.map((option) => {
						const isActive = option.key === activeFilter;
						return (
							<TouchableOpacity
								key={option.key}
								style={[
									styles.filterChip,
									isActive && styles.filterChipActive,
								]}
								onPress={() => setActiveFilter(option.key)}>
								<Ionicons
									name={option.icon}
									size={ms(14)}
									color={
										isActive
											? AUTH_UI.colors.accentText
											: AUTH_UI.colors.textSecondary
									}
								/>
								<Text
									style={[
										styles.filterText,
										isActive && styles.filterTextActive,
									]}>
									{option.label}
								</Text>
							</TouchableOpacity>
						);
					})}
				</View>

				<FlatList
					data={visibleItems}
					keyExtractor={(item) => item.id}
					onEndReached={handleLoadMore}
					onEndReachedThreshold={0.4}
					showsVerticalScrollIndicator={false}
					contentContainerStyle={styles.listContent}
					renderItem={({ item }) => (
						<HistoryCard
							title={item.title}
							meta={`${formatDate(item.takenAt)} • ${formatTime(item.takenAt)} • ${formatDuration(item.durationSeconds)}`}
							score={item.score}
							total={item.totalQuestions}
							passed={item.passed}
							onPress={() => handleOpenAttempt(item.id)}
						/>
					)}
					ListFooterComponent={
						hasMore ? (
							<View style={styles.footerLoading}>
								<ActivityIndicator
									color={AUTH_UI.colors.accent}
									size="small"
								/>
							</View>
						) : null
					}
					ListEmptyComponent={
						<EmptyState
							icon="file-tray-outline"
							title="Không có kết quả phù hợp"
							subtitle="Thử đổi bộ lọc hoặc từ khóa tìm kiếm"
							style={styles.emptyState}
						/>
					}
				/>
			</View>
		</ScreenWrapper>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		paddingHorizontal: s(16),
		paddingTop: vs(16),
		paddingBottom: vs(12),
	},
	title: {
		fontSize: ms(19),
		fontWeight: "800",
		color: AUTH_UI.colors.textPrimary,
	},
	subtitle: {
		marginTop: vs(2),
		fontSize: ms(14),
		color: AUTH_UI.colors.textSecondary,
	},
	statRow: {
		paddingHorizontal: s(16),
		flexDirection: "row",
		gap: s(10),
		marginBottom: vs(12),
	},
	searchInput: {
		marginHorizontal: s(16),
		marginBottom: vs(10),
	},
	filters: {
		flexDirection: "row",
		alignItems: "center",
		gap: s(8),
		paddingHorizontal: s(16),
		marginBottom: vs(12),
	},
	filterChip: {
		paddingHorizontal: s(14),
		paddingVertical: vs(8),
		borderRadius: ms(12),
		flexDirection: "row",
		alignItems: "center",
		gap: s(6),
		backgroundColor: AUTH_UI.colors.surfaceMuted,
	},
	filterChipActive: {
		backgroundColor: AUTH_UI.colors.accent,
	},
	filterText: {
		fontSize: ms(15),
		fontWeight: "700",
		color: AUTH_UI.colors.textSecondary,
	},
	filterTextActive: {
		color: AUTH_UI.colors.accentText,
	},
	listContent: {
		paddingHorizontal: s(16),
		paddingBottom: vs(20),
		gap: vs(12),
	},
	footerLoading: {
		paddingVertical: vs(10),
	},
	emptyState: {
		paddingTop: vs(48),
	},
});
