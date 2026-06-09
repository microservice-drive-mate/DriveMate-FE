import { ScreenWrapper } from "@/components/screen-wrapper";
import { Button } from "@/components/common/Button";
import { InputField } from "@/components/common/InputField";
import { StepProgressBar } from "@/components/ui/StepProgressBar";
import { AUTH_LAYOUT, AUTH_UI } from "@/constants/auth-ui";
import { AUTH_MESSAGES } from "@/constants/messages";
import { ms, s, vs } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
	Alert,
	Dimensions,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import Animated, {
	Easing,
	interpolate,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";

const SCREEN_WIDTH = Dimensions.get("window").width;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_LENGTH = 6;
const OTP_SECONDS = 60;

function checkPasswordRules(password: string) {
	return {
		minLength: password.length >= 8,
		upperLower: /(?=.*[a-z])(?=.*[A-Z])/.test(password),
		hasNumber: /\d/.test(password),
		hasSpecial: /[^A-Za-z0-9]/.test(password),
	};
}

export default function ForgotPasswordScreen() {
	const [step, setStep] = useState(1);

	const [email, setEmail] = useState("");

	const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
	const [secondsLeft, setSecondsLeft] = useState(OTP_SECONDS);
	const otpRefs = useRef<(TextInput | null)[]>([]);

	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const entry = useSharedValue(0);

	useEffect(() => {
		entry.value = 0;
		entry.value = withTiming(1, {
			duration: 420,
			easing: Easing.out(Easing.cubic),
		});
	}, [step, entry]);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [
			{ translateX: interpolate(entry.value, [0, 1], [SCREEN_WIDTH, 0]) },
		],
	}));

	useEffect(() => {
		if (step !== 2 || secondsLeft <= 0) return;
		const timer = setInterval(() => {
			setSecondsLeft((prev) => (prev <= 1 ? 0 : prev - 1));
		}, 1000);
		return () => clearInterval(timer);
	}, [step, secondsLeft]);

	const goToStep = (next: number) => setStep(next);

	const handleBack = () => {
		if (step > 1) {
			goToStep(step - 1);
		} else {
			router.back();
		}
	};

	const emailError = useMemo(() => {
		if (!email) return "";
		return EMAIL_REGEX.test(email.trim()) ? "" : AUTH_MESSAGES.MSG04;
	}, [email]);
	const isEmailDisabled = !email.trim() || !!emailError;

	const handleSendOtp = () => {
		if (isEmailDisabled) {
			Alert.alert("Thông báo", AUTH_MESSAGES.MSG04);
			return;
		}
		goToStep(2);
	};

	const otpCode = otp.join("");
	const isOtpDisabled = otpCode.length < OTP_LENGTH;
	const resendLabel = useMemo(() => {
		if (secondsLeft === 0) return "Gửi lại";
		return `Gửi lại sau ${secondsLeft}s`;
	}, [secondsLeft]);

	const handleOtpChange = (value: string, index: number) => {
		const digit = value.replace(/\D/g, "").slice(-1);
		const next = [...otp];
		next[index] = digit;
		setOtp(next);
		if (digit && index < OTP_LENGTH - 1) {
			otpRefs.current[index + 1]?.focus();
		}
	};

	const handleOtpKeyPress = (key: string, index: number) => {
		if (key === "Backspace" && !otp[index] && index > 0) {
			otpRefs.current[index - 1]?.focus();
		}
	};

	const handleResend = () => {
		if (secondsLeft > 0) return;
		setOtp(Array(OTP_LENGTH).fill(""));
		setSecondsLeft(OTP_SECONDS);
		otpRefs.current[0]?.focus();
	};

	const rules = useMemo(() => checkPasswordRules(password), [password]);
	const isRulePassed = Object.values(rules).every(Boolean);
	const isConfirmMatched = confirmPassword.length > 0 && password === confirmPassword;
	const isPasswordDisabled = !isRulePassed || !isConfirmMatched;

	const handleSubmit = () => {
		if (isPasswordDisabled) return;
		Alert.alert("Thành công", "Đặt lại mật khẩu thành công", [
			{ text: "OK", onPress: () => router.replace("/(auth)/login") },
		]);
	};

	const renderRule = (isPassed: boolean, label: string) => (
		<View style={styles.ruleRow}>
			<Ionicons
				name={isPassed ? "checkmark-circle" : "ellipse-outline"}
				size={ms(14)}
				color={isPassed ? AUTH_UI.colors.success : AUTH_UI.colors.textMuted}
			/>
			<Text style={[styles.ruleText, isPassed && styles.ruleTextPassed]}>
				{label}
			</Text>
		</View>
	);

	const titles = ["Quên mật khẩu", "Quên mật khẩu", "Tạo mật khẩu mới"];

	return (
		<ScreenWrapper backgroundColor={AUTH_UI.colors.background} keyboard>
			<View style={styles.content}>
				<Button
					variant="icon"
					icon="arrow-back"
					onPress={handleBack}
					style={styles.backButton}
				/>

				<StepProgressBar currentStep={step} />

				<Animated.View style={[styles.slideContent, animatedStyle]}>
					<Text style={styles.title}>{titles[step - 1]}</Text>

					{step === 1 && (
						<>
							<Text style={styles.subtitle}>Nhập email để nhận mã OTP</Text>

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
								label="Gửi mã OTP"
								onPress={handleSendOtp}
								disabled={isEmailDisabled}
							/>
						</>
					)}

					{step === 2 && (
						<>
							<Text style={styles.subtitle}>
								Mã đã gửi đến {email || "email của bạn"}
							</Text>

							<Text style={styles.instruction}>
								Nhập mã OTP 6 số từ email của bạn
							</Text>

							<View style={styles.otpRow}>
								{otp.map((digit, index) => (
									<TextInput
										key={index}
										ref={(el) => {
											otpRefs.current[index] = el;
										}}
										style={styles.otpInput}
										value={digit}
										keyboardType="number-pad"
										maxLength={1}
										onChangeText={(val) => handleOtpChange(val, index)}
										onKeyPress={({ nativeEvent }) =>
											handleOtpKeyPress(nativeEvent.key, index)
										}
										selectionColor={AUTH_UI.colors.accent}
									/>
								))}
							</View>

							<TouchableOpacity
								style={styles.resendButton}
								onPress={handleResend}
								disabled={secondsLeft > 0}>
								<Text
									style={[
										styles.resendText,
										secondsLeft > 0 && styles.resendTextDisabled,
									]}>
									{resendLabel}
								</Text>
							</TouchableOpacity>

							<Button
								variant="primary"
								label="Xác nhận"
								onPress={() => goToStep(3)}
								disabled={isOtpDisabled}
							/>
						</>
					)}

					{step === 3 && (
						<>
							<Text style={styles.subtitle}>
								Nhập mật khẩu mới cho {email || "tài khoản của bạn"}
							</Text>

							<InputField
								rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
								onRightPress={() => setShowPassword((p) => !p)}
								value={password}
								onChangeText={setPassword}
								secureTextEntry={!showPassword}
								placeholder="Mật khẩu mới"
							/>

							<InputField
								rightIcon={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
								onRightPress={() => setShowConfirmPassword((p) => !p)}
								value={confirmPassword}
								onChangeText={setConfirmPassword}
								secureTextEntry={!showConfirmPassword}
								placeholder="Xác nhận mật khẩu"
							/>

							<View style={styles.rulesBox}>
								{renderRule(rules.minLength, "Ít nhất 8 ký tự")}
								{renderRule(rules.upperLower, "Có chữ hoa và chữ thường")}
								{renderRule(rules.hasNumber, "Có ít nhất 1 chữ số")}
								{renderRule(rules.hasSpecial, "Có ít nhất 1 ký tự đặc biệt")}
								{renderRule(isConfirmMatched, "Mật khẩu xác nhận khớp")}
							</View>

							<Button
								variant="primary"
								label="Đặt lại mật khẩu"
								onPress={handleSubmit}
								disabled={isPasswordDisabled}
							/>
						</>
					)}
				</Animated.View>
			</View>
		</ScreenWrapper>
	);
}

