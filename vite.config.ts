import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  plugins: [react()],
  test: {
    include: ['src/test/**/*.{test,spec}.{ts,tsx}', 'src/test/*.{test,spec}.{ts,tsx}'],
    exclude: ['tests/e2e/**'],
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
  },
})
