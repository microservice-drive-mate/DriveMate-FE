import { apiService as api } from '@/lib/api';
import { ENDPOINTS } from '@/constants';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';
import type { Course, Enrollment, EnrollmentStatus, Lesson } from '@/models/course.model';
import { withErrorHandling } from '@/utils';

export const courseService = {
	getMyEnrollments: withErrorHandling(
		(params?: { page?: number; size?: number; status?: EnrollmentStatus }) =>
			api.get<ApiResponse<PaginatedResponse<Enrollment>>>(ENDPOINTS.ENROLLMENTS.LIST, {
				params,
			}),
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
