import {
	formatDuration,
	formatNullableDate,
	formatTimeAgo,
} from '@/utils/examFormat';

describe('formatDuration', () => {
	it('định dạng giây thành mm:ss có pad 0', () => {
		expect(formatDuration(0)).toBe('00:00');
		expect(formatDuration(5)).toBe('00:05');
		expect(formatDuration(125)).toBe('02:05');
		expect(formatDuration(599)).toBe('09:59');
	});
});

describe('formatNullableDate', () => {
	it('trả fallback mặc định khi không có giá trị', () => {
		expect(formatNullableDate(null)).toBe('Chưa cập nhật');
		expect(formatNullableDate(undefined)).toBe('Chưa cập nhật');
	});

	it('trả fallback tuỳ chỉnh khi truyền vào', () => {
		expect(formatNullableDate(null, 'N/A')).toBe('N/A');
	});

	it('trả fallback khi ISO không hợp lệ', () => {
		expect(formatNullableDate('not-a-date')).toBe('Chưa cập nhật');
	});
});

describe('formatTimeAgo', () => {
	const NOW = new Date('2026-01-01T12:00:00.000Z').getTime();

	beforeEach(() => {
		jest.useFakeTimers();
		jest.setSystemTime(NOW);
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	const ago = (ms: number) => new Date(NOW - ms).toISOString();

	it('trả chuỗi rỗng khi null', () => {
		expect(formatTimeAgo(null)).toBe('');
	});

	it('"Vừa xong" khi dưới 1 phút', () => {
		expect(formatTimeAgo(ago(30 * 1000))).toBe('Vừa xong');
	});

	it('"X phút trước" khi dưới 1 giờ', () => {
		expect(formatTimeAgo(ago(5 * 60 * 1000))).toBe('5 phút trước');
	});

	it('"X giờ trước" khi dưới 1 ngày', () => {
		expect(formatTimeAgo(ago(2 * 60 * 60 * 1000))).toBe('2 giờ trước');
	});

	it('"X ngày trước" khi từ 1 ngày trở lên', () => {
		expect(formatTimeAgo(ago(3 * 24 * 60 * 60 * 1000))).toBe('3 ngày trước');
	});
});
