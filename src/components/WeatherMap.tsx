/**
 * WeatherMap — slide-up panel with interactive Leaflet map.
 *
 * UX design:
 *  - Compact panel height (≈ 40 vh) so it feels like a drawer, not a takeover
 *  - Each weather layer has a plain-English description + colour legend so
 *    users without meteorology background understand what they're seeing
 *  - Zoom controls enabled so users can explore
 *  - City dot marker with name label
 */
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, CloudRain, Cloud, Wind, Thermometer, Gauge } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { ReactNode } from 'react'

/* ─── City marker dot ───────────────────────────────────────────────────── */
const cityDot = L.divIcon({
  className: '',
  html: `<div style="
    width:14px;height:14px;border-radius:50%;
    background:#3B82F6;border:2.5px solid rgba(255,255,255,0.95);
    box-shadow:0 0 14px rgba(59,130,246,0.85),0 2px 6px rgba(0,0,0,0.40);
  "></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  popupAnchor: [0, -10],
})

/* ─── Layer definitions ──────────────────────────────────────────────────── */
type LayerKey = 'precipitation_new' | 'clouds_new' | 'wind_new' | 'temp_new' | 'pressure_new'

interface LayerDef {
  key:         LayerKey
  label:       string
  icon:        ReactNode
  color:       string
  description: string            // plain-English explanation
  legendGrad:  string            // CSS gradient representing the colour scale
  legendMin:   string
  legendMax:   string
}

const LAYERS: LayerDef[] = [
  {
    key:         'precipitation_new',
    label:       'Rain',
    icon:        <CloudRain className="w-3 h-3" />,
    color:       '#3B82F6',
    description: 'Shows where it is raining. Darker blue means heavier rainfall.',
    legendGrad:  'linear-gradient(to right,rgba(40,80,255,0.05),rgba(40,120,255,0.55),rgba(20,40,200,0.95))',
    legendMin:   'No rain',
    legendMax:   'Heavy rain',
  },
  {
    key:         'clouds_new',
    label:       'Clouds',
    icon:        <Cloud className="w-3 h-3" />,
    color:       '#94A3B8',
    description: 'Shows cloud cover. White / grey areas are overcast, clear means no clouds.',
    legendGrad:  'linear-gradient(to right,rgba(255,255,255,0.05),rgba(200,210,220,0.55),rgba(150,163,184,0.95))',
    legendMin:   'Clear sky',
    legendMax:   'Overcast',
  },
  {
    key:         'wind_new',
    label:       'Wind',
    icon:        <Wind className="w-3 h-3" />,
    color:       '#10B981',
    description: 'Shows wind speed. Blue = calm breeze, yellow = strong, red = very strong.',
    legendGrad:  'linear-gradient(to right,#3B82F6,#10B981,#F59E0B,#EF4444)',
    legendMin:   'Calm',
    legendMax:   'Strong',
  },
  {
    key:         'temp_new',
    label:       'Temp',
    icon:        <Thermometer className="w-3 h-3" />,
    color:       '#F59E0B',
    description: 'Shows surface temperature. Blue = cold, yellow = warm, red = very hot.',
    legendGrad:  'linear-gradient(to right,#60A5FA,#34D399,#FCD34D,#F97316,#EF4444)',
    legendMin:   'Cold',
    legendMax:   'Hot',
  },
  {
    key:         'pressure_new',
    label:       'Pressure',
    icon:        <Gauge className="w-3 h-3" />,
    color:       '#8B5CF6',
    description: 'Shows atmospheric pressure. Low pressure = stormy weather, high = fair skies.',
    legendGrad:  'linear-gradient(to right,#8B5CF6,#6366F1,#3B82F6,#06B6D4,#10B981)',
    legendMin:   'Low (storm)',
    legendMax:   'High (fair)',
  },
]

/* ─── Re-centre map when city changes ──────────────────────────────────── */
function MapFlyTo({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap()
  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) {
      map.setView([lat, lon], map.getZoom(), { animate: false })
      firstRender.current = false
    } else {
      map.flyTo([lat, lon], map.getZoom(), { duration: 1.2 })
    }
  }, [lat, lon, map])
  return null
}

/* ─── Invalidate tile grid after spring animation settles ───────────────── */
function MapInvalidate({ trigger }: { trigger: boolean }) {
  const map = useMap()
  useEffect(() => {
    if (!trigger) return
    const id = setTimeout(() => map.invalidateSize(), 420)
    return () => clearTimeout(id)
  }, [trigger, map])
  return null
}

/* ─── Props ─────────────────────────────────────────────────────────────── */
interface WeatherMapProps {
  lat:      number
  lon:      number
  cityName: string
  isDark:   boolean
  isOpen:   boolean
  onClose:  () => void
}

/* ─── Component ─────────────────────────────────────────────────────────── */
export function WeatherMap({ lat, lon, cityName, isDark, isOpen, onClose }: WeatherMapProps) {
  const [activeLayer, setActiveLayer] = useState<LayerKey>('precipitation_new')
  const [everOpened,  setEverOpened]  = useState(false)

  useEffect(() => { if (isOpen) setEverOpened(true) }, [isOpen])

  const apiKey = import.meta.env.VITE_OPENWEATHERMAP_API_KEY as string | undefined

  const baseTile = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'

  const wxTile = apiKey
    ? `https://tile.openweathermap.org/map/${activeLayer}/{z}/{x}/{y}.png?appid=${apiKey}`
    : null

  const active = LAYERS.find((l) => l.key === activeLayer)!

  const headerBg = isDark ? 'rgba(5,8,20,0.94)' : 'rgba(255,255,255,0.94)'
  const borderCol = isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)'

  return (
    <>
      {/* ── Backdrop ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="map-backdrop"
            className="fixed inset-0 z-30"
            style={{ background: 'rgba(0,0,0,0.52)', backdropFilter: 'blur(4px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* ── Slide-up panel — stays mounted after first open ───────────── */}
      {everOpened && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 z-40 flex flex-col"
          style={{
            /* Compact drawer: ~40 % of viewport, never > 500 px */
            height: 'clamp(300px, 42vh, 500px)',
            borderRadius: '18px 18px 0 0',
            overflow: 'hidden',
            boxShadow: '0 -8px 40px rgba(0,0,0,0.45)',
          }}
          animate={{ y: isOpen ? 0 : '100%' }}
          initial={false}
          transition={{ type: 'spring', damping: 32, stiffness: 300 }}
        >

          {/* ── Header ──────────────────────────────────────────────── */}
          <div
            className="shrink-0 flex flex-col gap-2 px-4 pt-2 pb-3"
            style={{ background: headerBg, backdropFilter: 'blur(28px) saturate(160%)', borderBottom: borderCol }}
          >
            {/* Drag handle */}
            <div className="w-8 h-1 rounded-full bg-[rgba(128,128,128,0.30)] mx-auto" />

            {/* Row 1 — title + close */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <MapPin className="w-4 h-4 text-[#3B82F6] shrink-0" />
                <span className="font-sans text-sm font-semibold text-fg truncate">{cityName}</span>
              </div>
              <button
                onClick={onClose}
                className="text-dim hover:text-fg transition-colors cursor-pointer p-1.5 rounded-xl hover:bg-[rgba(128,128,128,0.12)] shrink-0"
                aria-label="Close map"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Row 2 — layer selector tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
              {LAYERS.map((l) => (
                <motion.button
                  key={l.key}
                  onClick={() => setActiveLayer(l.key)}
                  whileTap={{ scale: 0.93 }}
                  className="flex items-center gap-1.5 font-sans text-[11px] font-medium px-3 py-1.5 rounded-full transition-colors cursor-pointer shrink-0"
                  style={
                    activeLayer === l.key
                      ? { background: l.color, color: '#fff' }
                      : { background: 'rgba(128,128,128,0.12)', color: 'var(--text-muted)' }
                  }
                >
                  {l.icon}
                  {l.label}
                </motion.button>
              ))}
            </div>

            {/* Row 3 — active layer description + colour legend */}
            <motion.div
              key={activeLayer}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-1.5"
            >
              {/* Plain-English description */}
              <p className="font-sans text-[11px] text-dim leading-snug">
                <span className="font-medium" style={{ color: active.color }}>{active.label}: </span>
                {active.description}
              </p>

              {/* Colour legend bar */}
              <div className="flex items-center gap-2">
                <span className="font-sans text-[10px] text-dim shrink-0">{active.legendMin}</span>
                <div
                  className="flex-1 h-2 rounded-full"
                  style={{ background: active.legendGrad }}
                />
                <span className="font-sans text-[10px] text-dim shrink-0">{active.legendMax}</span>
              </div>
            </motion.div>
          </div>

          {/* ── Map ─────────────────────────────────────────────────── */}
          <div className="flex-1 relative" style={{ minHeight: 0 }}>
            <MapContainer
              center={[lat, lon]}
              zoom={8}
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
              attributionControl={false}
            >
              <MapFlyTo lat={lat} lon={lon} />
              <MapInvalidate trigger={isOpen} />

              {/* Zoom control — bottom-left so it doesn't overlap attribution */}
              <ZoomControl position="bottomleft" />

              {/* Base tile */}
              <TileLayer
                key={`base-${isDark ? 'dk' : 'lt'}`}
                url={baseTile}
                maxZoom={19}
                subdomains="abcd"
              />

              {/* OWM weather overlay */}
              {wxTile && (
                <TileLayer
                  key={`wx-${activeLayer}`}
                  url={wxTile}
                  opacity={0.68}
                  maxZoom={19}
                />
              )}

              {/* City marker with name popup */}
              <Marker position={[lat, lon]} icon={cityDot}>
                <Popup
                  className="wx-popup"
                  closeButton={false}
                  offset={[0, -4]}
                >
                  <span style={{ fontFamily: 'Fira Sans, sans-serif', fontSize: 12, fontWeight: 600 }}>
                    {cityName}
                  </span>
                </Popup>
              </Marker>
            </MapContainer>

            {/* Attribution */}
            <div
              className="absolute bottom-2 right-2 z-[1000] font-sans text-[9px] pointer-events-none select-none"
              style={{ background: 'rgba(0,0,0,0.52)', color: 'rgba(255,255,255,0.62)',
                padding: '2px 7px', borderRadius: 4 }}
            >
              © CARTO · OSM · OpenWeatherMap
            </div>

            {/* No OWM overlay hint */}
            {!apiKey && (
              <div
                className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] font-sans text-xs text-[#F59E0B] text-center pointer-events-none"
                style={{ background: 'rgba(0,0,0,0.70)', padding: '5px 14px', borderRadius: 8,
                  whiteSpace: 'nowrap' }}
              >
                🗺 Base map shown — add API key to see weather overlay
              </div>
            )}
          </div>
        </motion.div>
      )}
    </>
  )
}

export default WeatherMap
