import { ScreenWrapper } from "@/components/screen-wrapper";
import { AUTH_UI } from "@/constants/auth-ui";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";

export default function Me() {
	const [notif, setNotif] = useState(true);
	const [darkMode, setDarkMode] = useState(true);

	return (
		<ScreenWrapper
			backgroundColor={AUTH_UI.colors.background}
			scroll={true}
			edges={["top", "bottom"]}>
			<View style={styles.container}>
				{/* Header card */}
				<View style={styles.headerCard}>
					<View style={styles.headerLeft}>
						<View style={styles.avatar}>
							<Text style={styles.avatarText}>NA</Text>
						</View>
						<View style={{ marginLeft: 12, flex: 1 }}>
							<Text style={styles.fullName}>Nguyễn Văn An</Text>
							<Text style={styles.email}>
								nguyenvanan@email.com
							</Text>
						</View>
					</View>

					<View style={styles.badgesRow}>
						<View style={styles.badgePrimary}>
							<Text style={styles.badgePrimaryText}>Hạng B1</Text>
						</View>
						<View style={styles.badgePill}>
							<Text style={styles.badgePillText}>Đang học</Text>
						</View>
					</View>
				</View>

				{/* Info card */}
				<View style={styles.infoCard}>
					<InfoRow
						icon="call-outline"
						label="Số điện thoại"
						value="0901 234 567"
					/>
					<View style={styles.divider} />
					<InfoRow
						icon="calendar-outline"
						label="Ngày sinh"
						value="15/03/1998"
					/>
					<View style={styles.divider} />
					<InfoRow
						icon="mail-outline"
						label="Email"
						value="nguyenvanan@email.com"
					/>
				</View>

				{/* Stats boxes */}
				<View style={styles.statsRow}>
					<StatCard
						label="Ngày học"
						value="42"
					/>
					<StatCard
						label="Bài thi"
						value="34"
					/>
					<StatCard
						label="Điểm TB"
						value="87%"
						color={AUTH_UI.colors.success}
					/>
				</View>

				{/* Account section */}
				<Text style={styles.sectionTitle}>Tài khoản</Text>
				<View style={styles.sectionCard}>
					<RowToggle
						icon="notifications-outline"
						label="Thông báo"
						valueBool={notif}
						onValueChange={setNotif}
					/>
					<View style={styles.divider} />
					<RowToggle
						icon="moon-outline"
						label="Chế độ tối"
						valueBool={darkMode}
						onValueChange={setDarkMode}
					/>
					<View style={styles.divider} />
					<Row
						icon="globe-outline"
						label="Ngôn ngữ"
						value="Tiếng Việt"
						chevron
					/>
				</View>

				{/* Course */}
				<Text style={styles.sectionTitle}>Khóa học</Text>
				<View style={styles.sectionCard}>
					<Row
						icon="ribbon-outline"
						label="Hạng bằng đang học"
						value="B1"
						chevron
					/>
					<View style={styles.divider} />
					<Row
						icon="star-outline"
						label="Đánh giá ứng dụng"
						chevron
					/>
				</View>

				{/* Support */}
				<Text style={styles.sectionTitle}>Hỗ trợ</Text>
				<View style={styles.sectionCard}>
					<Row
						icon="help-circle-outline"
						label="Trung tâm hỗ trợ"
						chevron
					/>
					<View style={styles.divider} />
					<Row
						icon="lock-closed-outline"
						label="Chính sách bảo mật"
						chevron
					/>
					<View style={styles.divider} />
					<Row
						icon="document-text-outline"
						label="Điều khoản sử dụng"
						chevron
					/>
				</View>

				<Text style={styles.versionText}>LXePro v1.0.0 • Build 2026.04</Text>

				{/* Logout */}
				<TouchableOpacity style={styles.logoutBtn}>
					<Ionicons
						name="log-out-outline"
						size={18}
						color={AUTH_UI.colors.accentText}
						style={{ marginRight: 8 }}
					/>
					<Text style={styles.logoutText}>Đăng xuất</Text>
				</TouchableOpacity>
			</View>
		</ScreenWrapper>
	);
}

function Row({
	icon,
	label,
	value,
	chevron,
}: {
	icon: any;
	label: string;
	value?: string;
	chevron?: boolean;
}) {
	return (
		<TouchableOpacity
			style={styles.row}
			activeOpacity={0.8}>
			<View style={styles.rowLeft}>
				<View style={styles.rowIconBox}>
					<Ionicons
						name={icon}
						size={18}
						color={AUTH_UI.colors.accent}
					/>
				</View>
				<View style={{ marginLeft: 10 }}>
					<Text style={styles.rowLabel}>{label}</Text>
					{value ? (
						<Text style={styles.rowValue}>{value}</Text>
					) : null}
				</View>
			</View>
			{chevron ? (
				<Ionicons
					name="chevron-forward"
					size={18}
					color={AUTH_UI.colors.textSecondary}
				/>
			) : null}
		</TouchableOpacity>
	);
}

function InfoRow({
	icon,
	label,
	value,
}: {
	icon: any;
	label: string;
	value: string;
}) {
	return (
		<View style={styles.infoRow}>
			<View style={styles.rowLeft}>
				<View style={styles.rowIconBox}>
					<Ionicons
						name={icon}
						size={18}
						color={AUTH_UI.colors.accent}
					/>
				</View>
				<View style={{ marginLeft: 10 }}>
					<Text style={styles.infoRowLabel}>{label}</Text>
					<Text style={styles.infoRowValue}>{value}</Text>
				</View>
			</View>
		</View>
	);
}

