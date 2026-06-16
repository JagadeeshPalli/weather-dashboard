/**
 * AirQualityCard — glass card showing AQI badge + 5 pollutant progress bars.
 *
 * Data source: OWM /data/2.5/air_pollution (free, same API key).
 * AQI scale 1–5: Good · Fair · Moderate · Poor · Very Poor.
 * Cached 30 min in localStorage via useAirQuality hook.
 */
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Wind, Leaf } from 'lucide-react'
import { useAirQuality } from '../hooks/useAirQuality'
import { TiltCard } from './TiltCard'
import type { AirQualityComponents } from '../types/weather'

/* ─── AQI meta ──────────────────────────────────────────────────────────── */
const AQI_META = [
  { label: 'Good',      color: '#22C55E', bg: 'rgba(34,197,94,0.12)',   ring: 'rgba(34,197,94,0.5)'  },
  { label: 'Fair',      color: '#EAB308', bg: 'rgba(234,179,8,0.12)',   ring: 'rgba(234,179,8,0.5)'  },
  { label: 'Moderate',  color: '#F97316', bg: 'rgba(249,115,22,0.12)',  ring: 'rgba(249,115,22,0.5)' },
  { label: 'Poor',      color: '#EF4444', bg: 'rgba(239,68,68,0.12)',   ring: 'rgba(239,68,68,0.5)'  },
  { label: 'Very Poor', color: '#A855F7', bg: 'rgba(168,85,247,0.12)',  ring: 'rgba(168,85,247,0.5)' },
]

const AQI_DESCRIPTION = [
  'Air quality is satisfactory — no health risk.',
  'Acceptable quality — minor concern for sensitive groups.',
  'Sensitive groups may experience effects.',
  'Health effects for everyone; serious for sensitive groups.',
  'Emergency conditions — everyone is affected.',
]

/* ─── Pollutant definitions ─────────────────────────────────────────────── */
interface Pollutant {
  key:   keyof AirQualityComponents
  label: string
  unit:  string
  max:   number  // µg/m³ — EU guideline upper limit used for bar scaling
}

const POLLUTANTS: Pollutant[] = [
  { key: 'pm2_5', label: 'PM2.5', unit: 'µg/m³', max: 75   },
  { key: 'pm10',  label: 'PM10',  unit: 'µg/m³', max: 150  },
  { key: 'no2',   label: 'NO₂',   unit: 'µg/m³', max: 200  },
  { key: 'o3',    label: 'O₃',    unit: 'µg/m³', max: 180  },
  { key: 'co',    label: 'CO',    unit: 'µg/m³', max: 10000 },
]

/* ─── Pollutant bar row ─────────────────────────────────────────────────── */
function PollutantBar({
  pollutant, value, aqiColor, delay,
}: {
  pollutant: Pollutant
  value:     number
  aqiColor:  string
  delay:     number
}) {
  const pct = Math.min(100, (value / pollutant.max) * 100)

  return (
    <div className="flex items-center gap-2.5">
      <span className="font-code text-[10px] text-dim w-10 shrink-0 text-right">
        {pollutant.label}
      </span>
      <div className="flex-1 h-1.5 rounded-full bg-[rgba(128,128,128,0.12)] overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: aqiColor }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, delay, ease: 'easeOut' }}
        />
      </div>
      <span className="font-code text-[10px] text-dim w-20 shrink-0">
        {value < 10 ? value.toFixed(2) : Math.round(value)} {pollutant.unit}
      </span>
    </div>
  )
}

/* ─── AQI ring badge ────────────────────────────────────────────────────── */
function AqiBadge({ aqi, meta }: { aqi: number; meta: typeof AQI_META[0] }) {
  const r = 30; const circ = 2 * Math.PI * r
  const dashOffset = circ * (1 - aqi / 5)

  return (
    <div className="flex flex-col items-center gap-1 shrink-0">
      <div className="relative w-[84px] h-[84px]">
        {/* Background ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={r} fill="none"
            stroke="rgba(128,128,128,0.12)" strokeWidth="6" />
          <motion.circle
            cx="40" cy="40" r={r} fill="none"
            stroke={meta.color} strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </svg>
        {/* Center number */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-code text-2xl font-bold leading-none"
            style={{ color: meta.color }}
          >
            {aqi}
          </span>
          <span className="font-sans text-[8px] text-dim leading-tight">/ 5</span>
        </div>
      </div>
      {/* Label pill */}
      <span
        className="font-sans text-[10px] font-semibold px-2.5 py-0.5 rounded-full"
        style={{ background: meta.bg, color: meta.color }}
      >
        {meta.label}
      </span>
    </div>
  )
}

/* ─── Props ─────────────────────────────────────────────────────────────── */
interface AirQualityCardProps {
  lat:    number
  lon:    number
  isDark: boolean
}

/* ─── Main component ────────────────────────────────────────────────────── */
export function AirQualityCard({ lat, lon, isDark: _isDark }: AirQualityCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const { data, loading, error } = useAirQuality(lat, lon)

  /* ── Skeleton while loading ── */
  if (loading) {
    return (
      <div ref={ref} className="glass-card animate-pulse h-[120px]" aria-label="Loading air quality" />
    )
  }

  /* ── Silently skip on error (non-critical widget) ── */
  if (error || !data || !data.list.length) return null

  const entry  = data.list[0]
  const aqi    = entry.main.aqi
  const comps  = entry.components
  const meta   = AQI_META[aqi - 1]
  const desc   = AQI_DESCRIPTION[aqi - 1]

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <TiltCard className="glass-card">
        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div
              className="flex items-center justify-center w-7 h-7 rounded-xl shrink-0"
              style={{ background: meta.bg }}
            >
              <Wind className="w-3.5 h-3.5" style={{ color: meta.color }} />
            </div>
            <div>
              <p className="font-sans text-sm font-semibold text-fg leading-tight">Air Quality</p>
              <p className="font-sans text-[10px] text-dim leading-tight">Real-time · OWM AQI</p>
            </div>
          </div>
          {/* Leaf icon — decorative quality indicator */}
          <Leaf
            className="w-4 h-4 shrink-0 opacity-50"
            style={{ color: meta.color }}
          />
        </div>

        {/* ── Body: badge + pollutants ── */}
        <div className="flex items-start gap-5">
          {/* Left: AQI ring + description */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            <AqiBadge aqi={aqi} meta={meta} />
            <p className="font-sans text-[9px] text-dim text-center max-w-[90px] leading-relaxed">
              {desc}
            </p>
          </div>

          {/* Right: pollutant bars */}
          <div className="flex-1 flex flex-col gap-2 pt-1 min-w-0">
            {POLLUTANTS.map((p, i) => (
              <PollutantBar
                key={p.key}
                pollutant={p}
                value={comps[p.key]}
                aqiColor={meta.color}
                delay={0.1 + i * 0.07}
              />
            ))}
          </div>
        </div>
      </TiltCard>
    </motion.div>
  )
}
