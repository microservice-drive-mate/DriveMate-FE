import { ms } from "@/utils/responsive";

/**
 * Thang cỡ chữ theo vai trò (qua `ms()`). Khớp đúng các fontSize hiện dùng.
 */
export const fontSize = {
	tiny: ms(11),
	caption: ms(12),
	label: ms(13),
	body: ms(14),
	bodyLg: ms(15),
	subtitle: ms(16),
	title: ms(17),
	titleLg: ms(18),
	heading: ms(20),
	display: ms(24),
} as const;

/** Trọng số chữ chuẩn hóa. */
export const fontWeight = {
	regular: "400",
	medium: "500",
	semibold: "600",
	bold: "700",
} as const;

export const typography = { fontSize, fontWeight } as const;
