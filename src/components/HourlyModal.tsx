/**
 * HourlyModal — floating window showing full hourly breakdown for a selected day.
 *
 * Triggered by clicking a ForecastCard. Uses the same floating-window pattern
 * as WeatherMap (scale + fade spring, centered, glass border).
 *
 * Data: filtered slice of forecast.list for the selected date — no new API call.
 */
import { memo } from 'react'
import { motion } from 'framer-motion'
import { X, Droplets, Wind, Thermometer, Calendar } from 'lucide-react'
import type { ForecastItem } from '../types/weather'

/* ─── Time formatting ───────────────────────────────────────────────────── */
function formatHour(dtTxt: string): string {
  const h = parseInt(dtTxt.slice(11, 13), 10)
  if (h === 0)  return '12 AM'
  if (h < 12)   return `${h} AM`
  if (h === 12) return '12 PM'
  return `${h - 12} PM`
}

function formatDayFull(date: string): string {
  return new Date(date + 'T12:00:00Z').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC',
  })
}

/* ─── SVG temperature sparkline ─────────────────────────────────────────── */
function TempSparkline({
  items, unit, isDark,
}: { items: ForecastItem[]; unit: 'C' | 'F'; isDark: boolean }) {
  if (items.length < 2) return null
  const temps = items.map((i) => i.main.temp)
  const lo = Math.min(...temps)
  const hi = Math.max(...temps)
  const range = hi - lo || 1
  const W = 500; const H = 72; const PAD = 16

  const pts = temps.map((t, i) => ({
    x: PAD + (i / (temps.length - 1)) * (W - PAD * 2),
    y: PAD + (1 - (t - lo) / range) * (H - PAD * 2),
    t,
  }))

  // Smooth cubic-bezier path
  const linePath = pts.reduce((acc, pt, i) => {
    if (i === 0) return `M${pt.x},${pt.y}`
    const prev = pts[i - 1]
    const cpx = (prev.x + pt.x) / 2
    return `${acc} C${cpx},${prev.y} ${cpx},${pt.y} ${pt.x},${pt.y}`
  }, '')
  const fillPath = `${linePath} L${pts[pts.length - 1].x},${H + 4} L${pts[0].x},${H + 4} Z`

  const sym = unit === 'C' ? '°C' : '°F'
  const lineColor = isDark ? '#60A5FA' : '#2563EB'

  return (
    <div className="relative w-full px-4 py-2">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height: 72, overflow: 'visible' }}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="hm-spark-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lineColor} stopOpacity="0.22" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0.01" />
          </linearGradient>
        </defs>
        {/* Gradient fill */}
        <path d={fillPath} fill="url(#hm-spark-fill)" />
        {/* Line */}
        <path d={linePath} fill="none" stroke={lineColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Dots */}
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3.5" fill={lineColor} />
        ))}
      </svg>
      {/* Min / max labels */}
      <div className="flex justify-between mt-0.5 px-1">
        <span className="font-code text-[10px] text-dim">
          ↓ {Math.round(lo)}{sym}
        </span>
        <span className="font-sans text-[10px] text-dim">Temperature trend</span>
        <span className="font-code text-[10px] text-dim">
          ↑ {Math.round(hi)}{sym}
        </span>
      </div>
    </div>
  )
}

