import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.spec.ts'],
  },
  resolve: {
    alias: {
      '$lib': path.resolve(__dirname, './frontend/src/lib'),
      '$app': path.resolve(__dirname, './frontend/src/app'),
    },
  },
});
