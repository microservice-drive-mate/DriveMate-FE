/** @type {import('jest').Config} */
module.exports = {
	preset: 'jest-expo',
	// Chỉ chạy test trong src/utils (utils only)
	roots: ['<rootDir>/src/utils'],
	testMatch: ['**/__tests__/**/*.test.ts'],
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/src/$1', // khớp alias "@/*" trong tsconfig.json
	},
	clearMocks: true,
};
