import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Config Vite pour le frontend React (JavaScript)
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // Pour appeler le backend en dev
    proxy: {
      '/api': {
        target: 'http://localhost:3002', // identique au PORT dans Backend/server.js
        changeOrigin: true
      }
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/SetupTests.js'],
    include: ['src/tests/*.test.jsx']
  }


})