/* ─── Single hourly row ─────────────────────────────────────────────────── */
const HourlyRow = memo(function HourlyRow({
  item, unit, isDark, isFirst,
}: { item: ForecastItem; unit: 'C' | 'F'; isDark: boolean; isFirst: boolean }) {
  const sym   = unit === 'C' ? '°' : '°'
  const speed = unit === 'C' ? `${item.wind.speed.toFixed(1)} m/s` : `${item.wind.speed.toFixed(1)} mph`
  const pop   = Math.round(item.pop * 100)
  const cond  = item.weather[0]
  const iconUrl = `https://openweathermap.org/img/wn/${cond.icon}@2x.png`
  const hour  = formatHour(item.dt_txt)
  const divCol = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'

  return (
    <div
      className="flex items-center gap-3 px-5 py-3 hover:bg-[rgba(128,128,128,0.06)] transition-colors"
      style={{ borderTop: isFirst ? 'none' : `1px solid ${divCol}` }}
    >
      {/* Time */}
      <span className="font-code text-xs text-dim w-12 shrink-0 text-right">
        {hour}
      </span>

      {/* Weather icon + condition */}
      <div className="flex items-center gap-1.5 w-28 shrink-0">
        <img src={iconUrl} alt={cond.description} className="w-8 h-8 shrink-0" loading="lazy" />
        <span className="font-sans text-[10px] text-dim capitalize leading-tight line-clamp-2">
          {cond.description}
        </span>
      </div>

      {/* Temperature */}
      <div className="flex items-center gap-1 w-16 shrink-0">
        <Thermometer className="w-3 h-3 text-[#F59E0B] shrink-0" />
        <span className="font-code text-sm font-semibold text-fg">
          {Math.round(item.main.temp)}{sym}
        </span>
      </div>

      {/* Feels like */}
      <span className="font-sans text-xs text-dim w-16 shrink-0 hidden sm:block">
        Feels {Math.round(item.main.feels_like)}{sym}
      </span>

      {/* Rain probability */}
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        <Droplets
          className="w-3 h-3 shrink-0"
          style={{ color: pop > 0 ? '#3B82F6' : 'var(--text-muted)' }}
        />
        <div className="flex-1 h-1.5 rounded-full bg-[rgba(128,128,128,0.12)] overflow-hidden min-w-[40px] max-w-[80px]">
          {pop > 0 && (
            <motion.div
              className="h-full rounded-full bg-[#3B82F6]"
              initial={{ width: 0 }}
              animate={{ width: `${pop}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          )}
        </div>
        <span
          className="font-code text-[10px] w-7 shrink-0"
          style={{ color: pop > 0 ? '#3B82F6' : 'var(--text-muted)' }}
        >
          {pop}%
        </span>
      </div>

      {/* Wind */}
      <div className="flex items-center gap-1 shrink-0 hidden xs:flex">
        <Wind className="w-3 h-3 text-dim shrink-0" />
        <span className="font-code text-xs text-dim">{speed}</span>
      </div>

      {/* Humidity */}
      <span className="font-code text-xs text-dim w-8 shrink-0 text-right hidden md:block">
        {item.main.humidity}%
      </span>
    </div>
  )
})

/* ─── Props ─────────────────────────────────────────────────────────────── */
interface HourlyModalProps {
  items:    ForecastItem[]   // already filtered to selected day
  date:     string           // "YYYY-MM-DD"
  unit:     'C' | 'F'
  isDark:   boolean
  isOpen:   boolean
  onClose:  () => void
}

/* ─── Main component ────────────────────────────────────────────────────── */
export function HourlyModal({ items, date, unit, isDark, isOpen, onClose }: HourlyModalProps) {
  if (!date) return null

  const rep       = items.find((i) => i.dt_txt.includes('12:00')) ?? items[Math.floor(items.length / 2)]
  const iconUrl   = rep ? `https://openweathermap.org/img/wn/${rep.weather[0].icon}@2x.png` : ''
  const dayLabel  = formatDayFull(date)

  const headerBg  = isDark ? 'rgba(8,12,28,0.96)'    : 'rgba(255,255,255,0.96)'
  const windowBg  = isDark ? 'rgba(4,8,20,0.98)'      : 'rgba(248,250,252,0.98)'
  const borderCol = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.62)', backdropFilter: 'blur(8px)' }}
        animate={{ opacity: isOpen ? 1 : 0 }}
        initial={false}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      />

      {/* Floating window */}
      <motion.div
        className="relative flex flex-col overflow-hidden"
        style={{
          width:        'min(94vw, 760px)',
          height:       'min(84vh, 620px)',
          borderRadius: 24,
          background:   windowBg,
          border:       `1px solid ${borderCol}`,
          boxShadow:    '0 32px 96px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.06)',
          zIndex:       1,
        }}
        animate={isOpen
          ? { opacity: 1, scale: 1,    y: 0  }
          : { opacity: 0, scale: 0.88, y: 28 }
        }
        initial={false}
        transition={{ type: 'spring', damping: 26, stiffness: 300 }}
      >
        {/* ── Title bar ──────────────────────────────────────────── */}
        <div
          className="shrink-0 flex items-center justify-between gap-3 px-5 py-3.5"
          style={{ background: headerBg, borderBottom: `1px solid ${borderCol}` }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="flex items-center justify-center w-7 h-7 rounded-xl shrink-0"
              style={{ background: 'rgba(59,130,246,0.15)' }}
            >
              <Calendar className="w-3.5 h-3.5 text-[#3B82F6]" />
            </div>
            <div className="min-w-0">
              <p className="font-sans text-sm font-semibold text-fg truncate leading-tight">
                {dayLabel}
              </p>
              <p className="font-sans text-[10px] text-dim leading-tight">
                Hourly forecast · {items.length} time slots
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {rep && (
              <img src={iconUrl} alt={rep.weather[0].description}
                className="w-9 h-9 drop-shadow-md" loading="lazy" />
            )}
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-dim hover:text-fg hover:bg-[rgba(128,128,128,0.12)] transition-colors cursor-pointer ml-1"
              aria-label="Close hourly view"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Temperature sparkline ─────────────────────────────── */}
        <div
          className="shrink-0"
          style={{ borderBottom: `1px solid ${borderCol}`, background: headerBg }}
        >
          <TempSparkline items={items} unit={unit} isDark={isDark} />
        </div>

        {/* ── Column headers ────────────────────────────────────── */}
        <div
          className="shrink-0 flex items-center gap-3 px-5 py-2"
          style={{ borderBottom: `1px solid ${borderCol}`, background: headerBg }}
        >
          <span className="font-sans text-[9px] text-dim uppercase tracking-wider w-12 text-right">Time</span>
          <span className="font-sans text-[9px] text-dim uppercase tracking-wider w-28">Condition</span>
          <span className="font-sans text-[9px] text-dim uppercase tracking-wider w-16">Temp</span>
          <span className="font-sans text-[9px] text-dim uppercase tracking-wider w-16 hidden sm:block">Feels like</span>
          <span className="font-sans text-[9px] text-dim uppercase tracking-wider flex-1">Rain chance</span>
          <span className="font-sans text-[9px] text-dim uppercase tracking-wider hidden xs:block">Wind</span>
          <span className="font-sans text-[9px] text-dim uppercase tracking-wider w-8 text-right hidden md:block">Hum.</span>
        </div>

        {/* ── Hourly rows (scrollable) ───────────────────────────── */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {items.map((item, i) => (
            <HourlyRow
              key={item.dt}
              item={item}
              unit={unit}
              isDark={isDark}
              isFirst={i === 0}
            />
          ))}
        </div>
      </motion.div>
    </div>
  )
}
