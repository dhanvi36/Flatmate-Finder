import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Proxy API calls to the Express backend on port 3000
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      // Proxy uploads (room photos) to the backend
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
