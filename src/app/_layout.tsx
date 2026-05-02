import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import "react-native-reanimated";

import { useAuthStore } from "@/store/auth.store";
import { useShallow } from "zustand/react/shallow";

export default function RootLayout() {
	const router = useRouter();
	const { initialize, isLoading, hasSeenOnboarding } = useAuthStore(
		useShallow((state) => ({
			initialize: state.initialize,
			isLoading: state.isLoading,
			hasSeenOnboarding: state.hasSeenOnboarding,
		})),
	);

	useEffect(() => {
		initialize();
	}, [initialize]);

	useEffect(() => {
		if (!isLoading && !hasSeenOnboarding) {
			router.replace("/(onboarding)");
		}
	}, [isLoading, hasSeenOnboarding]);

	if (isLoading) {
		return null;
	}

	return (
		<Stack>
			<Stack.Screen
				name="(onboarding)"
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name="(auth)"
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name="(tabs)"
				options={{ headerShown: false }}
			/>
		</Stack>
	);
}
