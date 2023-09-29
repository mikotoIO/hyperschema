import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@hyperschema/client': fileURLToPath(
        new URL(
          '../../../packages/typescript/hyperschema-client/src/index.ts',
          import.meta.url,
        ),
      ),
    },
  },
});
