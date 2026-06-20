import { Platform } from "react-native";

export const API_CONFIG = {
	BASE_URL:
		process.env.EXPO_PUBLIC_API_URL ??
		Platform.select({
			android: "http://192.168.0.150:8000",
			ios: "http://localhost:8000",
			default: "http://10.0.2.2:8000",
		})!,
	TIMEOUT: 10000,
};

export const AUTH_CONFIG = {
	ACCESS_TOKEN_KEY: "drivemate_access_token",
	REFRESH_TOKEN_KEY: "drivemate_refresh_token",
	USER_KEY: "drivemate_user",
	ONBOARDING_KEY: "drivemate_onboarding_seen",
	PRACTICE_ANSWERS_KEY: "drivemate_practice_answers",
};

export const ENDPOINTS = {
	AUTH: {
		LOGIN: "/auth/login",
		REFRESH: "/auth/refresh",
		LOGOUT: "/auth/logout",
		FORGOT_PASSWORD: "/auth/forgot-password",
	},
	USERS: {
		GET_ME: "/users/me",
		UPDATE_ME: "/users/me",
	},
	EXAMS: {
		AVAILABLE: "/exams/available",
		SESSIONS: "/exams/sessions",
		SESSION_QUESTIONS: (id: string) => `/exams/sessions/${id}/questions`,
		SESSION_ANSWERS: (id: string) => `/exams/sessions/${id}/answers`,
		SESSION_SUBMIT: (id: string) => `/exams/sessions/${id}/submit`,
		SESSION_RESULT: (id: string) => `/exams/sessions/${id}/result`,
		REVIEW_MISSED_QUESTIONS: "/exams/review/missed-questions",
	},
	MEDIA: {
		FILES: "/media/files",
		FILES_INIT: "/media/files/init",
		FILE: (id: string) => `/media/files/${id}`,
		FILE_URL: (id: string) => `/media/files/${id}/url`,
		FILE_COMPLETE: (id: string) => `/media/files/${id}/complete`,
	},
	NOTIFICATIONS: {
		ME: "/notifications/me",
		MARK_READ: (id: string) => `/notifications/${id}/read`,
		MARK_ALL_READ: "/notifications/mark-all-read",
		REGISTER_DEVICE: "/notifications/devices",
		UNREGISTER_DEVICE: (token: string) =>
			`/notifications/devices/${encodeURIComponent(token)}`,
		PREFERENCES_ME: "/notifications/preferences/me",
	},
	ANALYTICS: {
		ME_PROGRESS: "/analytics/me/progress",
		ME_WEAK_TOPICS: "/analytics/me/weak-topics",
		ME_STUDY_STREAK: "/analytics/me/study-streak",
	},
	SIMULATION: {
		MANEUVERS: "/simulation/maneuvers",
		MANEUVER: (id: string) => `/simulation/maneuvers/${id}`,
		MANEUVER_ERRORS: "/simulation/maneuver-errors",
	},
	COURSES: {
		DETAIL: (id: string) => `/courses/${id}`,
		LESSON: (id: string, lessonId: string) => `/courses/${id}/lessons/${lessonId}`,
	},
	ENROLLMENTS: {
		LIST: "/enrollments",
		DETAIL: (id: string) => `/enrollments/${id}`,
		COMPLETE_LESSON: (id: string, lessonId: string) =>
			`/enrollments/${id}/lessons/${lessonId}/complete`,
	},
	QUESTIONS: {
		TOPICS: "/questions/topics",
		PRACTICE: "/questions/practice",
		REPORT: (id: string) => `/questions/${id}/report`,
	},
};

