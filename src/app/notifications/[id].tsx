import { AUTH_UI } from "@/constants/auth-ui";
import { useNotificationsStore } from "@/store/notifications.store";
import { ms, s, vs } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

export default function NotificationDetailScreen() {
	const router = useRouter();
	const { id } = useLocalSearchParams<{ id: string }>();
	const { notifications, markAsRead, refresh } = useNotificationsStore();

	const notification = useMemo(
		() => notifications.find((n) => n.id === id),
		[notifications, id],
	);

	const unreadCount = useMemo(
		() => notifications.filter((n) => !n.isRead).length,
		[notifications],
	);

	useEffect(() => {
		if (id) markAsRead(id);
	}, [id]);

	if (!notification) {
		return (
			<SafeAreaView style={styles.screen}>
				<Text style={styles.notFound}>Không tìm thấy thông báo</Text>
			</SafeAreaView>
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
					<Text style={styles.headerTitle}>Chi tiết thông báo</Text>
					<Text style={styles.headerSubtitle}>
						{unreadCount} thông báo chưa đọc
					</Text>
				</View>
				<TouchableOpacity style={styles.iconBtn} onPress={refresh}>
					<Ionicons
						name="refresh-outline"
						size={ms(20)}
						color={AUTH_UI.colors.textPrimary}
					/>
				</TouchableOpacity>
			</View>

			{/* Detail card */}
			<ScrollView
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}>
				<View style={styles.card}>
					<Text style={styles.detail}>{notification.detail}</Text>
					<View style={styles.timeRow}>
						<View style={styles.dot} />
						<Text style={styles.timeAgo}>{notification.timeAgo}</Text>
					</View>
				</View>
			</ScrollView>
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

	scrollContent: { paddingHorizontal: s(16), paddingBottom: vs(32) },

	card: {
		backgroundColor: AUTH_UI.colors.surface,
		borderRadius: ms(AUTH_UI.radius.xl),
		padding: s(20),
		gap: vs(16),
	},
	detail: {
		color: AUTH_UI.colors.textPrimary,
		fontSize: ms(14),
		lineHeight: ms(24),
	},

	timeRow: { flexDirection: "row", alignItems: "center", gap: s(6) },
	dot: {
		width: s(8),
		height: s(8),
		borderRadius: ms(4),
		backgroundColor: AUTH_UI.colors.accent,
	},
	timeAgo: { color: AUTH_UI.colors.textMuted, fontSize: ms(12) },

	notFound: {
		textAlign: "center",
		color: AUTH_UI.colors.textMuted,
		marginTop: vs(40),
		fontSize: ms(14),
	},
});
