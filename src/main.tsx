import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// Leaflet CSS must live in the main bundle — not inside the lazy WeatherMap
// chunk — so the tile grid is correctly sized before MapContainer first renders.
import 'leaflet/dist/leaflet.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
