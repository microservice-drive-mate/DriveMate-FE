import { ERROR_CODES, ERROR_MESSAGES } from '@/constants';
import {
	ApiError,
	extractErrorMessage,
	getErrorMessage,
	parseError,
	shouldLogout,
} from '@/utils/error';

describe('extractErrorMessage', () => {
	it('lấy message từ Error', () => {
		expect(extractErrorMessage(new Error('boom'))).toBe('boom');
	});

	it('dùng fallback khi không phải Error', () => {
		expect(extractErrorMessage('oops')).toBe('Có lỗi xảy ra.');
		expect(extractErrorMessage(undefined, 'Thất bại')).toBe('Thất bại');
	});
});

describe('getErrorMessage', () => {
	it('map code sang message tiếng Việt', () => {
		expect(getErrorMessage('NETWORK_ERROR', 'fb')).toBe(
			ERROR_MESSAGES.NETWORK_ERROR,
		);
	});

	it('trả fallback khi code không tồn tại hoặc undefined', () => {
		expect(getErrorMessage(undefined, 'fb')).toBe('fb');
		expect(getErrorMessage('KHONG_TON_TAI', 'fb')).toBe('fb');
	});
});

describe('shouldLogout', () => {
	it('true khi ApiError 401 hoặc code UNAUTHORIZED', () => {
		expect(shouldLogout(new ApiError('x', 401))).toBe(true);
		expect(
			shouldLogout(new ApiError('x', 500, ERROR_CODES.UNAUTHORIZED)),
		).toBe(true);
	});

	it('false với ApiError khác và lỗi thường', () => {
		expect(shouldLogout(new ApiError('x', 500))).toBe(false);
		expect(shouldLogout(new Error('x'))).toBe(false);
	});
});

describe('parseError', () => {
	it('trả NETWORK_ERROR khi không phải lỗi axios', () => {
		const err = parseError(new Error('mất mạng'));
		expect(err).toBeInstanceOf(ApiError);
		expect(err.code).toBe(ERROR_CODES.NETWORK_ERROR);
		expect(err.status).toBe(0);
		expect(err.message).toBe(ERROR_MESSAGES.NETWORK_ERROR);
	});

	it('đọc status/code/message từ response của lỗi axios', () => {
		const axiosLike = {
			isAxiosError: true,
			response: {
				status: 404,
				data: { code: ERROR_CODES.NOT_FOUND, message: 'Không thấy' },
			},
		};
		const err = parseError(axiosLike);
		expect(err.status).toBe(404);
		expect(err.code).toBe(ERROR_CODES.NOT_FOUND);
		expect(err.message).toBe('Không thấy');
	});
});
