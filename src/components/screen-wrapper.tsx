import { ReactNode } from "react";
import {
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	StyleProp,
	StyleSheet,
	ViewStyle,
} from "react-native";
import { Edge, SafeAreaView } from "react-native-safe-area-context";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";

type Props = {
	children: ReactNode;
	style?: StyleProp<ViewStyle>;
	contentStyle?: StyleProp<ViewStyle>;
	backgroundColor?: string;
	scroll?: boolean;
	keyboard?: boolean;
	edges?: Edge[];
};

export function ScreenWrapper({
	children,
	style,
	contentStyle,
	backgroundColor,
	scroll = false,
	keyboard = false,
	edges = ["top", "bottom"],
}: Props) {
	const colorScheme = useColorScheme();
	const bg = backgroundColor ?? Colors[colorScheme].background;

	const content = scroll ? (
		<ScrollView
			style={styles.fill}
			contentContainerStyle={[styles.scrollContent, contentStyle]}
			keyboardShouldPersistTaps="handled"
			showsVerticalScrollIndicator={false}>
			{children}
		</ScrollView>
	) : (
		children
	);

	return (
		<SafeAreaView style={[styles.fill, { backgroundColor: bg }, style]} edges={edges}>
			{keyboard ? (
				<KeyboardAvoidingView
					style={[styles.fill, !scroll && contentStyle]}
					behavior={Platform.OS === "ios" ? "padding" : undefined}>
					{content}
				</KeyboardAvoidingView>
			) : (
				content
			)}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	fill: { flex: 1 },
	scrollContent: { flexGrow: 1 },
});
