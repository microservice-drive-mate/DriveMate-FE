export function formatDateTime(iso: string): string {
	const dateText = formatDate(iso);
	const timeText = formatTime(iso);
	return `${dateText} lúc ${timeText}`;
}

export function formatDate(iso: string): string {
	return new Date(iso).toLocaleDateString("vi-VN", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});
}

export function formatNullableDate(
	iso: string | null | undefined,
	fallback = "Chưa cập nhật",
): string {
	if (!iso) return fallback;
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return fallback;
	return formatDate(iso);
}

export function formatTime(iso: string): string {
	return new Date(iso).toLocaleTimeString("vi-VN", {
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	});
}

export function formatDuration(seconds: number): string {
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function formatTimeAgo(iso: string | null): string {
	if (!iso) return "";
	const diff = Date.now() - new Date(iso).getTime();
	const minutes = Math.floor(diff / 60000);
	if (minutes < 1) return "Vừa xong";
	if (minutes < 60) return `${minutes} phút trước`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours} giờ trước`;
	const days = Math.floor(hours / 24);
	return `${days} ngày trước`;
}