const styles = StyleSheet.create({
	content: {
		flex: 1,
		paddingHorizontal: AUTH_LAYOUT.horizontalPadding,
		paddingTop: vs(16),
		overflow: "hidden",
	},
	backButton: {
		marginBottom: vs(16),
		borderWidth: 1,
		borderColor: AUTH_UI.colors.border,
		borderRadius: ms(10),
	},
	slideContent: { flex: 1 },
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
	instruction: {
		color: AUTH_UI.colors.textPrimary,
		fontSize: ms(14),
		marginBottom: vs(14),
	},
	otpRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: vs(18),
	},
	otpInput: {
		width: s(44),
		height: vs(50),
		borderRadius: ms(AUTH_UI.radius.lg),
		borderWidth: 1,
		borderColor: AUTH_UI.colors.border,
		backgroundColor: AUTH_UI.colors.surface,
		color: AUTH_UI.colors.textPrimary,
		fontSize: ms(20),
		fontWeight: "700",
		textAlign: "center",
	},
	resendButton: {
		alignItems: "center",
		marginBottom: vs(14),
	},
	resendText: {
		color: AUTH_UI.colors.accent,
		fontSize: ms(13),
		fontWeight: "600",
	},
	resendTextDisabled: {
		color: AUTH_UI.colors.textMuted,
	},
	rulesBox: {
		borderRadius: ms(AUTH_UI.radius.lg),
		borderWidth: 1,
		borderColor: AUTH_UI.colors.border,
		backgroundColor: AUTH_UI.colors.surface,
		paddingVertical: vs(10),
		paddingHorizontal: s(12),
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
});
