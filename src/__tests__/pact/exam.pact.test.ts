import * as path from 'node:path';
import { PactV4 } from '@pact-foundation/pact/src/v4';
import {
	answeredExamSessionMatcher,
	examResultMatcher,
	examSessionMatcher,
	examSessionQuestionsMatcher,
	missedQuestionsResponseMatcher,
	pactExamples,
	paginatedAvailableExamsMatcher,
	successEnvelopeMatcher,
	successStatusMatcher,
} from '@repo/pact-matchers';

const outputDir = path.resolve(process.env.PACT_OUTPUT_DIR ?? 'pacts');

const provider = new PactV4({
	consumer: 'drivemate-mobile',
	provider: 'exam-service',
	dir: outputDir,
	logLevel: 'warn',
});

const storage = new Map<string, string>([
	['drivemate_access_token', 'pact-test-token'],
]);

function loadExamService(
	baseUrl: string,
): typeof import('../../services/exam.service') {
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
	return require('../../services/exam.service');
}

describe('drivemate-mobile exam-service contract', () => {
	afterEach(() => {
		delete process.env.EXPO_PUBLIC_API_URL;
	});

	it('lists available exams', () =>
		provider
			.addInteraction()
			.given('a student with matching license has available exams')
			.uponReceiving('mobile lists available exams')
			.withRequest('GET', '/exams/available', (builder) => {
				builder.headers({ authorization: 'Bearer pact-test-token' });
			})
			.willRespondWith(200, (builder) => {
				builder.headers({ 'content-type': 'application/json; charset=utf-8' });
				builder.jsonBody(successEnvelopeMatcher(paginatedAvailableExamsMatcher()));
			})
			.executeTest(async (mockServer) => {
				const { examService } = loadExamService(mockServer.url);
				const result = await examService.getAvailableExams();

				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.data.items[0].licenseCategory).toBe('B1');
				}
			}));

	it('starts an exam session', () =>
		provider
			.addInteraction()
			.given('an active exam template exists')
			.uponReceiving('mobile starts an exam session')
			.withRequest('POST', '/exams/sessions', (builder) => {
				builder.headers({
					authorization: 'Bearer pact-test-token',
					'content-type': 'application/json',
				});
				builder.jsonBody({ templateId: pactExamples.templateId });
			})
			.willRespondWith(successStatusMatcher(201), (builder) => {
				builder.headers({ 'content-type': 'application/json; charset=utf-8' });
				builder.jsonBody(successEnvelopeMatcher(examSessionMatcher(), 'Created'));
			})
			.executeTest(async (mockServer) => {
				const { examService } = loadExamService(mockServer.url);
				const result = await examService.startSession(pactExamples.templateId);

				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.data.status).toBe('IN_PROGRESS');
				}
			}));

	it('loads session questions without answer keys', () =>
		provider
			.addInteraction()
			.given('an in-progress exam session exists for the student')
			.uponReceiving('mobile loads exam session questions')
			.withRequest(
				'GET',
				`/exams/sessions/${pactExamples.sessionId}/questions`,
				(builder) => {
					builder.headers({ authorization: 'Bearer pact-test-token' });
				},
			)
			.willRespondWith(200, (builder) => {
				builder.headers({ 'content-type': 'application/json; charset=utf-8' });
				builder.jsonBody(successEnvelopeMatcher(examSessionQuestionsMatcher()));
			})
			.executeTest(async (mockServer) => {
				const { examService } = loadExamService(mockServer.url);
				const result = await examService.getSessionQuestions(pactExamples.sessionId);

				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.data.items[0]).not.toHaveProperty('isCorrect');
				}
			}));

	it('saves an answer draft', () =>
		provider
			.addInteraction()
			.given('an in-progress exam session exists for the student')
			.uponReceiving('mobile saves an exam answer')
			.withRequest(
				'PATCH',
				`/exams/sessions/${pactExamples.sessionId}/answers`,
				(builder) => {
					builder.headers({
						authorization: 'Bearer pact-test-token',
						'content-type': 'application/json',
					});
					builder.jsonBody({
						questionId: pactExamples.questionId,
						selectedOptionId: pactExamples.optionId,
						isBookmarked: true,
					});
				},
			)
			.willRespondWith(200, (builder) => {
				builder.headers({ 'content-type': 'application/json; charset=utf-8' });
				builder.jsonBody(successEnvelopeMatcher(answeredExamSessionMatcher()));
			})
			.executeTest(async (mockServer) => {
				const { examService } = loadExamService(mockServer.url);
				const result = await examService.saveAnswer(pactExamples.sessionId, {
					questionId: pactExamples.questionId,
					selectedOptionId: pactExamples.optionId,
					isBookmarked: true,
				});

				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.data.questions[0].selectedOptionId).toBe(
						pactExamples.optionId,
					);
				}
			}));

	it('submits an exam session', () =>
		provider
			.addInteraction()
			.given('an in-progress exam session exists for the student')
			.uponReceiving('mobile submits an exam session')
			.withRequest(
				'POST',
				`/exams/sessions/${pactExamples.sessionId}/submit`,
				(builder) => {
					builder.headers({
						authorization: 'Bearer pact-test-token',
						'content-type': 'application/json',
					});
					builder.jsonBody({});
				},
			)
			.willRespondWith(200, (builder) => {
				builder.headers({ 'content-type': 'application/json; charset=utf-8' });
				builder.jsonBody(successEnvelopeMatcher(examResultMatcher()));
			})
			.executeTest(async (mockServer) => {
				const { examService } = loadExamService(mockServer.url);
				const result = await examService.submitSession(pactExamples.sessionId);

				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.data.status).toBe('COMPLETED');
				}
			}));

	it('loads a completed exam result', () =>
		provider
			.addInteraction()
			.given('a completed exam session exists for the student')
			.uponReceiving('mobile loads a completed exam result')
			.withRequest(
				'GET',
				`/exams/sessions/${pactExamples.sessionId}/result`,
				(builder) => {
					builder.headers({ authorization: 'Bearer pact-test-token' });
				},
			)
			.willRespondWith(200, (builder) => {
				builder.headers({ 'content-type': 'application/json; charset=utf-8' });
				builder.jsonBody(successEnvelopeMatcher(examResultMatcher()));
			})
			.executeTest(async (mockServer) => {
				const { examService } = loadExamService(mockServer.url);
				const result = await examService.getSessionResult(pactExamples.sessionId);

				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.data.isPassed).toBe(true);
				}
			}));

	it('loads missed questions for review', () =>
		provider
			.addInteraction()
			.given('missed question history exists for the student')
			.uponReceiving('mobile loads missed questions for review')
			.withRequest('GET', '/exams/review/missed-questions', (builder) => {
				builder.headers({ authorization: 'Bearer pact-test-token' });
			})
			.willRespondWith(200, (builder) => {
				builder.headers({ 'content-type': 'application/json; charset=utf-8' });
				builder.jsonBody(successEnvelopeMatcher(missedQuestionsResponseMatcher()));
			})
			.executeTest(async (mockServer) => {
				const { examService } = loadExamService(mockServer.url);
				const result = await examService.getMissedQuestions();

				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.data.items[0].missedCount).toBeGreaterThan(0);
				}
			}));
});
