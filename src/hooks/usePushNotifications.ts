import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { useAuthStore } from '@/store/auth.store';
import { deviceTokenService } from '@/services/device-token.service';

export function usePushNotifications() {
	const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
	const tokenRef = useRef<string | null>(null);

	useEffect(() => {
		if (!isAuthenticated) {
			if (tokenRef.current) {
				deviceTokenService.unregister(tokenRef.current);
				tokenRef.current = null;
			}
			return;
		}

		let unsubscribeRefresh: (() => void) | undefined;

		const setup = async () => {
			const authStatus = await messaging().requestPermission();
			const granted =
				authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
				authStatus === messaging.AuthorizationStatus.PROVISIONAL;

			if (!granted) return;

			const token = await messaging().getToken();
			tokenRef.current = token;
			await deviceTokenService.register(token, Platform.OS as 'ios' | 'android');

			unsubscribeRefresh = messaging().onTokenRefresh(async (newToken) => {
				tokenRef.current = newToken;
				await deviceTokenService.register(newToken, Platform.OS as 'ios' | 'android');
			});
		};

		setup();

		return () => {
			unsubscribeRefresh?.();
		};
	}, [isAuthenticated]);
}
