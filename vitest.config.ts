import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(() => ({
  name: 'react-letter',
  test: {
    globals: true,
    threads: false,
    environment: 'jsdom',
    setupFiles: 'test/setupTests.ts',
  },
  plugins: [react()],
}));
