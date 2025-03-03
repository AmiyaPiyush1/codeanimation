import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: process.env.PORT || 5173,  // Use Render's assigned port
    host: '0.0.0.0',  // Allow external access
    strictPort: true,  // Ensure it doesn't try other ports
    allowedHosts: ['codeanimation.onrender.com'], // Allow Render's host
  }
});