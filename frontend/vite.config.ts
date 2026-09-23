/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    visualizer({
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
      open: false,
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    // Without this, Vitest's default include glob also picks up
    // e2e/*.spec.ts (Playwright tests) and tries to run them with the wrong
    // runner -- Playwright's own `test`/`test.describe` isn't Vitest's.
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/e2e/**',
      '**/.{idea,git,cache,output,temp}/**',
    ],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          if (id.includes('embla-carousel')) return 'carousel'
          if (id.includes('@tanstack/react-query')) return 'query'
          if (id.includes('framer-motion') || id.includes('/gsap/')) {
            return 'animation'
          }
          if (id.includes('react-icons')) return 'icons'
          if (
            id.includes('react-dom') ||
            id.includes('react-router') ||
            id.includes('/react/')
          ) {
            return 'react-vendor'
          }
          if (
            id.includes('axios') ||
            id.includes('zustand') ||
            id.includes('react-hot-toast')
          ) {
            return 'utils'
          }
        },
      },
    },
  },
})
