import { ScreenWrapper } from "@/components/screen-wrapper";
import { AUTH_LAYOUT, AUTH_UI } from "@/constants/auth-ui";
import { useAuthStore } from "@/store/auth.store";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
	ActivityIndicator,
	Alert,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

export default function LoginScreen() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const router = useRouter();
	const { setTokens, setUser } = useAuthStore();

	const handleLogin = async () => {
		if (!email || !password) {
			Alert.alert("Lỗi", "Vui lòng nhập email và mật khẩu");
			return;
		}

		// setLoading(true);
		// try {
		// 	const data = await authService.login({ email, password });
		// 	await setTokens(data.accessToken, data.refreshToken);
		// 	setUser(data.user);
		// } catch {
		// 	Alert.alert("Đăng nhập thất bại", "Email hoặc mật khẩu không đúng");
		// } finally {
		// 	setLoading(false);
		// }
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
						size={22}
						color={AUTH_UI.colors.accentText}
					/>
				</View>

				<Text style={styles.title}>Chào mừng trở lại</Text>
				<Text style={styles.subtitle}>Đăng nhập để tiếp tục học</Text>

				<View style={styles.inputRow}>
					<Ionicons
						name="mail-outline"
						size={18}
						color={AUTH_UI.colors.textMuted}
					/>
					<TextInput
						style={styles.input}
						placeholder="Email của bạn"
						value={email}
						onChangeText={setEmail}
						autoCapitalize="none"
						keyboardType="email-address"
						placeholderTextColor={AUTH_UI.colors.textMuted}
					/>
				</View>

				<View style={styles.inputRow}>
					<Ionicons
						name="lock-closed-outline"
						size={18}
						color={AUTH_UI.colors.textMuted}
					/>
					<TextInput
						style={styles.input}
						placeholder="Mật khẩu"
						value={password}
						onChangeText={setPassword}
						secureTextEntry={!showPassword}
						placeholderTextColor={AUTH_UI.colors.textMuted}
					/>
					<TouchableOpacity
						onPress={() => setShowPassword((prev) => !prev)}>
						<Ionicons
							name={
								showPassword ? "eye-off-outline" : "eye-outline"
							}
							size={18}
							color={AUTH_UI.colors.textMuted}
						/>
					</TouchableOpacity>
				</View>

				<TouchableOpacity
					style={styles.forgotLink}
					onPress={() => router.push("/(auth)/forgot-password")}>
					<Text style={styles.forgotText}>Quên mật khẩu?</Text>
				</TouchableOpacity>

				<TouchableOpacity
					style={[styles.button, loading && styles.buttonDisabled]}
					onPress={handleLogin}
					disabled={loading}>
					{loading ? (
						<ActivityIndicator color={AUTH_UI.colors.accentText} />
					) : (
						<Text style={styles.buttonText}>Đăng nhập</Text>
					)}
				</TouchableOpacity>
				<View style={styles.registerView}>
					<Text style={styles.linkText}>Chưa có tài khoản? </Text>
					<Link
						href="/(auth)/register"
						asChild>
						<TouchableOpacity style={styles.linkRow}>
							<Text style={[styles.linkText, styles.linkBold]}>
								Liên hệ admin nhé!
							</Text>
						</TouchableOpacity>
					</Link>
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
		width: 48,
		height: 48,
		borderRadius: AUTH_UI.radius.xl,
		backgroundColor: AUTH_UI.colors.accent,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 18,
	},
	title: {
		fontSize: 30,
		fontWeight: "700",
		color: AUTH_UI.colors.textPrimary,
		marginBottom: 6,
	},
	subtitle: {
		fontSize: 14,
		color: AUTH_UI.colors.textSecondary,
		marginBottom: 26,
	},
	inputRow: {
		height: 50,
		borderWidth: 1,
		borderColor: AUTH_UI.colors.border,
		borderRadius: AUTH_UI.radius.lg,
		backgroundColor: AUTH_UI.colors.surface,
		paddingHorizontal: 14,
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 12,
	},
	input: {
		flex: 1,
		fontSize: 15,
		color: AUTH_UI.colors.textPrimary,
		marginLeft: 10,
	},
	forgotLink: { alignSelf: "flex-end", marginBottom: 14 },
	forgotText: {
		fontSize: 12,
		color: AUTH_UI.colors.accent,
		fontWeight: "600",
	},
	button: {
		backgroundColor: AUTH_UI.colors.accent,
		borderRadius: AUTH_UI.radius.lg,
		height: 50,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 24,
	},
	buttonDisabled: {
		backgroundColor: AUTH_UI.colors.disabled,
	},
	buttonText: {
		color: AUTH_UI.colors.accentText,
		fontSize: 15,
		fontWeight: "700",
	},
	registerView: {
		flexDirection: "row",
		justifyContent: "center",
		gap: 2,
	},
	linkRow: { flexDirection: "row", justifyContent: "center" },
	linkText: { fontSize: 13, color: AUTH_UI.colors.textSecondary },
	linkBold: { color: AUTH_UI.colors.accent, fontWeight: "600" },
});
