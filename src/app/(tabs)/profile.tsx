import { ScreenWrapper } from "@/components/screen-wrapper";
import { Button } from "@/components/common/Button";
import { Divider } from "@/components/common/Divider";
import { InfoRow } from "@/components/profile/InfoRow";
import { MenuRow } from "@/components/profile/MenuRow";
import { StatCard } from "@/components/profile/StatCard";
import { ToggleRow } from "@/components/profile/ToggleRow";
import { AUTH_UI } from "@/constants/auth-ui";
import { ROUTES } from "@/constants/api";
import { ms, s, vs } from "@/utils/responsive";
import { useAuthStore } from "@/store/auth.store";
import { UserRole } from "@/models/user.model";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

function formatDate(iso: string | null): string {
	if (!iso) return "Chưa cập nhật";
	const d = new Date(iso);
	if (isNaN(d.getTime())) return "Chưa cập nhật";
	return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function getInitials(name: string | null | undefined): string {
	if (!name) return "?";
	const parts = name.trim().split(" ");
	if (parts.length === 1) return parts[0][0].toUpperCase();
	return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Me() {
	const [notif, setNotif] = useState(true);
	const [darkMode, setDarkMode] = useState(true);
	const { logout, user } = useAuthStore();
	const router = useRouter();

	const isStudent = user?.role === UserRole.STUDENT;
	const licenseTier = isStudent ? user?.studentDetail?.licenseTier : null;

	const handleLogout = async () => {
		await logout();
		router.replace("/(auth)/login");
	};

	return (
		<ScreenWrapper
			backgroundColor={AUTH_UI.colors.background}
			scroll={true}
			edges={["top", "bottom"]}>
			<View style={styles.container}>
				<View style={styles.headerCard}>
					<View style={styles.headerTop}>
						<View style={styles.headerLeft}>
							<View style={styles.avatar}>
								{user?.avatarUrl ? (
									<Image
										source={{ uri: user.avatarUrl }}
										style={styles.avatarImage}
									/>
								) : (
									<Text style={styles.avatarText}>{getInitials(user?.fullName)}</Text>
								)}
							</View>
							<View style={styles.headerInfo}>
								<Text style={styles.fullName}>{user?.fullName ?? "—"}</Text>
								<Text style={styles.email}>{user?.email ?? "—"}</Text>
							</View>
						</View>
						<TouchableOpacity
							style={styles.editButton}
							onPress={() => router.push(ROUTES.PROFILE_EDIT)}>
							<Text style={styles.editButtonText}>Sửa</Text>
						</TouchableOpacity>
					</View>

					<View style={styles.badgesRow}>
						{licenseTier && (
							<View style={styles.badgePrimary}>
								<Text style={styles.badgePrimaryText}>Hạng {licenseTier}</Text>
							</View>
						)}
						{isStudent && (
							<View style={styles.badgePill}>
								<Text style={styles.badgePillText}>Đang học</Text>
							</View>
						)}
					</View>
				</View>

				<View style={styles.infoCard}>
					<InfoRow
						icon="call-outline"
						label="Số điện thoại"
						value={user?.phoneNumber ?? "Chưa cập nhật"}
					/>
					<Divider />
					<InfoRow
						icon="calendar-outline"
						label="Ngày sinh"
						value={formatDate(user?.dateOfBirth ?? null)}
					/>
					<Divider />
					<InfoRow
						icon="mail-outline"
						label="Email"
						value={user?.email ?? "—"}
					/>
					{user?.address && (
						<>
							<Divider />
							<InfoRow
								icon="location-outline"
								label="Địa chỉ"
								value={user.address}
							/>
						</>
					)}
				</View>

				<View style={styles.statsRow}>
					<StatCard label="Ngày học" value="42" />
					<StatCard label="Bài thi" value="34" />
					<StatCard label="Điểm TB" value="87%" color={AUTH_UI.colors.success} />
				</View>

				<Text style={styles.sectionTitle}>Tài khoản</Text>
				<View style={styles.sectionCard}>
					<ToggleRow
						icon="notifications-outline"
						label="Thông báo"
						value={notif}
						onChange={setNotif}
					/>
					<Divider />
					<ToggleRow
						icon="moon-outline"
						label="Chế độ tối"
						value={darkMode}
						onChange={setDarkMode}
					/>
					<Divider />
					<MenuRow icon="globe-outline" label="Ngôn ngữ" value="Tiếng Việt" />
				</View>

				{isStudent && (
					<>
						<Text style={styles.sectionTitle}>Khóa học</Text>
						<View style={styles.sectionCard}>
							<MenuRow
								icon="ribbon-outline"
								label="Hạng bằng đang học"
								value={licenseTier ?? "Chưa phân hạng"}
							/>
							<Divider />
							<MenuRow icon="star-outline" label="Đánh giá ứng dụng" />
						</View>
					</>
				)}

				<Text style={styles.sectionTitle}>Hỗ trợ</Text>
				<View style={styles.sectionCard}>
					<MenuRow icon="help-circle-outline" label="Trung tâm hỗ trợ" />
					<Divider />
					<MenuRow icon="lock-closed-outline" label="Chính sách bảo mật" />
					<Divider />
					<MenuRow icon="document-text-outline" label="Điều khoản sử dụng" />
				</View>

				<Text style={styles.versionText}>LXePro v1.0.0 • Build 2026.04</Text>

				<Button
					variant="danger"
					icon="log-out-outline"
					label="Đăng xuất"
					style={styles.logoutBtn}
					onPress={handleLogout}
				/>
			</View>
		</ScreenWrapper>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: s(16), paddingBottom: vs(32), gap: vs(12) },

	headerCard: {
		backgroundColor: AUTH_UI.colors.surface,
		borderRadius: ms(AUTH_UI.radius.xl),
		padding: s(16),
	},
	headerTop: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	headerLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
	headerInfo: { marginLeft: s(12), flex: 1 },
	avatar: {
		width: s(64),
		height: s(64),
		borderRadius: ms(16),
		backgroundColor: AUTH_UI.colors.accent,
		alignItems: "center",
		justifyContent: "center",
		overflow: "hidden",
	},
	avatarImage: { width: "100%", height: "100%" },
	avatarText: {
		color: AUTH_UI.colors.accentText,
		fontWeight: "800",
		fontSize: ms(20),
	},
	fullName: {
		color: AUTH_UI.colors.textPrimary,
		fontWeight: "800",
		fontSize: ms(16),
	},
	email: { color: AUTH_UI.colors.textSecondary, marginTop: vs(4), fontSize: ms(12) },
	editButton: {
		paddingHorizontal: s(12),
		paddingVertical: vs(6),
		borderRadius: ms(8),
		borderWidth: 1,
		borderColor: AUTH_UI.colors.accent,
	},
	editButtonText: {
		color: AUTH_UI.colors.accent,
		fontSize: ms(12),
		fontWeight: "600",
	},
	badgesRow: { flexDirection: "row", gap: s(8), marginTop: vs(12) },
	badgePrimary: {
		backgroundColor: AUTH_UI.colors.accent,
		paddingHorizontal: s(10),
		paddingVertical: vs(6),
		borderRadius: ms(12),
	},
	badgePrimaryText: { color: AUTH_UI.colors.accentText, fontWeight: "700" },
	badgePill: {
		backgroundColor: "rgba(83, 209, 141, 0.15)",
		paddingHorizontal: s(10),
		paddingVertical: vs(6),
		borderRadius: ms(12),
	},
	badgePillText: { color: AUTH_UI.colors.success },

	infoCard: {
		backgroundColor: AUTH_UI.colors.surface,
		borderRadius: ms(AUTH_UI.radius.lg),
		padding: s(12),
	},
	statsRow: { flexDirection: "row", gap: s(8), marginTop: vs(6) },
	sectionTitle: {
		textTransform: "uppercase",
		fontSize: ms(11),
		color: AUTH_UI.colors.textMuted,
		letterSpacing: 0.8,
		fontWeight: "600",
		marginTop: vs(8),
		marginBottom: vs(6),
	},
	sectionCard: {
		backgroundColor: AUTH_UI.colors.surface,
		borderRadius: ms(AUTH_UI.radius.lg),
		padding: s(8),
	},
	versionText: {
		color: AUTH_UI.colors.textMuted,
		fontSize: ms(11),
		textAlign: "center",
		marginTop: vs(8),
	},
	logoutBtn: {
		marginTop: vs(16),
	},
});
