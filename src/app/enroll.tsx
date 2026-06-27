import { AsyncContent } from "@/components/common/AsyncContent";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { ScreenHeader } from "@/components/layout";
import { ScreenWrapper } from "@/components/screen-wrapper";
import { AUTH_UI } from "@/constants/auth-ui";
import type { Course } from "@/models/course.model";
import { UserRole } from "@/models/user.model";
import { courseService } from "@/services/course.service";
import { useAuthStore } from "@/store/auth.store";
import { getErrorMessage } from "@/utils/error";
import { ms, s, vs } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function EnrollScreen() {
	const router = useRouter();
	const { mandatory } = useLocalSearchParams<{ mandatory?: string }>();
	const isMandatory = mandatory === "1";

	const user = useAuthStore((s) => s.user);
	const licenseTier =
		user?.role === UserRole.STUDENT ? user?.studentDetail?.licenseTier : null;

	const [courses, setCourses] = useState<Course[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const load = useCallback(async () => {
		if (!licenseTier) {
			setIsLoading(false);
			return;
		}
		setIsLoading(true);
		setError(null);

		const result = await courseService.listCourses({
			status: "ACTIVE",
			licenseCategory: licenseTier,
		});
		if (!result.success) {
			setError(getErrorMessage(result.code, result.error));
			setIsLoading(false);
			return;
		}

		setCourses(result.data.items);
		setIsLoading(false);
	}, [licenseTier]);

	useEffect(() => {
		load();
	}, [load]);

	const openCourse = (course: Course) => {
		router.push({
			pathname: "/courses/[id]",
			params: { id: course.id, enrollable: "1", mandatory: mandatory ?? "" },
		});
	};

	// Chưa được phân hạng bằng -> không thể enroll, cho phép vào app.
	if (!licenseTier) {
		return (
			<ScreenWrapper backgroundColor={AUTH_UI.colors.background} scroll={false}>
				<ScreenHeader
					title="Đăng ký khóa học"
					onBack={isMandatory ? undefined : () => router.back()}
					centered
				/>
				<EmptyState
					icon="ribbon-outline"
					title="Tài khoản chưa được phân hạng bằng"
					subtitle="Vui lòng liên hệ trung tâm để được phân hạng bằng trước khi đăng ký khóa học."
					action={
						<Button
							label="Vào ứng dụng"
							onPress={() => router.replace("/(tabs)")}
							style={styles.noticeBtn}
						/>
					}
				/>
			</ScreenWrapper>
		);
	}

	return (
		<ScreenWrapper backgroundColor={AUTH_UI.colors.background} scroll={false}>
			<ScreenHeader
				title="Đăng ký khóa học"
				subtitle={`Khóa học dành cho hạng ${licenseTier}`}
				onBack={isMandatory ? undefined : () => router.back()}
				centered
			/>

			<AsyncContent loading={isLoading} error={error} onRetry={load}>
				<FlatList
					data={courses}
					keyExtractor={(item) => item.id}
					renderItem={({ item }) => (
						<CourseRow item={item} onPress={() => openCourse(item)} />
					)}
					contentContainerStyle={styles.listContent}
					showsVerticalScrollIndicator={false}
					ListEmptyComponent={
						<EmptyState
							icon="school-outline"
							title="Chưa có khóa học khả dụng"
							subtitle={`Hiện chưa có khóa học hạng ${licenseTier} đang mở. Vui lòng quay lại sau hoặc liên hệ trung tâm.`}
						/>
					}
				/>
			</AsyncContent>
		</ScreenWrapper>
	);
}

function CourseRow({ item, onPress }: { item: Course; onPress: () => void }) {
	return (
		<TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
			<View style={styles.cardHeader}>
				<Text style={styles.cardTitle} numberOfLines={2}>
					{item.title}
				</Text>
				<Badge text={`Hạng ${item.licenseCategory}`} variant="accent" />
			</View>

			{!!item.description && (
				<Text style={styles.cardDesc} numberOfLines={2}>
					{item.description}
				</Text>
			)}

			<View style={styles.metaRow}>
				<Meta icon="cash-outline" text={`${item.tuitionFee.toLocaleString("vi-VN")} đ`} />
				<Meta icon="book-outline" text={`${item.totalLessons} bài`} />
				<Meta icon="people-outline" text={`${item.capacity} HV`} />
			</View>
		</TouchableOpacity>
	);
}

function Meta({
	icon,
	text,
}: {
	icon: keyof typeof Ionicons.glyphMap;
	text: string;
}) {
	return (
		<View style={styles.meta}>
			<Ionicons name={icon} size={ms(14)} color={AUTH_UI.colors.textMuted} />
			<Text style={styles.metaText}>{text}</Text>
		</View>
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
	card: {
		backgroundColor: AUTH_UI.colors.surface,
		borderRadius: ms(AUTH_UI.radius.lg),
		padding: s(14),
		gap: vs(8),
	},
	cardHeader: {
		flexDirection: "row",
		alignItems: "flex-start",
		justifyContent: "space-between",
		gap: s(10),
	},
	cardTitle: {
		flex: 1,
		fontSize: ms(16),
		fontWeight: "700",
		color: AUTH_UI.colors.textPrimary,
		lineHeight: ms(22),
	},
	cardDesc: {
		fontSize: ms(13),
		color: AUTH_UI.colors.textSecondary,
		lineHeight: ms(19),
	},
	metaRow: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: s(14),
		marginTop: vs(2),
	},
	meta: {
		flexDirection: "row",
		alignItems: "center",
		gap: s(4),
	},
	metaText: {
		fontSize: ms(12),
		color: AUTH_UI.colors.textSecondary,
	},
	noticeBtn: {
		marginTop: vs(12),
		paddingHorizontal: s(28),
	},
});
