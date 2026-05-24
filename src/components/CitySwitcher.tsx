/**
 * CitySwitcher — slide-in left drawer for saved-city quick-switch.
 *
 * Manages its own isOpen state (App only needs to know about city selection).
 * Trigger: LayoutGrid button injected into ControlsWidget via onCitiesOpen prop,
 * but this component renders the full drawer + backdrop.
 */
import { memo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, MapPin, LayoutGrid } from 'lucide-react'
import type { SavedCity } from '../types/weather'

/* ─── Single city card in the drawer ───────────────────────────────────── */
const CityCard = memo(function CityCard({
  city,
  isActive,
  unit,
  onSelect,
  onRemove,
  isDark,
}: {
  city:     SavedCity
  isActive: boolean
  unit:     'C' | 'F'
  onSelect: () => void
  onRemove: () => void
  isDark:   boolean
}) {
  const iconUrl = city.snap?.icon
    ? `https://openweathermap.org/img/wn/${city.snap.icon}.png`
    : null

  // Show snap temp in the requested unit (convert if mismatch)
  let tempDisplay: string | null = null
  if (city.snap) {
    let t = city.snap.temp
    if (city.snap.unit !== unit) {
      t = unit === 'F' ? t * 9 / 5 + 32 : (t - 32) * 5 / 9
    }
    tempDisplay = `${Math.round(t)}°`
  }

  const activeBorder = isDark ? 'rgba(59,130,246,0.5)' : 'rgba(37,99,235,0.5)'
  const hoverBg      = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16, transition: { duration: 0.15 } }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="group relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors"
      style={{
        background:  isActive ? (isDark ? 'rgba(59,130,246,0.1)' : 'rgba(37,99,235,0.08)') : 'transparent',
        border:      `1px solid ${isActive ? activeBorder : 'transparent'}`,
      }}
      onClick={onSelect}
      onMouseEnter={(e) => {
        if (!isActive) (e.currentTarget as HTMLElement).style.background = hoverBg
      }}
      onMouseLeave={(e) => {
        if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'
      }}
    >
      {/* Active indicator bar */}
      {isActive && (
        <motion.div
          layoutId="active-bar"
          className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-[#3B82F6]"
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        />
      )}

      {/* Weather icon or pin */}
      <div className="w-8 h-8 flex items-center justify-center shrink-0">
        {iconUrl ? (
          <img src={iconUrl} alt="" className="w-8 h-8" loading="lazy" />
        ) : (
          <MapPin className="w-4 h-4 text-dim" />
        )}
      </div>

      {/* City info */}
      <div className="flex-1 min-w-0">
        <p className="font-sans text-sm font-medium text-fg truncate leading-tight">
          {city.name}
        </p>
        <p className="font-sans text-[10px] text-dim leading-tight">{city.country}</p>
      </div>

      {/* Temp */}
      {tempDisplay && (
        <span className="font-code text-sm font-semibold text-fg shrink-0 mr-1">
          {tempDisplay}
        </span>
      )}

      {/* Remove button — visible on hover */}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove() }}
        className="shrink-0 w-6 h-6 flex items-center justify-center rounded-lg text-dim hover:text-[#EF4444] transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
        aria-label={`Remove ${city.name}`}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  )
})

/* ─── Props ─────────────────────────────────────────────────────────────── */
interface CitySwitcherProps {
  isOpen:        boolean
  onClose:       () => void
  cities:        SavedCity[]
  activeCoords:  { lat: number; lon: number } | null
  unit:          'C' | 'F'
  isDark:        boolean
  onSelect:      (lat: number, lon: number, name: string) => void
  onRemove:      (id: string) => void
}

/* ─── Main drawer ───────────────────────────────────────────────────────── */
export const CitySwitcher = memo(function CitySwitcher({
  isOpen,
  onClose,
  cities,
  activeCoords,
  unit,
  isDark,
  onSelect,
  onRemove,
}: CitySwitcherProps) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (isOpen) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  const panelBg  = isDark ? 'rgba(4,8,20,0.97)'     : 'rgba(248,250,252,0.97)'
  const borderCol = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const headerBg  = isDark ? 'rgba(8,12,28,0.96)'    : 'rgba(255,255,255,0.96)'

  const activeId = activeCoords
    ? `${activeCoords.lat.toFixed(3)}_${activeCoords.lon.toFixed(3)}`
    : null

  return (
    <div
      className="fixed inset-0 z-50"
      style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        animate={{ opacity: isOpen ? 1 : 0 }}
        initial={false}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      />

      {/* Drawer */}
      <motion.div
        className="absolute top-0 left-0 bottom-0 flex flex-col overflow-hidden"
        style={{
          width:      'min(88vw, 300px)',
          background: panelBg,
          border:     `1px solid ${borderCol}`,
          borderLeft: 'none',
          borderRadius: '0 20px 20px 0',
          boxShadow:  '8px 0 48px rgba(0,0,0,0.45)',
        }}
        animate={isOpen ? { x: 0, opacity: 1 } : { x: '-100%', opacity: 0.6 }}
        initial={false}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
      >
        {/* Header */}
        <div
          className="shrink-0 flex items-center justify-between px-4 py-3.5"
          style={{ background: headerBg, borderBottom: `1px solid ${borderCol}` }}
        >
          <div className="flex items-center gap-2">
            <div
              className="flex items-center justify-center w-7 h-7 rounded-xl"
              style={{ background: 'rgba(59,130,246,0.15)' }}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-[#3B82F6]" />
            </div>
            <div>
              <p className="font-sans text-sm font-semibold text-fg leading-tight">My Cities</p>
              <p className="font-sans text-[10px] text-dim leading-tight">
                {cities.length} / 6 saved
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-dim hover:text-fg hover:bg-[rgba(128,128,128,0.12)] transition-colors cursor-pointer"
            aria-label="Close city switcher"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* City list */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-2 py-2">
          <AnimatePresence initial={false}>
            {cities.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center gap-3 pt-12 pb-8 px-4 text-center"
              >
                <div
                  className="w-12 h-12 flex items-center justify-center rounded-2xl"
                  style={{ background: 'rgba(59,130,246,0.1)' }}
                >
                  <MapPin className="w-6 h-6 text-[#3B82F6] opacity-60" />
                </div>
                <p className="font-sans text-sm text-dim leading-relaxed">
                  No saved cities yet.
                </p>
                <p className="font-sans text-[10px] text-dim leading-relaxed opacity-70">
                  Search for a city and it will be saved here automatically.
                </p>
              </motion.div>
            ) : (
              cities.map((city) => (
                <CityCard
                  key={city.id}
                  city={city}
                  isActive={city.id === activeId}
                  unit={unit}
                  isDark={isDark}
                  onSelect={() => { onSelect(city.lat, city.lon, city.name); onClose() }}
                  onRemove={() => onRemove(city.id)}
                />
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Footer hint */}
        <div
          className="shrink-0 px-4 py-3 text-center"
          style={{ borderTop: `1px solid ${borderCol}`, background: headerBg }}
        >
          <p className="font-sans text-[9px] text-dim uppercase tracking-wider opacity-60">
            Auto-saved on search · max 6 cities
          </p>
        </div>
      </motion.div>
    </div>
  )
})
