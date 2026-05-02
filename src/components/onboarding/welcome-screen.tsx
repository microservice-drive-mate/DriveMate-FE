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
		borderBottomLeftRadius: 26,
		borderBottomRightRadius: 26,
		marginHorizontal: 16,
		marginTop: 8,
		alignItems: "center",
		justifyContent: "center",
		overflow: "hidden",
	},
	bubble: {
		position: "absolute",
		width: 128,
		height: 128,
		borderRadius: 999,
		opacity: 0.24,
	},
	bubbleTopRight: {
		top: -24,
		right: -22,
	},
	bubbleBottomLeft: {
		bottom: -44,
		left: -22,
	},
	iconCard: {
		width: 92,
		height: 92,
		borderRadius: 22,
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
		fontSize: 38,
	},
	bottomSection: {
		flex: 0.36,
		paddingTop: 24,
		paddingHorizontal: 24,
		paddingBottom: 16,
	},
	title: {
		color: "#F5F7FA",
		fontSize: 35,
		lineHeight: 40,
		fontWeight: "700",
		marginBottom: 12,
	},
	description: {
		color: "#C6C8CD",
		fontSize: 22,
		lineHeight: 30,
		marginBottom: 22,
		paddingRight: 6,
	},
	pagination: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		gap: 9,
		marginBottom: 22,
	},
	dot: {
		width: 8,
		height: 8,
		borderRadius: 6,
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
		paddingVertical: 10,
		paddingHorizontal: 4,
	},
	skipText: {
		color: "#AEB3BA",
		fontSize: 16,
		fontWeight: "500",
	},
	nextButton: {
		flex: 1,
		backgroundColor: "#F2C745",
		borderRadius: 14,
		alignItems: "center",
		justifyContent: "center",
		minHeight: 52,
		marginLeft: 24,
		paddingHorizontal: 12,
	},
	nextText: {
		color: "#21262D",
		fontSize: 18,
		fontWeight: "700",
	},
});
