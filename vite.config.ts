import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // Lazy route pages import Recharts inside the test, which can take several seconds on a busy run.
    testTimeout: 20_000,
  },
});
