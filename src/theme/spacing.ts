import { s, vs } from "@/utils/responsive";

/**
 * Thang spacing ngang/đều (qua `s()`) — dùng cho paddingHorizontal, gap, marginHorizontal.
 * Giá trị khớp đúng px hiện dùng nên migrate là lossless.
 * Giá trị lẻ hiếm gặp (s(6), s(10)) vẫn dùng `s()` trực tiếp tại chỗ.
 */
export const spacing = {
	xs: s(4),
	sm: s(8),
	md: s(12),
	lg: s(16),
	xl: s(20),
	xxl: s(24),
} as const;

/**
 * Thang spacing dọc (qua `vs()`) — dùng cho paddingVertical, marginVertical, height.
 * Giữ phân biệt s()/vs() theo convention sẵn có của dự án.
 */
export const spacingV = {
	xs: vs(4),
	sm: vs(8),
	md: vs(12),
	lg: vs(16),
	xl: vs(20),
} as const;
