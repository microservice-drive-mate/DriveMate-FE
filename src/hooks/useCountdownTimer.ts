import { useEffect, useRef, useState } from "react";

const toRemaining = (deadlineMs: number) =>
	Math.max(0, Math.round((deadlineMs - Date.now()) / 1000));

/**
 * Đếm ngược theo mốc thời gian tuyệt đối `deadlineMs` (epoch ms của expiresAt).
 * Mỗi tick tính lại từ `Date.now()` nên tự hiệu chỉnh sau khi app bị background.
 * Khi `active` bật và còn thời gian thì giảm dần; chạm 0 gọi `onExpire` đúng một
 * lần. Trả về số giây còn lại.
 */
export function useCountdownTimer(
	deadlineMs: number,
	active: boolean,
	onExpire: () => void,
): number {
	const [remaining, setRemaining] = useState(() => toRemaining(deadlineMs));
	const onExpireRef = useRef(onExpire);
	onExpireRef.current = onExpire;

	useEffect(() => {
		if (!active) return;
		if (remaining <= 0) {
			onExpireRef.current();
			return;
		}
		const timer = setInterval(() => {
			setRemaining(toRemaining(deadlineMs));
		}, 1000);
		return () => clearInterval(timer);
	}, [active, remaining, deadlineMs]);

	return remaining;
}
