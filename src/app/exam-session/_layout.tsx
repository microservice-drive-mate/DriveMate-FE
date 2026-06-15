import { Stack } from "expo-router";

export default function ExamSessionLayout() {
	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen
				name="take/[id]"
				options={{ headerShown: false }}
			/>
<Stack.Screen
				name="result/[id]"
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name="review/[id]"
				options={{ headerShown: false }}
			/>
		</Stack>
	);
}
