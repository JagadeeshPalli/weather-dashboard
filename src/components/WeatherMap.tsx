/**
 * WeatherMap — slide-up panel with interactive Leaflet map.
 *
 * Base tiles: CartoDB Dark/Light (free, no key required)
 * Weather overlay: OpenWeatherMap tile API (free tier, same API key)
 * Layers: Precipitation · Clouds · Wind · Temperature · Pressure
 */
import 'leaflet/dist/leaflet.css'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Layers, MapPin } from 'lucide-react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'

/* ─── Fix Leaflet marker icons broken by Vite's asset pipeline ─────────── */
const cityDot = L.divIcon({
  className: '',
  html: `<div style="
    width:14px;height:14px;border-radius:50%;
    background:#3B82F6;border:2.5px solid rgba(255,255,255,0.95);
    box-shadow:0 0 14px rgba(59,130,246,0.75),0 2px 6px rgba(0,0,0,0.35);
  "></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
})

/* ─── Layer definitions ─────────────────────────────────────────────────── */
type LayerKey =
  | 'precipitation_new'
  | 'clouds_new'
  | 'wind_new'
  | 'temp_new'
  | 'pressure_new'

const LAYERS: { key: LayerKey; label: string; color: string }[] = [
  { key: 'precipitation_new', label: 'Rain',     color: '#3B82F6' },
  { key: 'clouds_new',        label: 'Clouds',   color: '#94A3B8' },
  { key: 'wind_new',          label: 'Wind',     color: '#10B981' },
  { key: 'temp_new',          label: 'Temp',     color: '#F59E0B' },
  { key: 'pressure_new',      label: 'Pressure', color: '#8B5CF6' },
]

/* ─── Re-centre map whenever lat/lon changes ──────────────────────────── */
function MapFlyTo({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo([lat, lon], map.getZoom(), { duration: 1.2 })
  }, [lat, lon, map])
  return null
}

/* ─── Props ─────────────────────────────────────────────────────────────── */
interface WeatherMapProps {
  lat: number
  lon: number
  cityName: string
  isDark: boolean
  isOpen: boolean
  onClose: () => void
}

/* ─── Component ─────────────────────────────────────────────────────────── */
export function WeatherMap({
  lat,
  lon,
  cityName,
  isDark,
  isOpen,
  onClose,
}: WeatherMapProps) {
  const [activeLayer, setActiveLayer] = useState<LayerKey>('precipitation_new')

  const apiKey = import.meta.env.VITE_OPENWEATHERMAP_API_KEY as string | undefined

  /* CartoDB tiles — free, no key, gorgeous dark + light variants */
  const baseTile = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'

  const wxTile = apiKey
    ? `https://tile.openweathermap.org/map/${activeLayer}/{z}/{x}/{y}.png?appid=${apiKey}`
    : null

  const activeInfo = LAYERS.find((l) => l.key === activeLayer)!

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Backdrop ──────────────────────────────────────────────── */}
          <motion.div
            className="fixed inset-0 z-30"
            style={{ background: 'rgba(0,0,0,0.48)', backdropFilter: 'blur(4px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
          />

          {/* ── Slide-up panel ────────────────────────────────────────── */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-40 flex flex-col"
            style={{
              height: 'clamp(420px, 62vh, 680px)',
              borderRadius: '20px 20px 0 0',
              overflow: 'hidden',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 280 }}
          >
            {/* ── Header ──────────────────────────────────────────────── */}
            <div
              className="shrink-0 flex flex-col gap-3 px-4 pt-2 pb-3"
              style={{
                background: isDark
                  ? 'rgba(5,8,20,0.92)'
                  : 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(28px) saturate(160%)',
                borderBottom: isDark
                  ? '1px solid rgba(255,255,255,0.07)'
                  : '1px solid rgba(0,0,0,0.07)',
              }}
            >
              {/* Drag handle */}
              <div className="w-9 h-1 rounded-full bg-[rgba(128,128,128,0.35)] mx-auto" />

              {/* Title + close */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <MapPin className="w-4 h-4 text-[#3B82F6] shrink-0" />
                  <span className="font-sans text-sm font-semibold text-fg truncate">
                    {cityName}
                  </span>
                  <motion.span
                    key={activeLayer}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="font-code text-[10px] px-2 py-0.5 rounded-full shrink-0"
                    style={{
                      background: `${activeInfo.color}22`,
                      color: activeInfo.color,
                    }}
                  >
                    {activeInfo.label}
                  </motion.span>
                </div>
                <button
                  onClick={onClose}
                  className="text-dim hover:text-fg transition-colors cursor-pointer p-1.5 rounded-xl hover:bg-[rgba(128,128,128,0.12)] shrink-0 ml-2"
                  aria-label="Close map"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Layer pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <Layers className="w-3.5 h-3.5 text-dim shrink-0" />
                {LAYERS.map((l) => (
                  <motion.button
                    key={l.key}
                    onClick={() => setActiveLayer(l.key)}
                    whileTap={{ scale: 0.92 }}
                    className="font-sans text-[11px] font-medium px-3 py-1 rounded-full transition-colors cursor-pointer"
                    style={
                      activeLayer === l.key
                        ? { background: l.color, color: '#fff' }
                        : { background: 'rgba(128,128,128,0.12)', color: 'var(--text-muted)' }
                    }
                  >
                    {l.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* ── Map ─────────────────────────────────────────────────── */}
            <div className="flex-1 relative" style={{ minHeight: 0 }}>
              <MapContainer
                center={[lat, lon]}
                zoom={9}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
                attributionControl={false}
              >
                <MapFlyTo lat={lat} lon={lon} />

                {/* Base tile layer — dark or light */}
                <TileLayer
                  key={`base-${isDark ? 'dark' : 'light'}`}
                  url={baseTile}
                  maxZoom={19}
                  subdomains="abcd"
                />

                {/* OWM weather overlay */}
                {wxTile && (
                  <TileLayer
                    key={`wx-${activeLayer}`}
                    url={wxTile}
                    opacity={0.70}
                    maxZoom={19}
                  />
                )}

                {/* City marker */}
                <Marker position={[lat, lon]} icon={cityDot} />
              </MapContainer>

              {/* Custom attribution */}
              <div
                className="absolute bottom-2 right-2 z-[1000] font-sans text-[9px] pointer-events-none select-none"
                style={{
                  background: 'rgba(0,0,0,0.50)',
                  color: 'rgba(255,255,255,0.65)',
                  padding: '2px 7px',
                  borderRadius: 4,
                }}
              >
                © CARTO · OpenStreetMap · OpenWeatherMap
              </div>

              {/* No API key warning */}
              {!apiKey && (
                <div
                  className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] font-sans text-xs text-[#F59E0B] pointer-events-none"
                  style={{ background: 'rgba(0,0,0,0.65)', padding: '4px 12px', borderRadius: 8 }}
                >
                  Weather overlay requires an API key
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default WeatherMap
