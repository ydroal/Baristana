// import fs from 'fs';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  define: {
    'import.meta.env.VITE_APP_API_ENDPOINT': JSON.stringify(process.env.VITE_APP_API_ENDPOINT),
    'import.meta.env.VITE_APP_GOOGLE_CLIENT_ID': JSON.stringify(process.env.VITE_APP_GOOGLE_CLIENT_ID),
    'import.meta.env.VITE_APP_BUCKET_NAME': JSON.stringify(process.env.VITE_APP_BUCKET_NAME),
    'import.meta.env.VITE_APP_S3_REGION': JSON.stringify(process.env.VITE_APP_S3_REGION),
    'import.meta.env.VITE_APP_S3_OBJ_ICONS': JSON.stringify(process.env.VITE_APP_S3_OBJ_ICONS)
  }
});
