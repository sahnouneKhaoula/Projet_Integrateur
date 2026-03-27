/**
 * Configuration Vite : build du frontend React, port de dev, proxy /api vers le backend.
 * Adapter `target` si votre API tourne sur un autre port (ex. 3001).
 */
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
        target: 'http://localhost:5000',
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
