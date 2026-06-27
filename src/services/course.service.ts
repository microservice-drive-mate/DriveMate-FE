import { apiService as api } from '@/lib/api';
import { ENDPOINTS } from '@/constants';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';
import type { Course, CourseStatus, Enrollment, EnrollmentStatus, Lesson } from '@/models/course.model';
import { withErrorHandling } from '@/utils';

export const courseService = {
	getMyEnrollments: withErrorHandling(
		(params?: { page?: number; size?: number; status?: EnrollmentStatus }) =>
			api.get<ApiResponse<PaginatedResponse<Enrollment>>>(ENDPOINTS.ENROLLMENTS.LIST, {
				params,
			}),
	),

	listCourses: withErrorHandling(
		(params?: {
			page?: number;
			size?: number;
			licenseCategory?: string;
			status?: CourseStatus;
		}) =>
			api.get<ApiResponse<PaginatedResponse<Course>>>(ENDPOINTS.COURSES.LIST, {
				params,
			}),
	),

	enrollCourse: withErrorHandling((courseId: string) =>
		api.post<ApiResponse<Enrollment>>(ENDPOINTS.COURSES.ENROLL(courseId), {}),
	),

	unenrollCourse: withErrorHandling((courseId: string) =>
		api.post<ApiResponse<Enrollment>>(ENDPOINTS.COURSES.UNENROLL(courseId), {}),
	),

	getEnrollment: withErrorHandling((id: string) =>
		api.get<ApiResponse<Enrollment>>(ENDPOINTS.ENROLLMENTS.DETAIL(id)),
	),

	getCourseDetail: withErrorHandling((id: string) =>
		api.get<ApiResponse<Course>>(ENDPOINTS.COURSES.DETAIL(id)),
	),

	getLesson: withErrorHandling((courseId: string, lessonId: string) =>
		api.get<ApiResponse<Lesson>>(ENDPOINTS.COURSES.LESSON(courseId, lessonId)),
	),

	completeLesson: withErrorHandling((enrollmentId: string, lessonId: string) =>
		api.post<ApiResponse<Enrollment>>(
			ENDPOINTS.ENROLLMENTS.COMPLETE_LESSON(enrollmentId, lessonId),
			{},
		),
	),
};

/**
 * Student được coi là "đã có khóa" khi tồn tại ít nhất một enrollment ACTIVE hoặc
 * COMPLETED. Enrollment DROPPED không tính. Dùng cho gate bắt buộc đăng ký sau login.
 * Lỗi mạng coi như đã có khóa để không chặn nhầm người dùng.
 */
export async function hasActiveEnrollment(): Promise<boolean> {
	const result = await courseService.getMyEnrollments();
	if (!result.success) return true;
	return result.data.items.some(
		(e) => e.status === 'ACTIVE' || e.status === 'COMPLETED',
	);
}
