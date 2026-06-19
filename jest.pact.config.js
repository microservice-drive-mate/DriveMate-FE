/** @type {import('jest').Config} */
module.exports = {
  ...require("./jest.config"),
  roots: ["<rootDir>/src/__tests__/pact"],
  testMatch: ["**/*.pact.test.ts"],
  testTimeout: 30000,
};
