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
        fastRefresh: true,
        jsxRuntime: 'automatic',
      }),
    ],

    build: {
      outDir: 'dist',
      sourcemap: !isProduction,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              if (
                id.includes('react') ||
                id.includes('react-dom') ||
                id.includes('react-router-dom')
              ) {
                return 'react-vendor'
              }
              if (
                id.includes('@radix-ui') ||
                id.includes('class-variance-authority') ||
                id.includes('clsx') ||
                id.includes('tailwind-merge')
              ) {
                return 'ui-vendor'
              }
            }
          },
        },
      },
      // ✅ Use esbuild (fast, works on Vercel by default)
      minify: isProduction ? 'esbuild' : false,
    },

    server: {
      hmr: true,
      open: true,
      cors: true,
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        },
      },
    },

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

    css: {
      modules: {
        localsConvention: 'camelCase',
      },
      postcss: {
        plugins: [tailwindcss, autoprefixer],
      },
    },

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

    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
  }
})
