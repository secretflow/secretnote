import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov', 'json'],
      all: true,
      include: ['**/src/**/*.{ts,mts,cts,tsx}'],
    },
  },
});
