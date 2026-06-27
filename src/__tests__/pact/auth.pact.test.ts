import * as path from 'node:path';
import { PactV4 } from '@pact-foundation/pact/src/v4';
import {
	loginResponseMatcher,
	logoutResponseMatcher,
	passwordActionResponseMatcher,
	successEnvelopeMatcher,
	successStatusMatcher,
} from '@repo/pact-matchers';

const outputDir = path.resolve(process.env.PACT_OUTPUT_DIR ?? 'pacts');

const provider = new PactV4({
	consumer: 'drivemate-mobile',
	provider: 'identity-service',
	dir: outputDir,
	logLevel: 'warn',
});

const storage = new Map<string, string>([
	['drivemate_access_token', 'pact-test-token'],
	['drivemate_refresh_token', 'refresh-token'],
]);

function loadAuthService(
	baseUrl: string,
): typeof import('../../services/auth.service') {
	process.env.EXPO_PUBLIC_API_URL = baseUrl;
	jest.resetModules();
	jest.doMock('expo-router', () => ({
		router: { replace: jest.fn() },
	}));
	jest.doMock('expo-secure-store', () => ({
		getItemAsync: jest.fn(async (key: string) => storage.get(key) ?? null),
		setItemAsync: jest.fn(async (key: string, value: string) => {
			storage.set(key, value);
		}),
		deleteItemAsync: jest.fn(async (key: string) => {
			storage.delete(key);
		}),
	}));

	// Jest + Pact ESM is unstable with dynamic import after resetModules.
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	return require('../../services/auth.service');
}

describe('drivemate-mobile identity-service contract', () => {
	afterEach(() => {
		delete process.env.EXPO_PUBLIC_API_URL;
	});

	it('logs in a student', () =>
		provider
			.addInteraction()
			.given('a valid identity login exists')
			.uponReceiving('mobile login succeeds')
			.withRequest('POST', '/auth/login', (builder) => {
				builder.headers({ 'content-type': 'application/json' });
				builder.jsonBody({
					username: 'student@example.com',
					password: 'Password@123',
				});
			})
			.willRespondWith(successStatusMatcher(201), (builder) => {
				builder.headers({ 'content-type': 'application/json; charset=utf-8' });
				builder.jsonBody(successEnvelopeMatcher(loginResponseMatcher(), 'Created'));
			})
			.executeTest(async (mockServer) => {
				const { authService } = loadAuthService(mockServer.url);
				const result = await authService.login({
					username: 'student@example.com',
					password: 'Password@123',
				});

				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.data.accessToken).toBe('access-token');
				}
			}));

	it('refreshes a token', () =>
		provider
			.addInteraction()
			.given('a valid refresh token exists')
			.uponReceiving('mobile refresh token succeeds')
			.withRequest('POST', '/auth/refresh', (builder) => {
				builder.headers({ 'content-type': 'application/json' });
				builder.jsonBody({ refreshToken: 'refresh-token' });
			})
			.willRespondWith(200, (builder) => {
				builder.headers({ 'content-type': 'application/json; charset=utf-8' });
				builder.jsonBody(successEnvelopeMatcher(loginResponseMatcher()));
			})
			.executeTest(async (mockServer) => {
				const { authService } = loadAuthService(mockServer.url);
				const result = await authService.refreshToken('refresh-token');

				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.data.refreshToken).toBe('refresh-token');
				}
			}));

	it('logs out the current session', () =>
		provider
			.addInteraction()
			.given('a logout token exists')
			.uponReceiving('mobile logout succeeds')
			.withRequest('POST', '/auth/logout', (builder) => {
				builder.headers({
					authorization: 'Bearer pact-test-token',
					'content-type': 'application/json',
				});
				builder.jsonBody({ refreshToken: 'refresh-token' });
			})
			.willRespondWith(200, (builder) => {
				builder.headers({ 'content-type': 'application/json; charset=utf-8' });
				builder.jsonBody(successEnvelopeMatcher(logoutResponseMatcher()));
			})
			.executeTest(async (mockServer) => {
				const { authService } = loadAuthService(mockServer.url);
				const result = await authService.logout('refresh-token');

				expect(result.success).toBe(true);
			}));

	it('changes the current password', () =>
		provider
			.addInteraction()
			.given('the current user can change password')
			.uponReceiving('mobile change password succeeds')
			.withRequest('POST', '/auth/change-password', (builder) => {
				builder.headers({
					authorization: 'Bearer pact-test-token',
					'content-type': 'application/json',
				});
				builder.jsonBody({
					currentPassword: 'OldPassword@123',
					newPassword: 'NewPassword@123',
				});
			})
			.willRespondWith(200, (builder) => {
				builder.headers({ 'content-type': 'application/json; charset=utf-8' });
				builder.jsonBody(successEnvelopeMatcher(passwordActionResponseMatcher()));
			})
			.executeTest(async (mockServer) => {
				const { authService } = loadAuthService(mockServer.url);
				const result = await authService.changePassword({
					currentPassword: 'OldPassword@123',
					newPassword: 'NewPassword@123',
				});

				expect(result.success).toBe(true);
			}));
});
