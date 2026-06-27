import { AsyncContent } from "@/components/common/AsyncContent";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Divider } from "@/components/common/Divider";
import { ProgressBar } from "@/components/common/ProgressBar";
import { ScreenHeader } from "@/components/layout";
import { ScreenWrapper } from "@/components/screen-wrapper";
import { AUTH_UI } from "@/constants/auth-ui";
import type { Course, CourseMaterial, EnrollmentStatus, Lesson } from "@/models/course.model";
import { courseService } from "@/services/course.service";
import { getErrorMessage } from "@/utils/error";
import { ms, s, vs } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
	Alert,
	Linking,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

const STATUS_LABEL: Record<string, string> = {
	DRAFT: "Bản nháp",
	ACTIVE: "Đang mở",
	ARCHIVED: "Đã lưu trữ",
};

export default function CourseDetailScreen() {
	const {
		id,
		enrollmentId,
		progress: progressParam,
		status: statusParam,
		enrollable,
		mandatory,
	} = useLocalSearchParams<{
		id: string;
		enrollmentId: string;
		progress: string;
		status: string;
		enrollable: string;
		mandatory: string;
	}>();
	const router = useRouter();

	const isEnrolled = !!enrollmentId;
	const canEnroll = enrollable === "1" && !isEnrolled;

	const [course, setCourse] = useState<Course | null>(null);
	const [progress, setProgress] = useState(Number(progressParam) || 0);
	const [enrollmentStatus, setEnrollmentStatus] = useState<EnrollmentStatus | null>(
		(statusParam as EnrollmentStatus) || null,
	);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [actionLoading, setActionLoading] = useState(false);

	const isDropped = enrollmentStatus === "DROPPED";

	const load = useCallback(async () => {
		if (!id) return;
		setIsLoading(true);
		setError(null);
		const result = await courseService.getCourseDetail(id);
		if (result.success) {
			setCourse(result.data);
		} else {
			setError(getErrorMessage(result.code, result.error));
		}
		setIsLoading(false);
	}, [id]);

	useEffect(() => {
		load();
	}, [load]);

	// Làm mới tiến độ mỗi khi quay lại màn này (vd sau khi hoàn thành bài học).
	useFocusEffect(
		useCallback(() => {
			if (!enrollmentId) return;
			courseService.getEnrollment(enrollmentId).then((result) => {
				if (result.success) {
					setProgress(result.data.progress);
					setEnrollmentStatus(result.data.status);
				}
			});
		}, [enrollmentId]),
	);

	const lessons = [...(course?.lessons ?? [])].sort((a, b) => a.order - b.order);
	const requirement = course?.requirement;

	const openLesson = (lesson: Lesson) => {
		router.push({
			pathname: "/courses/lesson/[lessonId]",
			params: { lessonId: lesson.id, courseId: id, enrollmentId },
		});
	};

	const openMaterial = (material: CourseMaterial) => {
		if (material.fileUrl) Linking.openURL(material.fileUrl);
	};

	const handleEnroll = () => {
		if (!id || actionLoading) return;
		Alert.alert(
			"Đăng ký khóa học",
			`Bạn có chắc muốn đăng ký khóa "${course?.title ?? ""}"?`,
			[
				{ text: "Hủy", style: "cancel" },
				{
					text: "Đăng ký",
					onPress: async () => {
						setActionLoading(true);
						const result = await courseService.enrollCourse(id);
						setActionLoading(false);
						if (result.success) {
							router.replace(mandatory === "1" ? "/(tabs)" : "/courses");
						} else {
							Alert.alert("Không thể đăng ký", getErrorMessage(result.code, result.error));
						}
					},
				},
			],
		);
	};

	const handleUnenroll = () => {
		if (!id || actionLoading || isDropped) return;
		Alert.alert(
			"Rút khỏi khóa học",
			`Bạn có chắc muốn rút khỏi khóa "${course?.title ?? ""}"? Tiến độ học tập sẽ bị dừng lại.`,
			[
				{ text: "Hủy", style: "cancel" },
				{
					text: "Rút khóa",
					style: "destructive",
					onPress: async () => {
						setActionLoading(true);
						const result = await courseService.unenrollCourse(id);
						setActionLoading(false);
						if (result.success) {
							router.replace("/enroll");
						} else {
							Alert.alert("Không thể rút khóa", getErrorMessage(result.code, result.error));
						}
					},
				},
			],
		);
	};

	return (
		<ScreenWrapper backgroundColor={AUTH_UI.colors.background} scroll={false}>
			<ScreenHeader
				title={course?.title ?? "Chi tiết khóa học"}
				onBack={() => router.back()}
				centered
			/>

			<AsyncContent loading={isLoading} error={error} onRetry={load}>
				{course && (
					<ScrollView
						contentContainerStyle={styles.content}
						showsVerticalScrollIndicator={false}>
						<View style={styles.badgeRow}>
							<Badge text={`Hạng ${course.licenseCategory}`} variant="accent" />
							<Badge
								text={STATUS_LABEL[course.status] ?? course.status}
								variant={course.status === "ACTIVE" ? "success" : "on-tap"}
							/>
						</View>

						<Text style={styles.title}>{course.title}</Text>
						{!!course.description && (
							<Text style={styles.description}>{course.description}</Text>
						)}

						{/* Tiến độ */}
						<View style={styles.card}>
							<View style={styles.progressLabelRow}>
								<Text style={styles.cardLabel}>Tiến độ học tập</Text>
								<Text style={styles.progressValue}>{progress}%</Text>
							</View>
							<ProgressBar progress={progress / 100} height={8} />
						</View>

						{/* Thông tin chung */}
						<Text style={styles.sectionTitle}>Thông tin chung</Text>
						<View style={styles.card}>
							<InfoLine icon="time-outline" label="Thời lượng" value={course.duration} />
							<Divider />
							<InfoLine
								icon="cash-outline"
								label="Học phí"
								value={`${course.tuitionFee.toLocaleString("vi-VN")} đ`}
							/>
							<Divider />
							<InfoLine
								icon="book-outline"
								label="Số bài học"
								value={`${course.totalLessons} bài`}
							/>
							<Divider />
							<InfoLine
								icon="people-outline"
								label="Sĩ số tối đa"
								value={`${course.capacity} học viên`}
							/>
						</View>

						{/* Yêu cầu khóa học */}
						{requirement && (
							<>
								<Text style={styles.sectionTitle}>Yêu cầu khóa học</Text>
								<View style={styles.card}>
									<InfoLine
										icon="calendar-outline"
										label="Độ tuổi tối thiểu"
										value={`${requirement.minAge} tuổi`}
									/>
									<Divider />
									<InfoLine
										icon="checkmark-done-outline"
										label="Tỷ lệ điểm danh"
										value={`${requirement.attendanceRate}%`}
									/>
									<Divider />
									<InfoLine
										icon="ribbon-outline"
										label="Điểm đạt tối thiểu"
										value={`${requirement.minPassScore}`}
									/>
									<Divider />
									<InfoLine
										icon="document-text-outline"
										label="Số bài thi yêu cầu"
										value={`${requirement.requiredExams} bài`}
									/>
									{!!requirement.prerequisites && (
										<>
											<Divider />
											<InfoLine
												icon="information-circle-outline"
												label="Điều kiện tiên quyết"
												value={requirement.prerequisites}
											/>
										</>
									)}
								</View>
							</>
						)}

						{/* Danh sách bài học */}
						<Text style={styles.sectionTitle}>Bài học ({lessons.length})</Text>
						{lessons.length === 0 ? (
							<Text style={styles.emptyText}>Khóa học chưa có bài học nào.</Text>
						) : (
							<View style={styles.card}>
								{lessons.map((lesson, index) => (
									<View key={lesson.id}>
										{index > 0 && <Divider />}
										<TouchableOpacity
											style={styles.lessonRow}
											onPress={() => openLesson(lesson)}
											activeOpacity={0.8}>
											<View style={styles.lessonNumber}>
												<Text style={styles.lessonNumberText}>{lesson.order}</Text>
											</View>
											<Text style={styles.lessonTitle} numberOfLines={2}>
												{lesson.title}
											</Text>
											<Ionicons
												name="chevron-forward"
												size={ms(18)}
												color={AUTH_UI.colors.textSecondary}
											/>
										</TouchableOpacity>
									</View>
								))}
							</View>
						)}

						{/* Tài liệu */}
						{course.materials.length > 0 && (
							<>
								<Text style={styles.sectionTitle}>Tài liệu</Text>
								<View style={styles.card}>
									{course.materials.map((material, index) => (
										<View key={material.id}>
											{index > 0 && <Divider />}
											<TouchableOpacity
												style={styles.lessonRow}
												onPress={() => openMaterial(material)}
												activeOpacity={0.8}>
												<Ionicons
													name="document-attach-outline"
													size={ms(20)}
													color={AUTH_UI.colors.accent}
												/>
												<View style={styles.materialText}>
													<Text style={styles.lessonTitle} numberOfLines={2}>
														{material.title}
													</Text>
													<Text style={styles.materialType}>{material.type}</Text>
												</View>
												<Ionicons
													name="open-outline"
													size={ms(18)}
													color={AUTH_UI.colors.textSecondary}
												/>
											</TouchableOpacity>
										</View>
									))}
								</View>
							</>
						)}
					</ScrollView>
				)}
			</AsyncContent>

			{course && canEnroll && (
				<View style={styles.footer}>
					<Button
						label="Đăng ký khóa học"
						onPress={handleEnroll}
						loading={actionLoading}
					/>
				</View>
			)}

			{course && isEnrolled && (
				<View style={styles.footer}>
					<Button
						variant="danger"
						label={isDropped ? "Đã hủy khóa học" : "Rút khỏi khóa học"}
						onPress={handleUnenroll}
						loading={actionLoading}
						disabled={isDropped}
					/>
				</View>
			)}
		</ScreenWrapper>
	);
}

