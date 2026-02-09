import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        proxy: {
          // Proxy Google Maps API requests through the dev server
          // so the Referer header sent to Google is corp.little.global
          '/google-maps-proxy': {
            target: 'https://maps.googleapis.com',
            changeOrigin: true,
            rewrite: (path: string) => path.replace(/^\/google-maps-proxy/, ''),
            headers: {
              'Referer': 'https://corp.little.global/',
              'Origin': 'https://corp.little.global',
            },
          },
        },
      },
      plugins: [tailwindcss(), react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
