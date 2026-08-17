import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  build: {
    // Chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          'react-core':   ['react', 'react-dom', 'react-router-dom'],
          'query':        ['@tanstack/react-query'],
          'ui-icons':     ['lucide-react'],
          'forms':        ['react-hook-form'],
        },
      },
    },
    // Warn on large chunks > 1MB
    chunkSizeWarningLimit: 1000,
    // Minify with esbuild (default, very fast)
    minify: 'esbuild',
    sourcemap: false, // Disable sourcemaps in production
  },

  server: {
    // Development proxy so the frontend can call /api/* without CORS issues
    proxy: {
      '/api': {
        target: 'http://localhost:3333',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
    // Better HMR performance
    hmr: { overlay: true },
  },

  // Path aliases for cleaner imports
  resolve: {
    alias: {
      '@': '/src',
    },
  },

  // Optimise dependencies pre-bundling
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query', 'lucide-react'],
  },
});
