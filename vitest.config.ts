import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

const srcRoot = resolve(__dirname, 'src');

export default defineConfig({
  resolve: {
    alias: {
      '@common': resolve(srcRoot, 'common'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
  },
});
