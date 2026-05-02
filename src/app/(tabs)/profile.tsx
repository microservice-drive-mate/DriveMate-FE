import { ScreenWrapper } from "@/components/screen-wrapper";
import { AUTH_UI } from "@/constants/auth-ui";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function Me() {
	return (
		<ScreenWrapper backgroundColor={AUTH_UI.colors.background}>
			<View style={styles.center}>
				<Text style={styles.text}>Tôi (placeholder)</Text>
			</View>
		</ScreenWrapper>
	);
}

const styles = StyleSheet.create({
	center: { flex: 1, alignItems: "center", justifyContent: "center" },
	text: { color: AUTH_UI.colors.textPrimary },
});
