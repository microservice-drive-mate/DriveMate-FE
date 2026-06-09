/**
 * Bảng màu tập trung (single source of truth) cho toàn app.
 * Giữ nguyên đúng giá trị hex đang dùng — refactor thuần, không đổi pixel.
 */

/** Trả về chuỗi rgba từ màu hex + độ mờ. Thay cho các literal `rgba(...)` lặp lại. */
export const withAlpha = (hex: string, alpha: number): string => {
	const h = hex.replace("#", "");
	const r = parseInt(h.substring(0, 2), 16);
	const g = parseInt(h.substring(2, 4), 16);
	const b = parseInt(h.substring(4, 6), 16);
	return `rgba(${r},${g},${b},${alpha})`;
};

export const colors = {
	// --- Base palette (bộ màu nền tảng, dùng bởi AUTH_UI) ---
	background: "#090B0F",
	surface: "#1A1D23",
	surfaceMuted: "#2A2E35",
	border: "#343943",
	textPrimary: "#F5F7FA",
	textSecondary: "#9FA8B5",
	textMuted: "#7C8696",
	accent: "#F3C942",
	accentText: "#101217",
	danger: "#F87171",
	success: "#53D18D",
	disabled: "#4A4F58",

	// --- Trạng thái câu hỏi (exam session) ---
	answeredBg: "#1B4332",
	bookmarkBg: "#3D2E00",
	skippedBg: "#3B0F0F",

	// --- Warning / gold ---
	warning: "#C9A227",
	warningBg: "#2A2200",

	// --- Badge / banner ---
	onTapBg: "#2D2A0F",
	onTapBorder: "#4A3F10",
	satHachBg: "#1A1040",
	satHachBorder: "#2D1F6B",
	satHachText: "#A78BFA",
	satHachTextLight: "#C4B5FD",

	// --- Accent track (thanh tiến độ nền) ---
	accentTrack: "#D4A832",

	// --- Practice cards ---
	circuitBg: "#2A0E0E",
	circuitIconBg: "#4A1A1A",
	errorsBg: "#071E22",
	errorsIcon: "#22D3EE",
	errorsIconBg: "#0E3A40",
	licenseBadgeBg: "#5A1A1A",

	// --- Misc ---
	overlay: "rgba(0,0,0,0.6)",
	scrim: "rgba(0,0,0,0.25)",
};

export type ColorToken = keyof typeof colors;
