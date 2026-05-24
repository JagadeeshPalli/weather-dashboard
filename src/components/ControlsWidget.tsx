import { memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon, Map, LayoutGrid } from 'lucide-react'

interface ControlsWidgetProps {
  unit: 'C' | 'F'
  onUnitToggle: () => void
  isDark: boolean
  onThemeToggle: () => void
  /** Pass to show the Map button. Only provided when weather data is loaded. */
  onMapOpen?: () => void
  /** Pass to show the Cities button. Only provided when weather data is loaded. */
  onCitiesOpen?: () => void
  /** Badge count for saved cities */
  citiesCount?: number
}

export const ControlsWidget = memo(function ControlsWidget({
  unit,
  onUnitToggle,
  isDark,
  onThemeToggle,
  onMapOpen,
  onCitiesOpen,
  citiesCount = 0,
}: ControlsWidgetProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.25, type: 'spring', stiffness: 200, damping: 22 }}
      className="fixed top-5 right-5 z-50 flex items-center gap-1.5 sm:gap-2"
    >
      {/* Cities button — only visible when weather data is loaded */}
      <AnimatePresence>
        {onCitiesOpen && (
          <motion.button
            key="cities-btn"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.2 }}
            onClick={onCitiesOpen}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.88 }}
            aria-label="Open saved cities"
            className="glass w-10 h-10 flex items-center justify-center rounded-2xl cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] relative"
          >
            <LayoutGrid className="w-4 h-4 text-[#3B82F6]" />
            {citiesCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center rounded-full bg-[#3B82F6] font-code text-[9px] text-white font-bold leading-none">
                {citiesCount}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Map button — only visible when weather data is loaded */}
      <AnimatePresence>
        {onMapOpen && (
          <motion.button
            key="map-btn"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.2 }}
            onClick={onMapOpen}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.88 }}
            aria-label="Open weather map"
            className="glass w-10 h-10 flex items-center justify-center rounded-2xl cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
          >
            <Map className="w-4 h-4 text-[#3B82F6]" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Theme toggle */}
      <motion.button
        onClick={onThemeToggle}
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.88 }}
        aria-label={isDark ? 'Switch to day mode' : 'Switch to night mode'}
        className="glass w-10 h-10 flex items-center justify-center rounded-2xl cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={isDark ? 'sun' : 'moon'}
            initial={{ rotate: -90, opacity: 0, scale: 0.4 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.4 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {isDark
              ? <Sun className="w-4 h-4 text-[#F59E0B]" />
              : <Moon className="w-4 h-4 text-[#3B82F6]" />
            }
          </motion.div>
        </AnimatePresence>
      </motion.button>

      {/* Unit toggle */}
      <div
        className="glass flex items-center rounded-2xl p-1 gap-0.5"
        role="group"
        aria-label="Temperature unit"
      >
        {(['C', 'F'] as const).map((u) => (
          <button
            key={u}
            onClick={() => { if (unit !== u) onUnitToggle() }}
            aria-pressed={unit === u}
            className="relative px-3 py-1 rounded-xl font-code text-xs font-semibold cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
            style={{
              color: unit === u ? '#ffffff' : 'var(--text-muted)',
              transition: 'color 150ms ease',
            }}
          >
            {unit === u && (
              <motion.span
                layoutId="unit-pill-cw"
                className="absolute inset-0 rounded-xl bg-[#1E40AF]"
                style={{ zIndex: -1 }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative">°{u}</span>
          </button>
        ))}
      </div>
    </motion.div>
  )
})
