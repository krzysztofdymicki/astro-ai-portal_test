// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Ścieżka do app Next.js
  dir: './',
});

// Konfiguracja Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  fakeTimers: {
    enableGlobally: true
  },
  reporters: [
    'default',
    ['jest-html-reporter', {
      pageTitle: 'Astro AI Portal Tests',
      outputPath: './test-results/test-report.html',
      includeFailureMsg: true,
      includeConsoleLog: true,
      useCssFile: true
    }]
  ],
  moduleNameMapper: {
    // Aliasy dla importów
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/utils/(.*)$': '<rootDir>/src/utils/$1',
  },
  // Ignorowanie node_modules - możemy to zmienić, jeśli potrzeba testować kod z node_modules
  transformIgnorePatterns: [
    '/node_modules/(?!(@supabase|next)/)',
  ],
  // Ścieżki do plików testowych
  testMatch: [
    '**/__tests__/**/*.test.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)'
  ],
  // Pokrycie kodu
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/_*.{js,jsx,ts,tsx}',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!**/node_modules/**',
  ],
};

// Eksportujemy konfigurację Jest
module.exports = createJestConfig(customJestConfig);