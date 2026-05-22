import { motion } from 'framer-motion'
import { CloudSun, Sun, Moon } from 'lucide-react'

interface FloatingNavProps {
  unit: 'C' | 'F'
  onUnitToggle: () => void
  isDark: boolean
  onThemeToggle: () => void
}

export function FloatingNav({ unit, onUnitToggle, isDark, onThemeToggle }: FloatingNavProps) {
  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.1 }}
      className="fixed top-4 left-4 right-4 z-50"
    >
      <nav className="glass-card py-3 px-5 flex items-center justify-between">
        {/* Brand — icon only, no text */}
        <motion.div
          whileHover={{ rotate: 15, scale: 1.1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <CloudSun className="w-6 h-6 text-[#3B82F6]" />
        </motion.div>

        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <motion.button
            onClick={onThemeToggle}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 rounded-lg text-dim hover:text-fg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </motion.button>

          {/* Unit toggle */}
          <div
            role="group"
            aria-label="Temperature unit"
            className="flex items-center bg-[rgba(128,128,128,0.12)] rounded-lg p-0.5 border border-[rgba(128,128,128,0.2)]"
          >
            {(['C', 'F'] as const).map((u) => (
              <button
                key={u}
                onClick={() => { if (unit !== u) onUnitToggle() }}
                aria-pressed={unit === u}
                className="relative px-3 py-1 rounded-md font-code text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
                style={{
                  color: unit === u ? 'var(--text-primary)' : 'var(--text-muted)',
                  transition: 'color 150ms ease',
                }}
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
        </div>
      </nav>
    </motion.header>
  )
}
