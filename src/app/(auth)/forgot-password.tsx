import { ScreenWrapper } from "@/components/screen-wrapper";
import { Button } from "@/components/common/Button";
import { InputField } from "@/components/common/InputField";
import { AUTH_LAYOUT, AUTH_UI } from "@/constants/auth-ui";
import { AUTH_MESSAGES } from "@/constants/messages";
import { authService } from "@/services/auth.service";
import { vs, ms } from "@/utils/responsive";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen() {
	const [email, setEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const emailError = useMemo(() => {
		if (!email) return "";
		return EMAIL_REGEX.test(email.trim()) ? "" : AUTH_MESSAGES.MSG04;
	}, [email]);
	const isEmailDisabled = !email.trim() || !!emailError;

	const handleSendRequest = async () => {
		if (isEmailDisabled) return;
		setIsLoading(true);
		try {
			await authService.forgotPassword({ email: email.trim() });
			Alert.alert(
				"Kiểm tra email",
				"Nếu email tồn tại, chúng tôi đã gửi link đặt lại mật khẩu. Vui lòng kiểm tra hộp thư của bạn.",
				[{ text: "OK", onPress: () => router.replace("/(auth)/login") }],
			);
		} catch (error: any) {
			Alert.alert("Thông báo", error?.message ?? "Có lỗi xảy ra. Vui lòng thử lại.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<ScreenWrapper backgroundColor={AUTH_UI.colors.background} keyboard>
			<View style={styles.content}>
				<Button
					variant="icon"
					icon="arrow-back"
					onPress={() => router.back()}
					style={styles.backButton}
				/>

				<Text style={styles.title}>Quên mật khẩu</Text>
				<Text style={styles.subtitle}>Nhập email để nhận link đặt lại mật khẩu</Text>

				<InputField
					leftIcon="mail-outline"
					value={email}
					onChangeText={setEmail}
					autoCapitalize="none"
					keyboardType="email-address"
					placeholder="Email của bạn"
				/>

				{!!emailError && (
					<Text style={styles.errorText}>{emailError}</Text>
				)}

				<Button
					variant="primary"
					label="Gửi yêu cầu"
					onPress={handleSendRequest}
					disabled={isEmailDisabled || isLoading}
					loading={isLoading}
				/>
			</View>
		</ScreenWrapper>
	);
}

const styles = StyleSheet.create({
	content: {
		flex: 1,
		paddingHorizontal: AUTH_LAYOUT.horizontalPadding,
		paddingTop: vs(16),
	},
	backButton: {
		marginBottom: vs(16),
		borderWidth: 1,
		borderColor: AUTH_UI.colors.border,
		borderRadius: ms(10),
	},
	title: {
		color: AUTH_UI.colors.textPrimary,
		fontSize: ms(24),
		fontWeight: "700",
		marginBottom: vs(6),
	},
	subtitle: {
		color: AUTH_UI.colors.textSecondary,
		fontSize: ms(13),
		marginBottom: vs(18),
	},
	errorText: {
		color: AUTH_UI.colors.danger,
		fontSize: ms(12),
		marginBottom: vs(10),
		marginTop: vs(-8),
	},
});
