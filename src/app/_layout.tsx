import { Stack, useRootNavigationState, useRouter } from "expo-router";
import { useEffect } from "react";
import "react-native-reanimated";
import messaging from "@react-native-firebase/messaging";

import { apiService } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { NotificationBanner } from "@/components/common/NotificationBanner";
import { useInAppBannerStore } from "@/store/in-app-banner.store";
import { useShallow } from "zustand/react/shallow";

messaging().setBackgroundMessageHandler(async () => {});

export default function RootLayout() {
	const router = useRouter();
	const rootNavState = useRootNavigationState();
	const { initialize, isLoading, hasSeenOnboarding } = useAuthStore(
		useShallow((state) => ({
			initialize: state.initialize,
			isLoading: state.isLoading,
			hasSeenOnboarding: state.hasSeenOnboarding,
		})),
	);

	usePushNotifications();

	useEffect(() => {
		initialize();
	}, [initialize]);

	useEffect(() => {
		apiService.setLogoutCallback(() => {
			useAuthStore.getState().clearAuth();
		});
	}, []);

	useEffect(() => {
		if (!rootNavState?.key) return;
		if (!isLoading && !hasSeenOnboarding) {
			router.replace("/(onboarding)");
		}
	}, [hasSeenOnboarding, isLoading, router, rootNavState?.key]);

	// Show banner when FCM message arrives while app is in foreground
	useEffect(() => {
		return messaging().onMessage(async (remoteMessage) => {
			const { title, body } = remoteMessage.notification ?? {};
			if (!title) return;
			useInAppBannerStore.getState().show({
				title,
				body: body ?? '',
				data: remoteMessage.data,
			});
		});
	}, []);

	// Navigate when user taps notification while app is in background
	useEffect(() => {
		return messaging().onNotificationOpenedApp((remoteMessage) => {
			const id = remoteMessage.data?.id as string | undefined;
			router.push(id ? `/notifications/${id}` : "/notifications");
		});
	}, [router]);

	// Navigate when user taps notification that launched the app from quit state
	useEffect(() => {
		messaging()
			.getInitialNotification()
			.then((remoteMessage) => {
				if (!remoteMessage) return;
				const id = remoteMessage.data?.id as string | undefined;
				router.push(id ? `/notifications/${id}` : "/notifications");
			});
	}, []);

	if (isLoading) {
		return null;
	}

	return (
		<>
			<NotificationBanner />
			<Stack screenOptions={{ headerShown: false }}>
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
				<Stack.Screen
					name="enroll"
					options={{ headerShown: false, gestureEnabled: false }}
				/>
				<Stack.Screen
					name="notifications"
					options={{ headerShown: false }}
				/>
				<Stack.Screen
					name="exam-session"
					options={{ headerShown: false }}
				/>
			</Stack>
		</>
	);
}
