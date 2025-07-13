import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 6173,
    allowedHosts: [
      'localhost',
      // 
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // Change if your backend runs on a different port locally
        changeOrigin: true,
      },
    },
  },
})