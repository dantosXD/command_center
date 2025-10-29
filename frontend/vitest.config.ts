import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  plugins: [],
  server: {
    hmr: false,
  },
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: {
      $lib: path.resolve('./src/lib'),
      '$app/environment': path.resolve('./src/test/shims/app-environment.ts'),
      $app: path.resolve('./src/app'),
    },
  },
});
