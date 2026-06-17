import { AsyncContent } from "@/components/common/AsyncContent";
import { Button } from "@/components/common/Button";
import { ScreenHeader } from "@/components/layout";
import { ScreenWrapper } from "@/components/screen-wrapper";
import { AUTH_UI } from "@/constants/auth-ui";
import type { Lesson } from "@/models/course.model";
import { courseService } from "@/services/course.service";
import { getErrorMessage } from "@/utils/error";
import { ms, s, vs } from "@/utils/responsive";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";

export default function LessonDetailScreen() {
	const { lessonId, courseId, enrollmentId } = useLocalSearchParams<{
		lessonId: string;
		courseId: string;
		enrollmentId: string;
	}>();
	const router = useRouter();

	const [lesson, setLesson] = useState<Lesson | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isCompleting, setIsCompleting] = useState(false);

	const load = useCallback(async () => {
		if (!courseId || !lessonId) return;
		setIsLoading(true);
		setError(null);
		const result = await courseService.getLesson(courseId, lessonId);
		if (result.success) {
			setLesson(result.data);
		} else {
			setError(getErrorMessage(result.code, result.error));
		}
		setIsLoading(false);
	}, [courseId, lessonId]);

	useEffect(() => {
		load();
	}, [load]);

	const handleComplete = async () => {
		if (!enrollmentId || !lessonId || isCompleting) return;
		setIsCompleting(true);
		const result = await courseService.completeLesson(enrollmentId, lessonId);
		setIsCompleting(false);

		if (result.success) {
			Alert.alert(
				"Đã hoàn thành",
				`Tiến độ của bạn hiện là ${result.data.progress}%.`,
				[{ text: "OK", onPress: () => router.back() }],
			);
		} else {
			Alert.alert("Không thể cập nhật", getErrorMessage(result.code, result.error));
		}
	};

	return (
		<ScreenWrapper backgroundColor={AUTH_UI.colors.background} scroll={false}>
			<ScreenHeader
				title={lesson ? `Bài ${lesson.order}` : "Bài học"}
				onBack={() => router.back()}
				centered
			/>

			<AsyncContent loading={isLoading} error={error} onRetry={load}>
				{lesson && (
					<View style={styles.container}>
						<ScrollView
							style={styles.scroll}
							contentContainerStyle={styles.content}
							showsVerticalScrollIndicator={false}>
							<Text style={styles.title}>{lesson.title}</Text>
							<Text style={styles.body}>{lesson.content}</Text>
						</ScrollView>

						<View style={styles.footer}>
							<Button
								variant="primary"
								icon="checkmark-circle-outline"
								label="Đánh dấu hoàn thành"
								onPress={handleComplete}
								loading={isCompleting}
							/>
						</View>
					</View>
				)}
			</AsyncContent>
		</ScreenWrapper>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	scroll: {
		flex: 1,
	},
	content: {
		paddingHorizontal: s(16),
		paddingTop: vs(8),
		paddingBottom: vs(24),
		gap: vs(12),
	},
	title: {
		fontSize: ms(20),
		fontWeight: "800",
		color: AUTH_UI.colors.textPrimary,
		lineHeight: ms(28),
	},
	body: {
		fontSize: ms(15),
		lineHeight: ms(23),
		color: AUTH_UI.colors.textSecondary,
	},
	footer: {
		paddingHorizontal: s(16),
		paddingTop: vs(8),
		paddingBottom: vs(8),
		borderTopWidth: 1,
		borderTopColor: AUTH_UI.colors.border,
	},
});
