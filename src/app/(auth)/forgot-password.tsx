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

import { ScreenWrapper } from "@/components/screen-wrapper";
import Animated, {
	Easing,
	interpolate,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";

import { StepProgressBar } from "@/components/ui/StepProgressBar";
import { AUTH_LAYOUT, AUTH_UI } from "@/constants/auth-ui";

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

	// Step 1
	const [email, setEmail] = useState("");

	// Step 2
	const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
	const [secondsLeft, setSecondsLeft] = useState(OTP_SECONDS);
	const otpRefs = useRef<Array<TextInput | null>>([]);

	// Step 3
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	// Slide animation
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

	// OTP countdown
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

	// Step 1
	const emailError = useMemo(() => {
		if (!email) return "";
		return EMAIL_REGEX.test(email.trim()) ? "" : "Email không hợp lệ";
	}, [email]);
	const isEmailDisabled = !email.trim() || !!emailError;

	const handleSendOtp = () => {
		if (isEmailDisabled) {
			Alert.alert("Thông báo", "Vui lòng nhập email hợp lệ");
			return;
		}
		goToStep(2);
	};

	// Step 2
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

	// Step 3
	const rules = useMemo(() => checkPasswordRules(password), [password]);
	const isRulePassed = Object.values(rules).every(Boolean);
	const isConfirmMatched =
		confirmPassword.length > 0 && password === confirmPassword;
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
				size={14}
				color={
					isPassed ? AUTH_UI.colors.success : AUTH_UI.colors.textMuted
				}
			/>
			<Text style={[styles.ruleText, isPassed && styles.ruleTextPassed]}>
				{label}
			</Text>
		</View>
	);

	const titles = ["Quên mật khẩu", "Quên mật khẩu", "Tạo mật khẩu mới"];

	return (
		<ScreenWrapper
			backgroundColor={AUTH_UI.colors.background}
			keyboard>
			<View style={styles.content}>
				<TouchableOpacity
					style={styles.backButton}
					onPress={handleBack}>
					<Ionicons
						name="arrow-back"
						size={18}
						color={AUTH_UI.colors.textPrimary}
					/>
				</TouchableOpacity>

				<StepProgressBar currentStep={step} />

				<Animated.View style={[styles.slideContent, animatedStyle]}>
					<Text style={styles.title}>{titles[step - 1]}</Text>

					{step === 1 && (
						<>
							<Text style={styles.subtitle}>
								Nhập email để nhận mã OTP
							</Text>

							<View style={styles.inputRow}>
								<Ionicons
									name="mail-outline"
									size={18}
									color={AUTH_UI.colors.textMuted}
								/>
								<TextInput
									style={[styles.input, styles.inputWithIcon]}
									value={email}
									onChangeText={setEmail}
									autoCapitalize="none"
									keyboardType="email-address"
									placeholder="Email của bạn"
									placeholderTextColor={
										AUTH_UI.colors.textMuted
									}
								/>
							</View>

							{!!emailError && (
								<Text style={styles.errorText}>
									{emailError}
								</Text>
							)}

							<TouchableOpacity
								style={[
									styles.primaryButton,
									isEmailDisabled &&
										styles.primaryButtonDisabled,
								]}
								onPress={handleSendOtp}
								disabled={isEmailDisabled}>
								<Text style={styles.primaryButtonText}>
									Gửi mã OTP
								</Text>
							</TouchableOpacity>
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
										onChangeText={(val) =>
											handleOtpChange(val, index)
										}
										onKeyPress={({ nativeEvent }) =>
											handleOtpKeyPress(
												nativeEvent.key,
												index,
											)
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
										secondsLeft > 0 &&
											styles.resendTextDisabled,
									]}>
									{resendLabel}
								</Text>
							</TouchableOpacity>

							<TouchableOpacity
								style={[
									styles.primaryButton,
									isOtpDisabled &&
										styles.primaryButtonDisabled,
								]}
								onPress={() => goToStep(3)}
								disabled={isOtpDisabled}>
								<Text style={styles.primaryButtonText}>
									Xác nhận
								</Text>
							</TouchableOpacity>
						</>
					)}

					{step === 3 && (
						<>
							<Text style={styles.subtitle}>
								Nhập mật khẩu mới cho{" "}
								{email || "tài khoản của bạn"}
							</Text>

							<View style={styles.inputRow}>
								<TextInput
									style={styles.input}
									value={password}
									onChangeText={setPassword}
									secureTextEntry={!showPassword}
									placeholder="Mật khẩu mới"
									placeholderTextColor={
										AUTH_UI.colors.textMuted
									}
								/>
								<TouchableOpacity
									onPress={() =>
										setShowPassword((prev) => !prev)
									}>
									<Ionicons
										name={
											showPassword
												? "eye-off-outline"
												: "eye-outline"
										}
										size={18}
										color={AUTH_UI.colors.textMuted}
									/>
								</TouchableOpacity>
							</View>

							<View style={styles.inputRow}>
								<TextInput
									style={styles.input}
									value={confirmPassword}
									onChangeText={setConfirmPassword}
									secureTextEntry={!showConfirmPassword}
									placeholder="Xác nhận mật khẩu"
									placeholderTextColor={
										AUTH_UI.colors.textMuted
									}
								/>
								<TouchableOpacity
									onPress={() =>
										setShowConfirmPassword((prev) => !prev)
									}>
									<Ionicons
										name={
											showConfirmPassword
												? "eye-off-outline"
												: "eye-outline"
										}
										size={18}
										color={AUTH_UI.colors.textMuted}
									/>
								</TouchableOpacity>
							</View>

							<View style={styles.rulesBox}>
								{renderRule(rules.minLength, "Ít nhất 8 ký tự")}
								{renderRule(
									rules.upperLower,
									"Có chữ hoa và chữ thường",
								)}
								{renderRule(
									rules.hasNumber,
									"Có ít nhất 1 chữ số",
								)}
								{renderRule(
									rules.hasSpecial,
									"Có ít nhất 1 ký tự đặc biệt",
								)}
								{renderRule(
									isConfirmMatched,
									"Mật khẩu xác nhận khớp",
								)}
							</View>

							<TouchableOpacity
								style={[
									styles.primaryButton,
									isPasswordDisabled &&
										styles.primaryButtonDisabled,
								]}
								onPress={handleSubmit}
								disabled={isPasswordDisabled}>
								<Text style={styles.primaryButtonText}>
									Đặt lại mật khẩu
								</Text>
							</TouchableOpacity>
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
		paddingTop: 16,
		overflow: "hidden",
	},
	backButton: {
		width: 34,
		height: 34,
		borderRadius: 10,
		backgroundColor: AUTH_UI.colors.surface,
		borderWidth: 1,
		borderColor: AUTH_UI.colors.border,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 16,
	},
	slideContent: {
		flex: 1,
	},
	title: {
		color: AUTH_UI.colors.textPrimary,
		fontSize: 24,
		fontWeight: "700",
		marginBottom: 6,
	},
	subtitle: {
		color: AUTH_UI.colors.textSecondary,
		fontSize: 13,
		marginBottom: 18,
	},
	inputRow: {
		height: 50,
		borderRadius: AUTH_UI.radius.lg,
		borderWidth: 1,
		borderColor: AUTH_UI.colors.border,
		backgroundColor: AUTH_UI.colors.surface,
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 14,
		marginBottom: 10,
	},
	input: {
		flex: 1,
		color: AUTH_UI.colors.textPrimary,
		fontSize: 15,
	},
	inputWithIcon: {
		marginLeft: 10,
	},
	errorText: {
		color: AUTH_UI.colors.danger,
		fontSize: 12,
		marginBottom: 10,
	},
	instruction: {
		color: AUTH_UI.colors.textPrimary,
		fontSize: 14,
		marginBottom: 14,
	},
	otpRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 18,
	},
	otpInput: {
		width: 44,
		height: 50,
		borderRadius: AUTH_UI.radius.lg,
		borderWidth: 1,
		borderColor: AUTH_UI.colors.border,
		backgroundColor: AUTH_UI.colors.surface,
		color: AUTH_UI.colors.textPrimary,
		fontSize: 20,
		fontWeight: "700",
		textAlign: "center",
	},
	resendButton: {
		alignItems: "center",
		marginBottom: 14,
	},
	resendText: {
		color: AUTH_UI.colors.accent,
		fontSize: 13,
		fontWeight: "600",
	},
	resendTextDisabled: {
		color: AUTH_UI.colors.textMuted,
	},
	rulesBox: {
		borderRadius: AUTH_UI.radius.lg,
		borderWidth: 1,
		borderColor: AUTH_UI.colors.border,
		backgroundColor: AUTH_UI.colors.surface,
		paddingVertical: 10,
		paddingHorizontal: 12,
		marginBottom: 14,
	},
	ruleRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 6,
	},
	ruleText: {
		color: AUTH_UI.colors.textMuted,
		fontSize: 12,
		marginLeft: 8,
	},
	ruleTextPassed: {
		color: AUTH_UI.colors.success,
	},
	primaryButton: {
		height: 50,
		borderRadius: AUTH_UI.radius.lg,
		backgroundColor: AUTH_UI.colors.accent,
		alignItems: "center",
		justifyContent: "center",
	},
	primaryButtonDisabled: {
		backgroundColor: AUTH_UI.colors.disabled,
	},
	primaryButtonText: {
		color: AUTH_UI.colors.accentText,
		fontSize: 15,
		fontWeight: "700",
	},
});