function RowToggle({
	icon,
	label,
	valueBool,
	onValueChange,
}: {
	icon: any;
	label: string;
	valueBool: boolean;
	onValueChange: (v: boolean) => void;
}) {
	return (
		<View style={styles.row}>
			<View style={styles.rowLeft}>
				<View style={styles.rowIconBox}>
					<Ionicons
						name={icon}
						size={18}
						color={AUTH_UI.colors.accent}
					/>
				</View>
				<Text style={[styles.rowLabel, { marginLeft: 10 }]}>
					{label}
				</Text>
			</View>
			<Switch
				value={valueBool}
				onValueChange={onValueChange}
				thumbColor={valueBool ? AUTH_UI.colors.accentText : undefined}
				trackColor={{
					true: AUTH_UI.colors.accent,
					false: AUTH_UI.colors.surfaceMuted,
				}}
			/>
		</View>
	);
}

function StatCard({
	label,
	value,
	color,
}: {
	label: string;
	value: string;
	color?: string;
}) {
	return (
		<View style={styles.statCard}>
			<Text style={[styles.statValue, color ? { color } : null]}>
				{value}
			</Text>
			<Text style={styles.statLabel}>{label}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16, paddingBottom: 32, gap: 12 },

	headerCard: {
		backgroundColor: AUTH_UI.colors.surface,
		borderRadius: AUTH_UI.radius.xl,
		padding: 16,
		overflow: "hidden",
	},
	headerLeft: { flexDirection: "row", alignItems: "center" },
	avatar: {
		width: 64,
		height: 64,
		borderRadius: 16,
		backgroundColor: AUTH_UI.colors.accent,
		alignItems: "center",
		justifyContent: "center",
	},
	avatarText: {
		color: AUTH_UI.colors.accentText,
		fontWeight: "800",
		fontSize: 20,
	},
	fullName: {
		color: AUTH_UI.colors.textPrimary,
		fontWeight: "800",
		fontSize: 16,
	},
	email: { color: AUTH_UI.colors.textSecondary, marginTop: 4, fontSize: 12 },
	badgesRow: { flexDirection: "row", gap: 8, marginTop: 12 },
	badgePrimary: {
		backgroundColor: AUTH_UI.colors.accent,
		paddingHorizontal: 10,
		paddingVertical: 6,
		borderRadius: 12,
	},
	badgePrimaryText: { color: AUTH_UI.colors.accentText, fontWeight: "700" },
	badgePill: {
		backgroundColor: "rgba(83, 209, 141, 0.15)",
		paddingHorizontal: 10,
		paddingVertical: 6,
		borderRadius: 12,
	},
	badgePillText: { color: AUTH_UI.colors.success },

	infoCard: {
		backgroundColor: AUTH_UI.colors.surface,
		borderRadius: 12,
		padding: 12,
	},
	infoRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: 10,
	},
	infoRowLabel: {
		color: AUTH_UI.colors.textSecondary,
		fontSize: 11,
	},
	infoRowValue: {
		color: AUTH_UI.colors.textPrimary,
		fontSize: 14,
		fontWeight: "600",
		marginTop: 2,
	},

	divider: {
		height: 1,
		backgroundColor: AUTH_UI.colors.border,
	},

	row: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: 10,
	},
	rowLeft: { flexDirection: "row", alignItems: "center" },
	rowIconBox: {
		width: 40,
		height: 40,
		borderRadius: 10,
		backgroundColor: AUTH_UI.colors.surfaceMuted,
		alignItems: "center",
		justifyContent: "center",
	},
	rowLabel: { color: AUTH_UI.colors.textPrimary, fontWeight: "700" },
	rowValue: {
		color: AUTH_UI.colors.textSecondary,
		marginTop: 2,
		fontSize: 12,
	},

	statsRow: { flexDirection: "row", gap: 8, marginTop: 6 },
	statCard: {
		flex: 1,
		backgroundColor: AUTH_UI.colors.surface,
		borderRadius: 12,
		padding: 12,
		alignItems: "center",
	},
	statValue: {
		color: AUTH_UI.colors.accent,
		fontWeight: "900",
		fontSize: 18,
	},
	statLabel: {
		color: AUTH_UI.colors.textSecondary,
		fontSize: 12,
		marginTop: 6,
	},

	sectionTitle: {
		textTransform: "uppercase",
		fontSize: 11,
		color: AUTH_UI.colors.textMuted,
		letterSpacing: 0.8,
		fontWeight: "600",
		marginTop: 8,
		marginBottom: 6,
	},
	sectionCard: {
		backgroundColor: AUTH_UI.colors.surface,
		borderRadius: 12,
		padding: 8,
	},

	versionText: {
		color: AUTH_UI.colors.textMuted,
		fontSize: 11,
		textAlign: "center",
		marginTop: 8,
	},

	logoutBtn: {
		marginTop: 16,
		backgroundColor: AUTH_UI.colors.danger,
		paddingVertical: 14,
		borderRadius: 12,
		alignItems: "center",
		flexDirection: "row",
		justifyContent: "center",
	},
	logoutText: { color: AUTH_UI.colors.accentText, fontWeight: "800" },
});
