/**
 * WeatherMap — centered floating window with interactive Leaflet map.
 *
 * Design:
 *  - Centered modal (not a bottom-sheet) — scale + fade animation
 *  - Width: min(92vw, 940px)  Height: min(85vh, 700px)
 *  - Glass card styling to match the rest of the dashboard
 *  - Plain-English layer descriptions + colour-scale legend so any user
 *    understands what they're looking at
 *  - MapContainer stays mounted after first open to avoid Leaflet re-init
 */
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  X, MapPin, CloudRain, Cloud, Wind, Thermometer, Gauge,
  ZoomIn, ZoomOut,
} from 'lucide-react'
import {
  MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents,
} from 'react-leaflet'
import L from 'leaflet'
import type { ReactNode } from 'react'

/* ─── City marker ───────────────────────────────────────────────────────── */
const cityDot = L.divIcon({
  className: '',
  html: `<div style="
    width:16px;height:16px;border-radius:50%;
    background:#3B82F6;border:3px solid rgba(255,255,255,0.95);
    box-shadow:0 0 18px rgba(59,130,246,0.9),0 3px 8px rgba(0,0,0,0.40);
  "></div>`,
  iconSize:   [16, 16],
  iconAnchor: [8, 8],
  popupAnchor:[0, -12],
})

/* ─── Layer definitions ──────────────────────────────────────────────────── */
type LayerKey = 'precipitation_new' | 'clouds_new' | 'wind_new' | 'temp_new' | 'pressure_new'

interface LayerDef {
  key:         LayerKey
  label:       string
  icon:        ReactNode
  color:       string
  description: string
  legendGrad:  string
  legendMin:   string
  legendMax:   string
}

const LAYERS: LayerDef[] = [
  {
    key:         'precipitation_new',
    label:       'Rain',
    icon:        <CloudRain className="w-3.5 h-3.5" />,
    color:       '#3B82F6',
    description: 'Shows where it is currently raining. Darker blue = heavier rainfall.',
    legendGrad:  'linear-gradient(to right,rgba(59,130,246,0.08),rgba(59,130,246,0.55),rgba(29,78,216,0.95))',
    legendMin:   'No rain',
    legendMax:   'Heavy rain',
  },
  {
    key:         'clouds_new',
    label:       'Clouds',
    icon:        <Cloud className="w-3.5 h-3.5" />,
    color:       '#94A3B8',
    description: 'Shows cloud coverage. White / grey = overcast sky, transparent = clear.',
    legendGrad:  'linear-gradient(to right,rgba(248,250,252,0.05),rgba(203,213,225,0.5),rgba(148,163,184,0.92))',
    legendMin:   'Clear',
    legendMax:   'Overcast',
  },
  {
    key:         'wind_new',
    label:       'Wind',
    icon:        <Wind className="w-3.5 h-3.5" />,
    color:       '#10B981',
    description: 'Shows wind speed across the map. Blue = gentle, yellow = strong, red = storm.',
    legendGrad:  'linear-gradient(to right,#3B82F6,#10B981,#F59E0B,#EF4444)',
    legendMin:   'Calm',
    legendMax:   'Storm',
  },
  {
    key:         'temp_new',
    label:       'Temp',
    icon:        <Thermometer className="w-3.5 h-3.5" />,
    color:       '#F59E0B',
    description: 'Shows surface temperature. Blue = cold, green = mild, red = very hot.',
    legendGrad:  'linear-gradient(to right,#60A5FA,#34D399,#FCD34D,#F97316,#EF4444)',
    legendMin:   'Cold',
    legendMax:   'Very hot',
  },
  {
    key:         'pressure_new',
    label:       'Pressure',
    icon:        <Gauge className="w-3.5 h-3.5" />,
    color:       '#8B5CF6',
    description: 'Atmospheric pressure. Low = stormy / rainy conditions, high = fair clear skies.',
    legendGrad:  'linear-gradient(to right,#8B5CF6,#6366F1,#3B82F6,#06B6D4,#10B981)',
    legendMin:   'Low (storm)',
    legendMax:   'High (fair)',
  },
]