export const ERROR_CODES = {
	BAD_REQUEST: "BAD_REQUEST",
	UNAUTHORIZED: "UNAUTHORIZED",
	FORBIDDEN: "FORBIDDEN",
	NOT_FOUND: "NOT_FOUND",
	VALIDATION_ERROR: "VALIDATION_ERROR",
	CONFLICT: "CONFLICT",
	TOO_MANY_REQUESTS: "TOO_MANY_REQUESTS",
	SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
	INTERNAL_ERROR: "INTERNAL_ERROR",
	NETWORK_ERROR: "NETWORK_ERROR",
	IDENTITY_USER_NOT_FOUND: "IDENTITY_USER_NOT_FOUND",
	IDENTITY_USER_ALREADY_EXISTS: "IDENTITY_USER_ALREADY_EXISTS",
	USER_PROFILE_NOT_FOUND: "USER_PROFILE_NOT_FOUND",
	USER_ALREADY_EXISTS: "USER_ALREADY_EXISTS",
	USER_NOT_STUDENT: "USER_NOT_STUDENT",
	EXAM_TEMPLATE_NOT_FOUND: "EXAM_TEMPLATE_NOT_FOUND",
	EXAM_SESSION_NOT_FOUND: "EXAM_SESSION_NOT_FOUND",
	EXAM_SESSION_UNAUTHORIZED: "EXAM_SESSION_UNAUTHORIZED",
	EXAM_SESSION_ALREADY_FINISHED: "EXAM_SESSION_ALREADY_FINISHED",
	EXAM_SESSION_EXPIRED: "EXAM_SESSION_EXPIRED",
	STUDENT_PROFILE_INVALID: "STUDENT_PROFILE_INVALID",
	STUDENT_LICENSE_MISMATCH: "STUDENT_LICENSE_MISMATCH",
	FILE_NOT_FOUND: "FILE_NOT_FOUND",
	FILE_TOO_LARGE: "FILE_TOO_LARGE",
	INVALID_MIME_TYPE: "INVALID_MIME_TYPE",
	FILE_UPLOAD_FAILED: "FILE_UPLOAD_FAILED",
	FILE_UPLOAD_NOT_COMPLETED: "FILE_UPLOAD_NOT_COMPLETED",
	// Exam — additional codes from updated spec
	INVALID_EXAM_TEMPLATE: "INVALID_EXAM_TEMPLATE",
	INVALID_EXAM_SESSION: "INVALID_EXAM_SESSION",
	EXAM_SESSION_QUESTION_NOT_FOUND: "EXAM_SESSION_QUESTION_NOT_FOUND",
	EXAM_TEMPLATE_VERSION_CONFLICT: "EXAM_TEMPLATE_VERSION_CONFLICT",
	EXAM_TEMPLATE_IN_USE: "EXAM_TEMPLATE_IN_USE",
	EXAM_TEMPLATE_INACTIVE: "EXAM_TEMPLATE_INACTIVE",
	EXAM_SESSION_NOT_FINISHED: "EXAM_SESSION_NOT_FINISHED",
	INSUFFICIENT_QUESTION_POOL: "INSUFFICIENT_QUESTION_POOL",
	// Course / Enrollment — student-facing codes
	COURSE_NOT_FOUND: "COURSE_NOT_FOUND",
	COURSE_NOT_ACTIVE: "COURSE_NOT_ACTIVE",
	COURSE_HAS_NO_LESSON: "COURSE_HAS_NO_LESSON",
	ENROLLMENT_ALREADY_EXISTS: "ENROLLMENT_ALREADY_EXISTS",
	ENROLLMENT_NOT_FOUND: "ENROLLMENT_NOT_FOUND",
	ENROLLMENT_ALREADY_COMPLETED: "ENROLLMENT_ALREADY_COMPLETED",
	COURSE_CAPACITY_EXCEEDED: "COURSE_CAPACITY_EXCEEDED",
	STUDENT_LICENSE_NOT_ASSIGNED: "STUDENT_LICENSE_NOT_ASSIGNED",
};

