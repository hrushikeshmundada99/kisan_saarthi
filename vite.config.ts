import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api/fast2sms': {
        target: 'https://www.fast2sms.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/fast2sms/, '/dev/bulkV2'),
        secure: false,
      },
    },
  },
});
