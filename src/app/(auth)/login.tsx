import { ScreenWrapper } from "@/components/screen-wrapper";
import { Button } from "@/components/common/Button";
import { InputField } from "@/components/common/InputField";
import { AUTH_LAYOUT, AUTH_UI } from "@/constants/auth-ui";
import { AUTH_MESSAGES } from "@/constants/messages";
import { ms, s, vs } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const router = useRouter();

	const handleLogin = async () => {
		if (!email.trim() || !password.trim() || !EMAIL_REGEX.test(email.trim())) {
			Alert.alert("Thông báo", AUTH_MESSAGES.MSG01);
			return;
		}
		// TODO: gọi authService.login() khi có API
		// MSG02 – tài khoản bị khóa (BR02)
		// MSG03 – sai mật khẩu (BR03)
		router.replace("/(tabs)");
	};

	return (
		<ScreenWrapper
			backgroundColor={AUTH_UI.colors.background}
			keyboard
			edges={["top", "bottom"]}>
			<View style={styles.inner}>
				<View style={styles.logoWrapper}>
					<Ionicons
						name="key-outline"
						size={ms(22)}
						color={AUTH_UI.colors.accentText}
					/>
				</View>

				<Text style={styles.title}>Chào mừng trở lại</Text>
				<Text style={styles.subtitle}>Đăng nhập để tiếp tục học</Text>

				<InputField
					leftIcon="mail-outline"
					placeholder="Email của bạn"
					value={email}
					onChangeText={setEmail}
					autoCapitalize="none"
					keyboardType="email-address"
				/>

				<InputField
					leftIcon="lock-closed-outline"
					rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
					onRightPress={() => setShowPassword((p) => !p)}
					placeholder="Mật khẩu"
					value={password}
					onChangeText={setPassword}
					secureTextEntry={!showPassword}
				/>

				<TouchableOpacity
					style={styles.forgotLink}
					onPress={() => router.push("/(auth)/forgot-password")}>
					<Text style={styles.forgotText}>Quên mật khẩu?</Text>
				</TouchableOpacity>

				<Button
					variant="primary"
					label="Đăng nhập"
					onPress={handleLogin}
					loading={loading}
					disabled={loading}
				/>

				<View style={styles.registerView}>
					<Text style={styles.linkText}>
						Chưa có tài khoản?{" "}
						<Text style={styles.linkBold}>Liên hệ admin để được hỗ trợ.</Text>
					</Text>
				</View>
			</View>
		</ScreenWrapper>
	);
}

const styles = StyleSheet.create({
	inner: {
		flex: 1,
		justifyContent: "center",
		paddingHorizontal: AUTH_LAYOUT.horizontalPadding,
	},
	logoWrapper: {
		width: s(48),
		height: s(48),
		borderRadius: ms(AUTH_UI.radius.xl),
		backgroundColor: AUTH_UI.colors.accent,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: vs(18),
	},
	title: {
		fontSize: ms(30),
		fontWeight: "700",
		color: AUTH_UI.colors.textPrimary,
		marginBottom: vs(6),
	},
	subtitle: {
		fontSize: ms(14),
		color: AUTH_UI.colors.textSecondary,
		marginBottom: vs(26),
	},
	forgotLink: { alignSelf: "flex-end", marginBottom: vs(14), marginTop: -4 },
	forgotText: {
		fontSize: ms(12),
		color: AUTH_UI.colors.accent,
		fontWeight: "600",
	},
	registerView: {
		flexDirection: "row",
		justifyContent: "center",
		gap: s(2),
		marginTop: vs(16),
	},
	linkText: { fontSize: ms(13), color: AUTH_UI.colors.textSecondary },
	linkBold: { color: AUTH_UI.colors.accent, fontWeight: "600" },
});
