import { colors, radius } from '@/theme';
import { s } from '@/utils/responsive';

/**
 * Alias tương thích ngược cho code chưa migrate sang `@/theme`.
 * Lấy đúng các token gốc từ theme — single source of truth tại src/theme/.
 */
export const AUTH_UI = {
	colors: {
		background: colors.background,
		surface: colors.surface,
		surfaceMuted: colors.surfaceMuted,
		border: colors.border,
		textPrimary: colors.textPrimary,
		textSecondary: colors.textSecondary,
		textMuted: colors.textMuted,
		accent: colors.accent,
		accentText: colors.accentText,
		danger: colors.danger,
		success: colors.success,
		disabled: colors.disabled,
	},
	radius: {
		lg: radius.lg,
		xl: radius.xl,
	},
};

export const AUTH_LAYOUT = {
	horizontalPadding: s(24),
};
