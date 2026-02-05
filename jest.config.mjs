export default {
  bail: true,
  preset: 'ts-jest',
  verbose: true,
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  maxWorkers: 1,
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
};
