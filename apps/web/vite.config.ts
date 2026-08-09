import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@trix/core': path.resolve(__dirname, '../../packages/core/src/index.ts'),
      '@trix/icons': path.resolve(__dirname, '../../packages/icons/src/index.ts'),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
});
