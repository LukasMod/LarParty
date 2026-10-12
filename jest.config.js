module.exports = {
  preset: 'jest-expo',
  watchman: false,
  setupFiles: ['<rootDir>/jest/setup.ts'],
  setupFilesAfterEnv: ['<rootDir>/jest/setup-after-env.ts'],
  moduleNameMapper: {
    '^@test/(.*)$': '<rootDir>/jest/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/assets/(.*)$': '<rootDir>/assets/$1',
  },
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts', '!src/app/**'],
}
