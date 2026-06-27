import { AUTH_UI } from "@/constants/auth-ui";
import { UserRole } from "@/models/user.model";
import { hasActiveEnrollment } from "@/services/course.service";
import { useAuthStore } from "@/store/auth.store";
import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { View } from "react-native";

export default function TabsLayout() {
	const router = useRouter();
	const [checking, setChecking] = useState(true);

	// Gate khi mở lại app (đã có token, bỏ qua login): student bắt buộc phải có khóa.
	useEffect(() => {
		let active = true;
		(async () => {
			let user = useAuthStore.getState().user;
			if (!user) {
				await useAuthStore.getState().fetchUser();
				user = useAuthStore.getState().user;
			}
			if (!active) return;
			if (user?.role === UserRole.STUDENT && !(await hasActiveEnrollment())) {
				router.replace("/enroll?mandatory=1");
				return; // giữ checking=true để không nháy tab trước khi điều hướng
			}
			if (active) setChecking(false);
		})();
		return () => {
			active = false;
		};
	}, [router]);

	if (checking) return null;

	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarActiveTintColor: AUTH_UI.colors.accent,
				tabBarInactiveTintColor: AUTH_UI.colors.textMuted,
				tabBarStyle: {
					backgroundColor: AUTH_UI.colors.surface,
					borderTopWidth: 0,
					height: 78,
					paddingBottom: 12,
					paddingTop: 8,
				},
				tabBarLabelStyle: { fontSize: 12 },
			}}>
			<Tabs.Screen
				name="index"
				options={{
					headerShown: false,
					title: "Trang chủ",
					tabBarIcon: ({ color }) => (
						<Ionicons
							name="home"
							size={20}
							color={color}
						/>
					),
				}}
			/>

			<Tabs.Screen
				name="exam"
				options={{
					headerShown: false,
					title: "Đề thi",
					tabBarIcon: ({ color }) => (
						<View style={{ position: "relative" }}>
							<Ionicons
								name="document-text"
								size={20}
								color={color}
							/>
						</View>
					),
				}}
			/>

			<Tabs.Screen
				name="practice"
				options={{
					headerShown: false,
					title: "Luyện tập",
					tabBarIcon: ({ color }) => (
						<Ionicons
							name="map-outline"
							size={20}
							color={color}
						/>
					),
				}}
			/>

			<Tabs.Screen
				name="history"
				options={{
					headerShown: false,
					title: "Lịch sử",
					tabBarIcon: ({ color }) => (
						<Ionicons
							name="time-outline"
							size={20}
							color={color}
						/>
					),
				}}
			/>

			<Tabs.Screen
				name="profile"
				options={{
					headerShown: false,
					title: "Tôi",
					tabBarIcon: ({ color }) => (
						<Ionicons
							name="person-outline"
							size={20}
							color={color}
						/>
					),
				}}
			/>
		</Tabs>
	);
}
