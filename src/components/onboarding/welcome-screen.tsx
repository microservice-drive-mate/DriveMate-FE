import { ms, s, vs } from "@/utils/responsive";
import { useEffect } from "react";
import {
	Dimensions,
	Pressable,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
	type ColorValue,
} from "react-native";
import Animated, {
	Easing,
	interpolate,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";

import { ScreenWrapper } from "@/components/screen-wrapper";

const SCREEN_WIDTH = Dimensions.get("window").width;

type WelcomeScreenProps = {
	title: string;
	description: string;
	icon: string;
	step: 1 | 2 | 3;
	buttonLabel: string;
	backgroundColor: ColorValue;
	bubbleColor: ColorValue;
	onSkip: () => void;
	onNext: () => void;
};

function PaginationDot({ isActive }: { isActive: boolean }) {
	const progress = useSharedValue(isActive ? 1 : 0);

	useEffect(() => {
		progress.value = withTiming(isActive ? 1 : 0, {
			duration: 260,
			easing: Easing.out(Easing.cubic),
		});
	}, [isActive, progress]);

	const animatedDotStyle = useAnimatedStyle(() => ({
		opacity: interpolate(progress.value, [0, 1], [0.35, 1]),
		transform: [{ scaleX: interpolate(progress.value, [0, 1], [1, 1.6]) }],
	}));

	return (
		<Animated.View
			style={[styles.dot, isActive && styles.dotActive, animatedDotStyle]}
		/>
	);
}

export function WelcomeScreen({
	title,
	description,
	icon,
	step,
	buttonLabel,
	backgroundColor,
	bubbleColor,
	onSkip,
	onNext,
}: WelcomeScreenProps) {
	const entry = useSharedValue(0);

	useEffect(() => {
		entry.value = 0;
		entry.value = withTiming(1, {
			duration: 520,
			easing: Easing.out(Easing.cubic),
		});
	}, [step, entry]);

	const animatedSlideStyle = useAnimatedStyle(() => ({
		transform: [
			{ translateX: interpolate(entry.value, [0, 1], [SCREEN_WIDTH, 0]) },
		],
	}));

	return (
		<ScreenWrapper backgroundColor="#0A0C10">
			<View style={styles.container}>
				<Animated.View
					style={[
						styles.topSection,
						{ backgroundColor },
						animatedSlideStyle,
					]}>
					<View
						style={[
							styles.bubble,
							styles.bubbleTopRight,
							{ backgroundColor: bubbleColor },
						]}
					/>
					<View
						style={[
							styles.bubble,
							styles.bubbleBottomLeft,
							{ backgroundColor: bubbleColor },
						]}
					/>

					<View style={styles.iconCard}>
						<Text style={styles.iconText}>{icon}</Text>
					</View>
				</Animated.View>

				<View style={styles.bottomSection}>
					<View style={styles.textContent}>
						<Animated.Text style={[styles.title, animatedSlideStyle]}>
							{title}
						</Animated.Text>
						<Animated.Text style={[styles.description, animatedSlideStyle]}>
							{description}
						</Animated.Text>

						<View style={styles.pagination}>
							<PaginationDot isActive={step === 1} />
							<PaginationDot isActive={step === 2} />
							<PaginationDot isActive={step === 3} />
						</View>
					</View>

					<View style={styles.bottomActions}>
						<Pressable
							onPress={onSkip}
							style={styles.skipButton}>
							<Text style={styles.skipText}>Bỏ qua</Text>
						</Pressable>

						<TouchableOpacity
							activeOpacity={0.9}
							style={styles.nextButton}
							onPress={onNext}>
							<Text style={styles.nextText}>{buttonLabel}</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		</ScreenWrapper>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#0A0C10",
	},
	topSection: {
		flex: 0.64,
		borderBottomLeftRadius: ms(26),
		borderBottomRightRadius: ms(26),
		marginHorizontal: s(16),
		marginTop: vs(8),
		alignItems: "center",
		justifyContent: "center",
		overflow: "hidden",
	},
	bubble: {
		position: "absolute",
		width: s(128),
		height: s(128),
		borderRadius: 999,
		opacity: 0.24,
	},
	bubbleTopRight: {
		top: vs(-24),
		right: s(-22),
	},
	bubbleBottomLeft: {
		bottom: vs(-44),
		left: s(-22),
	},
	iconCard: {
		width: s(92),
		height: s(92),
		borderRadius: ms(22),
		backgroundColor: "#F5EFCF",
		alignItems: "center",
		justifyContent: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 7 },
		shadowOpacity: 0.22,
		shadowRadius: 12,
		elevation: 6,
	},
	iconText: {
		fontSize: ms(38),
	},
	bottomSection: {
		flex: 0.36,
		paddingTop: vs(24),
		paddingHorizontal: s(24),
		paddingBottom: vs(16),
		justifyContent: "space-between",
	},
	textContent: {
		flexShrink: 1,
	},
	title: {
		color: "#F5F7FA",
		fontSize: ms(35),
		lineHeight: ms(40),
		fontWeight: "700",
		marginBottom: vs(12),
	},
	description: {
		color: "#C6C8CD",
		fontSize: ms(22),
		lineHeight: ms(30),
		marginBottom: vs(22),
		paddingRight: s(6),
	},
	pagination: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		gap: s(9),
		marginBottom: vs(22),
	},
	dot: {
		width: s(8),
		height: s(8),
		borderRadius: ms(6),
		backgroundColor: "#5F636B",
	},
	dotActive: {
		backgroundColor: "#F2C745",
	},
	bottomActions: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	skipButton: {
		paddingVertical: vs(10),
		paddingHorizontal: s(4),
	},
	skipText: {
		color: "#AEB3BA",
		fontSize: ms(16),
		fontWeight: "500",
	},
	nextButton: {
		flex: 1,
		backgroundColor: "#F2C745",
		borderRadius: ms(14),
		alignItems: "center",
		justifyContent: "center",
		minHeight: vs(52),
		marginLeft: s(24),
		paddingHorizontal: s(12),
	},
	nextText: {
		color: "#21262D",
		fontSize: ms(18),
		fontWeight: "700",
	},
});
