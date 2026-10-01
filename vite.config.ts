import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Capture ADMIN_PASSWORD from Cloudflare Pages Environment Variables / Secrets
  const env = { ...process.env, ...loadEnv(mode, process.cwd(), '') };
  const adminPassword = (env.ADMIN_PASSWORD || env.VITE_ADMIN_PASSWORD || '').trim();

  return {
    plugins: [react()],
    define: {
      '__ADMIN_PASSWORD__': JSON.stringify(adminPassword),
      'import.meta.env.VITE_ADMIN_PASSWORD': JSON.stringify(adminPassword),
    },
    server: {
      port: 3000,
      open: true
    }
  };
});
