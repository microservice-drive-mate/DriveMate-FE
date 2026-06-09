/**
 * Bo góc (raw, chưa scale). Consumer áp `ms()` khi cần — đúng pattern hiện tại
 * (vd `borderRadius: ms(radius.lg)`). `pill` không cần scale.
 */
export const radius = {
	lg: 12,
	xl: 14,
	sheet: 20,
	pill: 999,
} as const;
