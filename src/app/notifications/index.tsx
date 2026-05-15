import { AUTH_UI } from "@/constants/auth-ui";
import { Notification } from "@/models/notification.model";
import { useNotificationsStore } from "@/store/notifications.store";
import { ms, s, vs } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
	FlatList,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type FilterTab = "all" | "read" | "unread";

const TABS: { key: FilterTab; label: string }[] = [
	{ key: "all", label: "Tất cả" },
	{ key: "read", label: "Đã đọc" },
	{ key: "unread", label: "Chưa đọc" },
];

export default function NotificationsScreen() {
	const router = useRouter();
	const { notifications, refresh } = useNotificationsStore();
	const [activeTab, setActiveTab] = useState<FilterTab>("all");

	const unreadCount = useMemo(
		() => notifications.filter((n) => !n.isRead).length,
		[notifications],
	);

	const filtered = useMemo(() => {
		if (activeTab === "read") return notifications.filter((n) => n.isRead);
		if (activeTab === "unread")
			return notifications.filter((n) => !n.isRead);
		return notifications;
	}, [notifications, activeTab]);

	function renderCard({ item }: { item: Notification }) {
		return (
			<TouchableOpacity
				style={styles.card}
				activeOpacity={0.75}
				onPress={() => router.push(`/notifications/${item.id}`)}>
				<View style={styles.cardTop}>
					<Text style={styles.category}>{item.category}</Text>
					<View
						style={[
							styles.badge,
							item.isRead ? styles.badgeRead : styles.badgeUnread,
						]}>
						<Text
							style={[
								styles.badgeText,
								item.isRead
									? styles.badgeTextRead
									: styles.badgeTextUnread,
							]}>
							{item.isRead ? "Đã đọc" : "Chưa đọc"}
						</Text>
					</View>
				</View>
				<Text
					style={styles.preview}
					numberOfLines={2}>
					{item.preview}
				</Text>
				<View style={styles.timeRow}>
					<View style={styles.dot} />
					<Text style={styles.timeAgo}>{item.timeAgo}</Text>
				</View>
			</TouchableOpacity>
		);
	}

	return (
		<SafeAreaView style={styles.screen}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity
					style={styles.iconBtn}
					onPress={() => router.back()}>
					<Ionicons
						name="arrow-back"
						size={ms(20)}
						color={AUTH_UI.colors.textPrimary}
					/>
				</TouchableOpacity>
				<View style={styles.headerCenter}>
					<Text style={styles.headerTitle}>Thông báo</Text>
					<Text style={styles.headerSubtitle}>
						{unreadCount} thông báo chưa đọc
					</Text>
				</View>
				<TouchableOpacity
					style={styles.iconBtn}
					onPress={refresh}>
					<Ionicons
						name="refresh-outline"
						size={ms(20)}
						color={AUTH_UI.colors.textPrimary}
					/>
				</TouchableOpacity>
			</View>

			{/* Filter tabs */}
			<View style={styles.tabRow}>
				{TABS.map((tab) => (
					<TouchableOpacity
						key={tab.key}
						style={[
							styles.tab,
							activeTab === tab.key && styles.tabActive,
						]}
						onPress={() => setActiveTab(tab.key)}>
						<Text
							style={[
								styles.tabText,
								activeTab === tab.key && styles.tabTextActive,
							]}>
							{tab.label}
						</Text>
					</TouchableOpacity>
				))}
			</View>

			{/* List */}
			<FlatList
				data={filtered}
				keyExtractor={(item) => item.id}
				renderItem={renderCard}
				contentContainerStyle={styles.listContent}
				showsVerticalScrollIndicator={false}
				ListEmptyComponent={
					<Text style={styles.empty}>Không có thông báo</Text>
				}
			/>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	screen: { flex: 1, backgroundColor: AUTH_UI.colors.background },

	header: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: s(16),
		paddingVertical: vs(12),
		gap: s(12),
	},
	iconBtn: {
		width: s(40),
		height: s(40),
		borderRadius: ms(12),
		backgroundColor: AUTH_UI.colors.surface,
		alignItems: "center",
		justifyContent: "center",
	},
	headerCenter: { flex: 1, alignItems: "center" },
	headerTitle: {
		color: AUTH_UI.colors.textPrimary,
		fontSize: ms(16),
		fontWeight: "700",
	},
	headerSubtitle: {
		color: AUTH_UI.colors.textMuted,
		fontSize: ms(12),
		marginTop: vs(2),
	},

	tabRow: {
		flexDirection: "row",
		paddingHorizontal: s(16),
		gap: s(8),
		marginBottom: vs(8),
	},
	tab: {
		paddingHorizontal: s(16),
		paddingVertical: vs(8),
		borderRadius: ms(20),
		backgroundColor: AUTH_UI.colors.surfaceMuted,
	},
	tabActive: { backgroundColor: AUTH_UI.colors.accent },
	tabText: {
		color: AUTH_UI.colors.textSecondary,
		fontSize: ms(13),
		fontWeight: "600",
	},
	tabTextActive: { color: AUTH_UI.colors.accentText },

	listContent: { paddingHorizontal: s(16), paddingBottom: vs(32), gap: vs(12) },

	card: {
		backgroundColor: AUTH_UI.colors.surface,
		borderRadius: ms(AUTH_UI.radius.xl),
		padding: s(16),
		gap: s(8),
	},
	cardTop: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	category: {
		color: AUTH_UI.colors.textPrimary,
		fontWeight: "700",
		fontSize: ms(14),
	},
	badge: {
		paddingHorizontal: s(10),
		paddingVertical: vs(4),
		borderRadius: ms(20),
	},
	badgeUnread: { backgroundColor: "rgba(243,201,66,0.2)" },
	badgeRead: { backgroundColor: "rgba(83,209,141,0.15)" },
	badgeText: { fontSize: ms(12), fontWeight: "600" },
	badgeTextUnread: { color: AUTH_UI.colors.accent },
	badgeTextRead: { color: AUTH_UI.colors.success },

	preview: {
		color: AUTH_UI.colors.textSecondary,
		fontSize: ms(13),
		lineHeight: ms(20),
	},

	timeRow: { flexDirection: "row", alignItems: "center", gap: s(6) },
	dot: {
		width: s(8),
		height: s(8),
		borderRadius: ms(4),
		backgroundColor: AUTH_UI.colors.accent,
	},
	timeAgo: { color: AUTH_UI.colors.textMuted, fontSize: ms(12) },

	empty: {
		textAlign: "center",
		color: AUTH_UI.colors.textMuted,
		marginTop: vs(40),
		fontSize: ms(14),
	},
});