export const ERROR_MESSAGES = {
	NETWORK_ERROR: "Không có kết nối mạng. Vui lòng kiểm tra và thử lại.",
	UNAUTHORIZED: "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.",
	FORBIDDEN: "Bạn không có quyền thực hiện thao tác này.",
	SERVER_ERROR: "Lỗi máy chủ. Vui lòng thử lại sau.",
	VALIDATION_FAILED: "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.",
	LOGIN_FAILED: "Email hoặc mật khẩu không đúng. Vui lòng thử lại.",
	GENERIC_ERROR: "Có lỗi xảy ra. Vui lòng thử lại.",
	BAD_REQUEST: "Yêu cầu không hợp lệ. Vui lòng kiểm tra lại.",
	NOT_FOUND: "Không tìm thấy dữ liệu.",
	CONFLICT: "Xảy ra xung đột với yêu cầu của bạn. Vui lòng thử lại.",
	TOO_MANY_REQUESTS: "Quá nhiều yêu cầu. Vui lòng chờ và thử lại.",
	SERVICE_UNAVAILABLE:
		"Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau.",
	INTERNAL_ERROR: "Lỗi nội bộ. Vui lòng thử lại sau.",
	EXAM_TEMPLATE_NOT_FOUND: "Không tìm thấy đề thi. Vui lòng thử lại.",
	EXAM_SESSION_NOT_FOUND: "Không tìm thấy buổi thi. Vui lòng thử lại.",
	EXAM_SESSION_UNAUTHORIZED: "Bạn không có quyền truy cập buổi thi này.",
	EXAM_SESSION_ALREADY_FINISHED: "Buổi thi đã kết thúc trước đó.",
	EXAM_SESSION_EXPIRED: "Buổi thi đã hết thời gian.",
	STUDENT_PROFILE_INVALID:
		"Hồ sơ học viên chưa đầy đủ. Vui lòng cập nhật hạng bằng trong hồ sơ.",
	STUDENT_LICENSE_MISMATCH: "Hạng bằng của bạn không phù hợp với đề thi này.",
	FILE_NOT_FOUND: "Không tìm thấy tệp. Vui lòng thử lại.",
	FILE_TOO_LARGE: "Tệp quá lớn. Vui lòng chọn ảnh dưới 10MB.",
	INVALID_MIME_TYPE:
		"Định dạng tệp không được hỗ trợ. Vui lòng chọn ảnh khác.",
	FILE_UPLOAD_FAILED: "Tải tệp lên thất bại. Vui lòng thử lại.",
	FILE_UPLOAD_NOT_COMPLETED: "Tải tệp lên thất bại. Vui lòng thử lại.",
	INVALID_EXAM_TEMPLATE: "Đề thi không hợp lệ. Vui lòng thử lại.",
	INVALID_EXAM_SESSION: "Buổi thi không hợp lệ. Vui lòng thử lại.",
	EXAM_SESSION_QUESTION_NOT_FOUND: "Không tìm thấy câu hỏi trong buổi thi.",
	EXAM_TEMPLATE_VERSION_CONFLICT:
		"Đề thi đã được cập nhật. Vui lòng thử lại.",
	EXAM_TEMPLATE_IN_USE: "Đề thi đang được sử dụng và không thể thay đổi.",
	EXAM_TEMPLATE_INACTIVE: "Đề thi hiện không khả dụng.",
	EXAM_SESSION_NOT_FINISHED: "Buổi thi chưa kết thúc.",
	INSUFFICIENT_QUESTION_POOL:
		"Không đủ câu hỏi để tạo đề thi. Vui lòng liên hệ trung tâm.",
	COURSE_NOT_FOUND: "Không tìm thấy khóa học.",
	COURSE_NOT_ACTIVE: "Khóa học hiện không khả dụng.",
	COURSE_HAS_NO_LESSON: "Khóa học chưa có bài học nào.",
	ENROLLMENT_ALREADY_EXISTS: "Bạn đã đăng ký khóa học này rồi.",
	ENROLLMENT_NOT_FOUND: "Không tìm thấy thông tin đăng ký khóa học.",
	ENROLLMENT_ALREADY_COMPLETED: "Bạn đã hoàn thành khóa học này.",
	COURSE_CAPACITY_EXCEEDED: "Khóa học đã đủ số lượng học viên.",
	STUDENT_LICENSE_NOT_ASSIGNED:
		"Tài khoản của bạn chưa được gán hạng bằng. Vui lòng liên hệ trung tâm.",
};

export const ROUTES = {
	LOGIN: "/(auth)/login" as const,
	FORGOT_PASSWORD: "/(auth)/forgot-password" as const,
	TABS: "/(tabs)" as const,
	ONBOARDING: "/(onboarding)" as const,
	PROFILE_EDIT: "/profile/edit" as const,
};
