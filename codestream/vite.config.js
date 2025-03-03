import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: process.env.PORT || 5173, // Allow dynamic port
    host: '0.0.0.0',
  },
  preview: {
    port: process.env.PORT || 4173,
    host: '0.0.0.0',
  },
  build: {
    outDir: 'dist', // Ensure Vercel serves the correct folder
  }
});