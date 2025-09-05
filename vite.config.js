import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production'
  
  return {
    plugins: [
      react({
        // Enable Fast Refresh
        fastRefresh: true,
        // Enable React strict mode
        jsxRuntime: 'automatic',
      }),
    ],

    // Build configuration
    build: {
      // Output directory
      outDir: 'dist',
      // Source maps in development
      sourcemap: !isProduction,
      // Chunk size warning limit
      chunkSizeWarningLimit: 1000,
      // Rollup options
      rollupOptions: {
        output: {
          // Manual chunk splitting using function form
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
                return 'react-vendor';
              }
              if (id.includes('@radix-ui') || id.includes('class-variance-authority') || id.includes('clsx') || id.includes('tailwind-merge')) {
                return 'ui-vendor';
              }
            }
          },
        },
      },
      // Minify in production
      minify: isProduction ? 'terser' : false,
      // Terser options
      terserOptions: {
        compress: {
          drop_console: isProduction,
          drop_debugger: isProduction,
        },
      },
    },

    // Development server configuration
    server: {
      // Enable HMR
      hmr: true,
      // Open browser on start
      open: true,
      // Configure CORS
      cors: true,
      // Configure proxy for API requests
      proxy: {
        '/api': {
          target: 'https://code-backend-89a2.onrender.com',
          changeOrigin: true,
          secure: false,
        },
      },
    },

    // Resolve configuration
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@components': resolve(__dirname, 'src/components'),
        '@pages': resolve(__dirname, 'src/pages'),
        '@hooks': resolve(__dirname, 'src/hooks'),
        '@utils': resolve(__dirname, 'src/utils'),
        '@assets': resolve(__dirname, 'src/assets'),
        '@styles': resolve(__dirname, 'src/styles'),
      },
    },

    // CSS configuration
    css: {
      // Enable CSS modules
      modules: {
        localsConvention: 'camelCase',
      },
      // PostCSS configuration
      postcss: {
        plugins: [
          tailwindcss,
          autoprefixer,
        ],
      },
    },

    // Optimize dependencies
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@radix-ui/react-icons',
        'class-variance-authority',
        'clsx',
        'tailwind-merge',
      ],
    },

    // Environment variables
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
  }
})
