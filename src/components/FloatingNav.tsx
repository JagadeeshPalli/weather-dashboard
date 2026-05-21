import { motion } from 'framer-motion'
import { Cloud } from 'lucide-react'

interface FloatingNavProps {
  unit: 'C' | 'F'
  onUnitToggle: () => void
}

export function FloatingNav({ unit, onUnitToggle }: FloatingNavProps) {
  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.1 }}
      className="fixed top-4 left-4 right-4 z-50"
    >
      <nav className="glass-card py-3 px-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Cloud className="w-5 h-5 text-[#3B82F6]" />
          <span className="font-code text-[#F1F5F9] font-semibold tracking-tight">
            WeatherDash
          </span>
        </div>

        <div
          role="group"
          aria-label="Temperature unit"
          className="flex items-center bg-[rgba(255,255,255,0.06)] rounded-lg p-0.5 border border-[rgba(255,255,255,0.1)]"
        >
          {(['C', 'F'] as const).map((u) => (
            <button
              key={u}
              onClick={() => { if (unit !== u) onUnitToggle() }}
              aria-pressed={unit === u}
              className="relative px-3 py-1 rounded-md font-code text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
              style={{ color: unit === u ? '#F1F5F9' : '#94A3B8', transition: 'color 150ms ease' }}
            >
              {unit === u && (
                <motion.span
                  layoutId="unit-pill"
                  className="absolute inset-0 rounded-md bg-[#1E40AF]"
                  style={{ zIndex: -1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
              )}
              <span className="relative">°{u}</span>
            </button>
          ))}
        </div>
      </nav>
    </motion.header>
  )
}
