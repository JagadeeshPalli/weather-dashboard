/**
 * BrandLogo — fixed top-left glass pill with animated CloudSun icon + app name.
 * Lives at z-50 alongside ControlsWidget.
 */
import { motion } from 'framer-motion'
import { Cloud, Sun } from 'lucide-react'

interface BrandLogoProps {
  isDark: boolean
}

export function BrandLogo({ isDark }: BrandLogoProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20, y: -6 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.18 }}
      className="fixed top-5 left-5 z-50"
    >
      <div
        className="glass-card flex items-center gap-2.5 px-3.5 py-2.5 cursor-default select-none"
        style={{ minWidth: 0 }}
      >
        {/* Animated icon stack */}
        <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
          {/* Ambient glow ring */}
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 rounded-full"
            style={{
              background: isDark
                ? 'radial-gradient(circle, rgba(245,158,11,0.38) 0%, transparent 72%)'
                : 'radial-gradient(circle, rgba(245,158,11,0.55) 0%, transparent 72%)',
            }}
            animate={{ scale: [1, 1.55, 1], opacity: [0.55, 0.15, 0.55] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Spinning sun — behind cloud */}
          <motion.div
            className="absolute"
            animate={{ rotate: 360 }}
            transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
            style={{ top: 0, right: 0 }}
          >
            <Sun
              className="w-4 h-4"
              style={{
                color: '#F59E0B',
                filter: 'drop-shadow(0 0 6px rgba(245,158,11,0.75))',
              }}
            />
          </motion.div>

          {/* Drifting cloud — in front */}
          <motion.div
            animate={{ x: [-1.5, 1.5, -1.5] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Cloud
              className="w-6 h-6"
              style={{
                color: isDark ? '#93C5FD' : '#3B82F6',
                filter: isDark
                  ? 'drop-shadow(0 0 5px rgba(147,197,253,0.55))'
                  : 'drop-shadow(0 0 5px rgba(59,130,246,0.45))',
              }}
            />
          </motion.div>
        </div>

        {/* Text */}
        <div className="flex flex-col leading-none gap-0.5">
          <span className="font-sans text-sm font-bold text-fg tracking-tight whitespace-nowrap">
            WeatherWave
          </span>
          <motion.span
            className="font-code text-[9px] text-dim uppercase tracking-[0.14em]"
            animate={{ opacity: [0.45, 0.90, 0.45] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            Live Forecast
          </motion.span>
        </div>
      </div>
    </motion.div>
  )
}
