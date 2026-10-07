import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
  },
  resolve: {
    alias: {
      'frontend-shared/': path.resolve(__dirname, '../frontend-shared/src/') + '/',
    },
  },
})