function InfoLine({
	icon,
	label,
	value,
}: {
	icon: keyof typeof Ionicons.glyphMap;
	label: string;
	value: string;
}) {
	return (
		<View style={styles.infoLine}>
			<View style={styles.infoLeft}>
				<Ionicons name={icon} size={ms(18)} color={AUTH_UI.colors.textMuted} />
				<Text style={styles.infoLabel}>{label}</Text>
			</View>
			<Text style={styles.infoValue}>{value}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	content: {
		paddingHorizontal: s(16),
		paddingBottom: vs(40),
		gap: vs(10),
	},
	badgeRow: {
		flexDirection: "row",
		gap: s(6),
		marginTop: vs(4),
	},
	title: {
		fontSize: ms(20),
		fontWeight: "800",
		color: AUTH_UI.colors.textPrimary,
		lineHeight: ms(28),
	},
	description: {
		fontSize: ms(14),
		lineHeight: ms(21),
		color: AUTH_UI.colors.textSecondary,
	},
	card: {
		backgroundColor: AUTH_UI.colors.surface,
		borderRadius: ms(AUTH_UI.radius.lg),
		padding: s(14),
		gap: vs(8),
	},
	cardLabel: {
		fontSize: ms(13),
		color: AUTH_UI.colors.textSecondary,
	},
	progressLabelRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	progressValue: {
		fontSize: ms(15),
		fontWeight: "800",
		color: AUTH_UI.colors.accent,
	},
	sectionTitle: {
		textTransform: "uppercase",
		fontSize: ms(11),
		color: AUTH_UI.colors.textMuted,
		letterSpacing: 0.8,
		fontWeight: "600",
		marginTop: vs(8),
	},
	infoLine: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: vs(2),
		gap: s(12),
	},
	infoLeft: {
		flexDirection: "row",
		alignItems: "center",
		gap: s(8),
	},
	infoLabel: {
		fontSize: ms(13),
		color: AUTH_UI.colors.textSecondary,
	},
	infoValue: {
		fontSize: ms(13),
		fontWeight: "600",
		color: AUTH_UI.colors.textPrimary,
		flexShrink: 1,
		textAlign: "right",
	},
	lessonRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: s(12),
		paddingVertical: vs(8),
	},
	lessonNumber: {
		width: s(28),
		height: s(28),
		borderRadius: ms(8),
		backgroundColor: AUTH_UI.colors.surfaceMuted,
		alignItems: "center",
		justifyContent: "center",
	},
	lessonNumberText: {
		fontSize: ms(13),
		fontWeight: "700",
		color: AUTH_UI.colors.accent,
	},
	lessonTitle: {
		flex: 1,
		fontSize: ms(14),
		fontWeight: "600",
		color: AUTH_UI.colors.textPrimary,
	},
	materialText: {
		flex: 1,
		gap: vs(2),
	},
	materialType: {
		fontSize: ms(12),
		color: AUTH_UI.colors.textMuted,
	},
	emptyText: {
		fontSize: ms(13),
		color: AUTH_UI.colors.textMuted,
		paddingVertical: vs(4),
	},
	footer: {
		paddingHorizontal: s(16),
		paddingTop: vs(10),
		paddingBottom: vs(16),
		borderTopWidth: 1,
		borderTopColor: AUTH_UI.colors.border,
		backgroundColor: AUTH_UI.colors.background,
	},
});
