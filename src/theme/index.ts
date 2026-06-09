import { colors, withAlpha } from "./colors";
import { radius } from "./radius";
import { spacing, spacingV } from "./spacing";
import { fontSize, fontWeight, typography } from "./typography";

export { colors, withAlpha } from "./colors";
export { radius } from "./radius";
export { spacing, spacingV } from "./spacing";
export { fontSize, fontWeight, typography } from "./typography";

/** Token gộp — dùng `theme.colors.accent`, `theme.spacing.lg`, ... */
export const theme = {
	colors,
	spacing,
	spacingV,
	radius,
	fontSize,
	fontWeight,
	typography,
	withAlpha,
} as const;

export type Theme = typeof theme;
