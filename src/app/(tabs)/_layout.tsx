import { AUTH_UI } from "@/constants/auth-ui";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { View } from "react-native";

export default function TabsLayout() {
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
						<Ionicons name="home" size={20} color={color} />
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
							<Ionicons name="document-text" size={20} color={color} />
							<View
								style={{
									position: "absolute",
									top: -2,
									right: -4,
									width: 8,
									height: 8,
									borderRadius: 4,
									backgroundColor: AUTH_UI.colors.accent,
								}}
							/>
						</View>
					),
				}}
			/>

			<Tabs.Screen
				name="pratice"
				options={{
					headerShown: false,
					title: "Luyện tập",
					tabBarIcon: ({ color }) => (
						<Ionicons name="map-outline" size={20} color={color} />
					),
				}}
			/>

			<Tabs.Screen
				name="history"
				options={{
					headerShown: false,
					title: "Lịch sử",
					tabBarIcon: ({ color }) => (
						<Ionicons name="time-outline" size={20} color={color} />
					),
				}}
			/>

			<Tabs.Screen
				name="profile"
				options={{
					headerShown: false,
					title: "Tôi",
					tabBarIcon: ({ color }) => (
						<Ionicons name="person-outline" size={20} color={color} />
					),
				}}
			/>
		</Tabs>
	);
}
