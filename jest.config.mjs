export default {
  bail: true,
  preset: 'ts-jest',
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  maxWorkers: 1,
  collectCoverageFrom: [
    '<rootDir>/src/**/*.ts',
    '!<rootDir>/src/**/index.ts',
    '!<rootDir>/src/**/*.d.ts',
  ],
};
