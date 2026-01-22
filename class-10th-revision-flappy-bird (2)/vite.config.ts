import { defineConfig } from 'vite';

export default defineConfig({
  define: {
    // This allows the app to access process.env.API_KEY in the browser
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
    // Some libraries check for 'process.env.NODE_ENV'
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },
  server: {
    port: 3000,
    host: true
  }
});