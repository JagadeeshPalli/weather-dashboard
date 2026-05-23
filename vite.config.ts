import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // Pre-bundle Leaflet during dev so the lazy WeatherMap chunk doesn't
    // trigger a full-page HMR reload on first open.
    include: ['leaflet', 'react-leaflet'],
  },
})
