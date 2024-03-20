import { defineConfig, normalizePath } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@effect/cluster': normalizePath(path.resolve('./../../packages/cluster/src/')),
      '@effect/cluster-browser': normalizePath(path.resolve('./../../packages/cluster-browser/src/'))
    }
  }
})
