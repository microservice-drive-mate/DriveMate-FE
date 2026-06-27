import { AsyncContent } from "@/components/common/AsyncContent";
import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { CourseCard } from "@/components/course/CourseCard";
import { ScreenHeader } from "@/components/layout";
import { ScreenWrapper } from "@/components/screen-wrapper";
import { AUTH_UI } from "@/constants/auth-ui";
import type { EnrolledCourse } from "@/models/course.model";
import { courseService } from "@/services/course.service";
import { getErrorMessage } from "@/utils/error";
import { s, vs } from "@/utils/responsive";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, StyleSheet } from "react-native";

export default function MyCoursesScreen() {
	const router = useRouter();
	const [courses, setCourses] = useState<EnrolledCourse[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const load = useCallback(async () => {
		setIsLoading(true);
		setError(null);

		const result = await courseService.getMyEnrollments();
		if (!result.success) {
			setError(getErrorMessage(result.code, result.error));
			setIsLoading(false);
			return;
		}

		// Enrollment chỉ có courseId nên cần enrich bằng course detail (cache-aside ở backend).
		const enriched = await Promise.all(
			result.data.items.map(async (enrollment) => {
				const detail = await courseService.getCourseDetail(enrollment.courseId);
				return detail.success ? { enrollment, course: detail.data } : null;
			}),
		);

		setCourses(enriched.filter((c): c is EnrolledCourse => c !== null));
		setIsLoading(false);
	}, []);

	useFocusEffect(
		useCallback(() => {
			load();
		}, [load]),
	);

	return (
		<ScreenWrapper backgroundColor={AUTH_UI.colors.background} scroll={false}>
			<ScreenHeader
				title="Khóa học của tôi"
				subtitle="Các khóa học bạn đã đăng ký"
				onBack={() => router.back()}
				centered
			/>

			<AsyncContent loading={isLoading} error={error} onRetry={load}>
				<FlatList
					data={courses}
					keyExtractor={(item) => item.enrollment.id}
					renderItem={({ item }) => (
						<CourseCard
							item={item}
							onPress={() =>
								router.push({
									pathname: "/courses/[id]",
									params: {
										id: item.course.id,
										enrollmentId: item.enrollment.id,
										progress: String(item.enrollment.progress),
										status: item.enrollment.status,
									},
								})
							}
						/>
					)}
					contentContainerStyle={styles.listContent}
					showsVerticalScrollIndicator={false}
					ListEmptyComponent={
						<EmptyState
							icon="school-outline"
							title="Bạn chưa đăng ký khóa học nào"
							subtitle="Chọn khóa học phù hợp với hạng bằng của bạn để bắt đầu."
							action={
								<Button
									label="Đăng ký khóa học"
									onPress={() => router.push("/enroll")}
									style={styles.enrollBtn}
								/>
							}
						/>
					}
				/>
			</AsyncContent>
		</ScreenWrapper>
	);
}

const styles = StyleSheet.create({
	listContent: {
		flexGrow: 1,
		paddingHorizontal: s(16),
		paddingTop: vs(8),
		paddingBottom: vs(24),
		gap: vs(12),
	},
	enrollBtn: {
		marginTop: vs(12),
		paddingHorizontal: s(28),
	},
});
