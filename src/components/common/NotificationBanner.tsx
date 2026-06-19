import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { type BannerMessage, useInAppBannerStore } from '@/store/in-app-banner.store';
import { colors, radius, typography } from '@/theme';
import { ms, s, vs } from '@/utils/responsive';

export function NotificationBanner() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const message = useInAppBannerStore((state) => state.message);
	const hide = useInAppBannerStore((state) => state.hide);

	const anim = useRef(new Animated.Value(0)).current;
	const [mounted, setMounted] = useState(false);
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	// Keep last known message so banner content doesn't blank out during dismiss animation
	const displayRef = useRef<BannerMessage | null>(null);
	if (message) displayRef.current = message;

	const dismiss = useCallback(() => {
		if (timerRef.current) clearTimeout(timerRef.current);
		Animated.timing(anim, {
			toValue: 0,
			duration: 250,
			useNativeDriver: true,
		}).start(() => {
			setMounted(false);
			hide();
		});
	}, [anim, hide]);

	useEffect(() => {
		if (!message) return;

		setMounted(true);
		if (timerRef.current) clearTimeout(timerRef.current);

		Animated.timing(anim, {
			toValue: 1,
			duration: 300,
			useNativeDriver: true,
		}).start();

		timerRef.current = setTimeout(dismiss, 4000);

		return () => {
			if (timerRef.current) clearTimeout(timerRef.current);
		};
	}, [message, anim, dismiss]);

	const handleTap = useCallback(() => {
		dismiss();
		const id = displayRef.current?.data?.id as string | undefined;
		router.push(id ? `/notifications/${id}` : '/notifications');
	}, [dismiss, router]);

	if (!mounted) return null;

	return (
		<Animated.View
			style={[
				styles.container,
				{
					top: insets.top + vs(8),
					opacity: anim,
					transform: [
						{
							translateY: anim.interpolate({
								inputRange: [0, 1],
								outputRange: [-vs(120), 0],
							}),
						},
					],
				},
			]}>
			<TouchableOpacity
				style={styles.inner}
				onPress={handleTap}
				activeOpacity={0.85}>
				<View style={styles.iconWrap}>
					<Ionicons name="notifications" size={ms(18)} color={colors.accent} />
				</View>
				<View style={styles.content}>
					<Text style={styles.title} numberOfLines={1}>
						{displayRef.current?.title}
					</Text>
					{!!displayRef.current?.body && (
						<Text style={styles.body} numberOfLines={2}>
							{displayRef.current.body}
						</Text>
					)}
				</View>
			</TouchableOpacity>
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		left: s(16),
		right: s(16),
		zIndex: 9999,
		borderRadius: ms(radius.xl),
		backgroundColor: colors.surface,
		borderWidth: 1,
		borderColor: colors.border,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: ms(4) },
		shadowOpacity: 0.3,
		shadowRadius: ms(8),
		elevation: 8,
	},
	inner: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: s(14),
		gap: s(12),
	},
	iconWrap: {
		width: ms(36),
		height: ms(36),
		borderRadius: ms(18),
		backgroundColor: colors.surfaceMuted,
		alignItems: 'center',
		justifyContent: 'center',
	},
	content: {
		flex: 1,
		gap: vs(2),
	},
	title: {
		color: colors.textPrimary,
		fontSize: typography.fontSize.label,
		fontWeight: typography.fontWeight.semibold,
	},
	body: {
		color: colors.textSecondary,
		fontSize: typography.fontSize.caption,
	},
});
