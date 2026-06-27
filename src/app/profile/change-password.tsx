import { ScreenWrapper } from "@/components/screen-wrapper";
import { Button } from "@/components/common/Button";
import { InputField } from "@/components/common/InputField";
import { AUTH_UI } from "@/constants/auth-ui";
import { AUTH_MESSAGES } from "@/constants/messages";
import { ROUTES } from "@/constants";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { getErrorMessage } from "@/utils/error";
import { checkPasswordRules } from "@/utils/password";
import { ms, s, vs } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
	Alert,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

export default function ChangePasswordScreen() {
	const router = useRouter();
	const signOutLocal = useAuthStore((s) => s.signOutLocal);

	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showCurrent, setShowCurrent] = useState(false);
	const [showNew, setShowNew] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);
	const [loading, setLoading] = useState(false);

	const rules = useMemo(() => checkPasswordRules(newPassword), [newPassword]);
	const isRulePassed = Object.values(rules).every(Boolean);
	const isConfirmMatched = confirmPassword.length > 0 && newPassword === confirmPassword;
	const isSameAsOld = newPassword.length > 0 && newPassword === currentPassword;
	const canSubmit =
		currentPassword.length > 0 && isRulePassed && isConfirmMatched && !isSameAsOld;

	const handleSubmit = async () => {
		if (!currentPassword || !newPassword || !confirmPassword) {
			Alert.alert("Thông báo", AUTH_MESSAGES.CHANGE_PW_REQUIRED);
			return;
		}
		if (!isRulePassed) {
			Alert.alert("Thông báo", AUTH_MESSAGES.MSG07);
			return;
		}
		if (!isConfirmMatched) {
			Alert.alert("Thông báo", AUTH_MESSAGES.CHANGE_PW_MISMATCH);
			return;
		}
		if (isSameAsOld) {
			Alert.alert("Thông báo", AUTH_MESSAGES.CHANGE_PW_SAME_AS_OLD);
			return;
		}

		setLoading(true);
		const result = await authService.changePassword({ currentPassword, newPassword });
		setLoading(false);

		if (result.success) {
			// Backend đã thu hồi toàn bộ phiên/token cũ → đăng xuất cục bộ, bắt đăng nhập lại.
			Alert.alert("Thành công", AUTH_MESSAGES.CHANGE_PW_SUCCESS, [
				{
					text: "OK",
					onPress: async () => {
						await signOutLocal();
						router.replace(ROUTES.LOGIN);
					},
				},
			]);
			return;
		}

		// Sai mật khẩu hiện tại → backend trả 401 (code UNAUTHORIZED).
		const message =
			result.code === "UNAUTHORIZED"
				? AUTH_MESSAGES.CHANGE_PW_WRONG_CURRENT
				: getErrorMessage(result.code, result.error);
		Alert.alert("Lỗi", message);
	};

	const renderRule = (isPassed: boolean, label: string) => (
		<View style={styles.ruleRow}>
			<Ionicons
				name={isPassed ? "checkmark-circle" : "ellipse-outline"}
				size={ms(14)}
				color={isPassed ? AUTH_UI.colors.success : AUTH_UI.colors.textMuted}
			/>
			<Text style={[styles.ruleText, isPassed && styles.ruleTextPassed]}>{label}</Text>
		</View>
	);

	return (
		<ScreenWrapper backgroundColor={AUTH_UI.colors.background} keyboard edges={["top", "bottom"]}>
			<View style={styles.header}>
				<TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
					<Ionicons name="arrow-back" size={ms(22)} color={AUTH_UI.colors.textPrimary} />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Đổi mật khẩu</Text>
				<View style={styles.backBtn} />
			</View>

			<ScrollView
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="handled">
				<Text style={styles.subtitle}>
					Sau khi đổi mật khẩu, bạn sẽ được đăng xuất khỏi tất cả thiết bị và cần đăng nhập lại.
				</Text>

				<InputField
					leftIcon="lock-closed-outline"
					rightIcon={showCurrent ? "eye-off-outline" : "eye-outline"}
					onRightPress={() => setShowCurrent((p) => !p)}
					value={currentPassword}
					onChangeText={setCurrentPassword}
					secureTextEntry={!showCurrent}
					autoCapitalize="none"
					placeholder="Mật khẩu hiện tại"
				/>

				<InputField
					leftIcon="key-outline"
					rightIcon={showNew ? "eye-off-outline" : "eye-outline"}
					onRightPress={() => setShowNew((p) => !p)}
					value={newPassword}
					onChangeText={setNewPassword}
					secureTextEntry={!showNew}
					autoCapitalize="none"
					placeholder="Mật khẩu mới"
				/>

				<InputField
					leftIcon="key-outline"
					rightIcon={showConfirm ? "eye-off-outline" : "eye-outline"}
					onRightPress={() => setShowConfirm((p) => !p)}
					value={confirmPassword}
					onChangeText={setConfirmPassword}
					secureTextEntry={!showConfirm}
					autoCapitalize="none"
					placeholder="Xác nhận mật khẩu mới"
				/>

				<View style={styles.rulesBox}>
					{renderRule(rules.minLength, "Ít nhất 8 ký tự")}
					{renderRule(rules.upperLower, "Có chữ hoa và chữ thường")}
					{renderRule(rules.hasNumber, "Có ít nhất 1 chữ số")}
					{renderRule(rules.hasSpecial, "Có ít nhất 1 ký tự đặc biệt")}
					{renderRule(isConfirmMatched, "Mật khẩu xác nhận khớp")}
					{renderRule(!isSameAsOld && newPassword.length > 0, "Khác mật khẩu hiện tại")}
				</View>

				<Button
					variant="primary"
					label="Đổi mật khẩu"
					onPress={handleSubmit}
					loading={loading}
					disabled={loading || !canSubmit}
					style={styles.submitBtn}
				/>
			</ScrollView>
		</ScreenWrapper>
	);
}

const styles = StyleSheet.create({
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: s(16),
		paddingVertical: vs(12),
	},
	backBtn: { width: s(36) },
	headerTitle: {
		fontSize: ms(17),
		fontWeight: "700",
		color: AUTH_UI.colors.textPrimary,
	},
	scrollContent: {
		paddingHorizontal: s(16),
		paddingBottom: vs(40),
	},
	subtitle: {
		color: AUTH_UI.colors.textSecondary,
		fontSize: ms(13),
		marginBottom: vs(18),
	},
	rulesBox: {
		borderRadius: ms(AUTH_UI.radius.lg),
		borderWidth: 1,
		borderColor: AUTH_UI.colors.border,
		backgroundColor: AUTH_UI.colors.surface,
		paddingVertical: vs(10),
		paddingHorizontal: s(12),
		marginTop: vs(4),
		marginBottom: vs(14),
	},
	ruleRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: vs(6),
	},
	ruleText: {
		color: AUTH_UI.colors.textMuted,
		fontSize: ms(12),
		marginLeft: s(8),
	},
	ruleTextPassed: {
		color: AUTH_UI.colors.success,
	},
	submitBtn: { marginTop: vs(8) },
});