/* ─── Map helpers ────────────────────────────────────────────────────────── */
function MapFlyTo({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap()
  const first = useRef(true)
  useEffect(() => {
    if (first.current) { map.setView([lat, lon], map.getZoom(), { animate: false }); first.current = false }
    else { map.flyTo([lat, lon], map.getZoom(), { duration: 1.2 }) }
  }, [lat, lon, map])
  return null
}

function MapInvalidate({ trigger }: { trigger: boolean }) {
  const map = useMap()
  useEffect(() => {
    if (!trigger) return
    const id = setTimeout(() => map.invalidateSize(), 380)
    return () => clearTimeout(id)
  }, [trigger, map])
  return null
}

/** Expose zoom controls outside MapContainer via imperative ref */
function ZoomBridge({ onReady }: { onReady: (m: L.Map) => void }) {
  const map = useMapEvents({})
  useEffect(() => { onReady(map) }, [map, onReady])
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
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => { if (isOpen) setEverOpened(true) }, [isOpen])

  const apiKey  = import.meta.env.VITE_OPENWEATHERMAP_API_KEY as string | undefined
  const baseTile = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
  const wxTile = apiKey
    ? `https://tile.openweathermap.org/map/${activeLayer}/{z}/{x}/{y}.png?appid=${apiKey}`
    : null

  const active     = LAYERS.find((l) => l.key === activeLayer)!
  const headerBg   = isDark ? 'rgba(8,12,28,0.96)'      : 'rgba(255,255,255,0.96)'
  const borderCol  = isDark ? 'rgba(255,255,255,0.08)'   : 'rgba(0,0,0,0.08)'
  const windowBg   = isDark ? 'rgba(4,8,20,0.98)'        : 'rgba(248,250,252,0.98)'

  return (
    /* ── Outer layer — covers full viewport, controls pointer events ─── */
    <div
      className="fixed inset-0 z-40 flex items-center justify-center"
      style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
    >
      {/* ── Backdrop ────────────────────────────────────────────────── */}
      <motion.div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.60)', backdropFilter: 'blur(8px)' }}
        animate={{ opacity: isOpen ? 1 : 0 }}
        initial={false}
        transition={{ duration: 0.22 }}
        onClick={onClose}
      />

      {/* ── Floating window ─────────────────────────────────────────── */}
      <motion.div
        className="relative flex flex-col overflow-hidden"
        style={{
          width:        'min(96vw, 940px)',
          height:       'min(92vh, 700px)',
          borderRadius: 24,
          background:   windowBg,
          border:       `1px solid ${borderCol}`,
          boxShadow:    '0 32px 96px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.06)',
        }}
        animate={isOpen
          ? { opacity: 1, scale: 1,    y: 0   }
          : { opacity: 0, scale: 0.88, y: 28  }
        }
        initial={false}
        transition={{ type: 'spring', damping: 26, stiffness: 300 }}
      >

        {/* ── Window title bar ──────────────────────────────────────── */}
        <div
          className="shrink-0 flex items-center justify-between gap-3 px-3 sm:px-5 py-2.5 sm:py-3.5"
          style={{
            background:   headerBg,
            borderBottom: `1px solid ${borderCol}`,
          }}
        >
          {/* Left: location */}
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="flex items-center justify-center w-7 h-7 rounded-xl shrink-0"
              style={{ background: 'rgba(59,130,246,0.15)' }}
            >
              <MapPin className="w-3.5 h-3.5 text-[#3B82F6]" />
            </div>
            <div className="min-w-0">
              <p className="font-sans text-sm font-semibold text-fg truncate leading-tight">
                {cityName}
              </p>
              <p className="font-sans text-[10px] text-dim leading-tight">Weather Map</p>
            </div>
          </div>

          {/* Right: zoom controls + close */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => mapRef.current?.zoomIn()}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-dim hover:text-fg hover:bg-[rgba(128,128,128,0.12)] transition-colors cursor-pointer"
              aria-label="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => mapRef.current?.zoomOut()}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-dim hover:text-fg hover:bg-[rgba(128,128,128,0.12)] transition-colors cursor-pointer"
              aria-label="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-5 bg-[rgba(128,128,128,0.20)] mx-1" />
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-dim hover:text-fg hover:bg-[rgba(128,128,128,0.12)] transition-colors cursor-pointer"
              aria-label="Close map"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Layer selector + legend ───────────────────────────────── */}
        <div
          className="shrink-0 flex flex-col gap-2 sm:gap-2.5 px-3 sm:px-5 py-2 sm:py-3"
          style={{ borderBottom: `1px solid ${borderCol}`, background: headerBg }}
        >
          {/* Layer tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
            {LAYERS.map((l) => (
              <motion.button
                key={l.key}
                onClick={() => setActiveLayer(l.key)}
                whileTap={{ scale: 0.93 }}
                className="flex items-center gap-1.5 font-sans text-xs font-medium px-3.5 py-1.5 rounded-full transition-all cursor-pointer shrink-0 border"
                style={
                  activeLayer === l.key
                    ? { background: l.color, color: '#fff', borderColor: 'transparent',
                        boxShadow: `0 0 14px ${l.color}55` }
                    : { background: 'transparent', color: 'var(--text-muted)',
                        borderColor: borderCol }
                }
              >
                {l.icon}
                {l.label}
              </motion.button>
            ))}
          </div>

          {/* Active layer description + colour legend */}
          <motion.div
            key={activeLayer}
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className="flex flex-col gap-1.5"
          >
            <p className="font-sans text-[11px] text-dim leading-snug">
              <span className="font-semibold" style={{ color: active.color }}>
                {active.label}:{' '}
              </span>
              {active.description}
            </p>
            <div className="flex items-center gap-2.5">
              <span className="font-sans text-[10px] text-dim shrink-0 w-10 sm:w-14 text-right">
                {active.legendMin}
              </span>
              <div className="flex-1 h-2 rounded-full" style={{ background: active.legendGrad }} />
              <span className="font-sans text-[10px] text-dim shrink-0 w-10 sm:w-14">
                {active.legendMax}
              </span>
            </div>
          </motion.div>
        </div>

        {/* ── Map area ──────────────────────────────────────────────── */}
        <div className="flex-1 relative" style={{ minHeight: 0 }}>
          {everOpened && (
            <MapContainer
              center={[lat, lon]}
              zoom={8}
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
              attributionControl={false}
            >
              <MapFlyTo lat={lat} lon={lon} />
              <MapInvalidate trigger={isOpen} />
              <ZoomBridge onReady={(m) => { mapRef.current = m }} />

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
                  opacity={0.65}
                  maxZoom={19}
                />
              )}

              {/* City marker */}
              <Marker position={[lat, lon]} icon={cityDot}>
                <Popup closeButton={false} offset={[0, -6]}>
                  <span style={{ fontFamily: 'Fira Sans,sans-serif', fontSize: 12, fontWeight: 600 }}>
                    {cityName}
                  </span>
                </Popup>
              </Marker>
            </MapContainer>
          )}

          {/* Attribution */}
          <div
            className="absolute bottom-2 right-3 z-[1000] font-sans text-[9px] pointer-events-none select-none px-2 py-0.5 rounded"
            style={{ background: 'rgba(0,0,0,0.55)', color: 'rgba(255,255,255,0.60)' }}
          >
            © CARTO · OSM · OpenWeatherMap
          </div>

          {/* No overlay key hint */}
          {!apiKey && (
            <div
              className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] font-sans text-xs text-center pointer-events-none px-4 py-1.5 rounded-full"
              style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B',
                border: '1px solid rgba(245,158,11,0.30)', whiteSpace: 'nowrap' }}
            >
              Add API key to see weather overlay
            </div>
          )}
        </div>

      </motion.div>
    </div>
  )
}

export default WeatherMap
