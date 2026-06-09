import { useEffect, useRef, useState } from "react";

/**
 * Đếm ngược mỗi giây từ `initialSeconds`. Khi `active` bật và còn thời gian thì
 * giảm dần; chạm 0 sẽ gọi `onExpire` đúng một lần. Trả về số giây còn lại.
 */
export function useCountdownTimer(
	initialSeconds: number,
	active: boolean,
	onExpire: () => void,
): number {
	const [remaining, setRemaining] = useState(initialSeconds);
	const onExpireRef = useRef(onExpire);
	onExpireRef.current = onExpire;

	useEffect(() => {
		if (!active) return;
		if (remaining <= 0) {
			onExpireRef.current();
			return;
		}
		const timer = setInterval(() => {
			setRemaining((prev) => Math.max(0, prev - 1));
		}, 1000);
		return () => clearInterval(timer);
	}, [active, remaining]);

	return remaining;
}
