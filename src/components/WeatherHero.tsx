import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { MapPin, Thermometer, ArrowUp, ArrowDown, Sunrise, Sunset } from 'lucide-react'
import type { CurrentWeather } from '../types/weather'

interface WeatherHeroProps {
  data: CurrentWeather
  unit: 'C' | 'F'
  isDark: boolean
}

function localTime(unixUtc: number, tzOffsetSec: number): string {
  const d = new Date((unixUtc + tzOffsetSec) * 1000)
  const h = d.getUTCHours().toString().padStart(2, '0')
  const m = d.getUTCMinutes().toString().padStart(2, '0')
  return `${h}:${m}`
}

function todayLabel(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

/** Gradient background overlay per condition — makes the hero card feel alive */
function conditionAccent(id: number): string {
  if (id >= 200 && id < 300) return 'linear-gradient(135deg, rgba(109,40,217,0.28) 0%, rgba(91,33,182,0.14) 40%, transparent 70%)'
  if (id >= 300 && id < 600) return 'linear-gradient(135deg, rgba(29,78,216,0.28) 0%, rgba(37,99,235,0.14) 40%, transparent 70%)'
  if (id >= 600 && id < 700) return 'linear-gradient(135deg, rgba(186,230,253,0.28) 0%, rgba(224,242,254,0.14) 40%, transparent 70%)'
  if (id >= 700 && id < 800) return 'linear-gradient(135deg, rgba(100,116,139,0.24) 0%, rgba(148,163,184,0.12) 40%, transparent 70%)'
  if (id === 800)             return 'linear-gradient(135deg, rgba(251,191,36,0.30) 0%, rgba(245,158,11,0.14) 40%, transparent 70%)'
  if (id > 800)               return 'linear-gradient(135deg, rgba(71,85,105,0.24) 0%, rgba(100,116,139,0.12) 40%, transparent 70%)'
  return 'linear-gradient(135deg, rgba(30,64,175,0.22) 0%, transparent 60%)'
}

/** Gradient colour for the temperature number */
function tempGradient(id: number, isDark: boolean): React.CSSProperties {
  const gradients: Record<string, string> = {
    thunder: isDark ? 'linear-gradient(135deg, #C4B5FD 0%, #818CF8 100%)' : 'linear-gradient(135deg, #6D28D9 0%, #4338CA 100%)',
    rain:    isDark ? 'linear-gradient(135deg, #93C5FD 0%, #60A5FA 100%)' : 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)',
    snow:    isDark ? 'linear-gradient(135deg, #BAE6FD 0%, #7DD3FC 100%)' : 'linear-gradient(135deg, #0369A1 0%, #0284C7 100%)',
    clear:   isDark ? 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%)' : 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
    clouds:  isDark ? 'linear-gradient(135deg, #CBD5E1 0%, #94A3B8 100%)' : 'linear-gradient(135deg, #475569 0%, #334155 100%)',
    mist:    isDark ? 'linear-gradient(135deg, #CBD5E1 0%, #94A3B8 100%)' : 'linear-gradient(135deg, #475569 0%, #334155 100%)',
    default: isDark ? 'linear-gradient(135deg, #F1F5F9 0%, #94A3B8 100%)' : 'linear-gradient(135deg, #0F172A 0%, #334155 100%)',
  }

  let key = 'default'
  if (id >= 200 && id < 300) key = 'thunder'
  else if (id >= 300 && id < 600) key = 'rain'
  else if (id >= 600 && id < 700) key = 'snow'
  else if (id >= 700 && id < 800) key = 'mist'
  else if (id === 800) key = 'clear'
  else if (id > 800) key = 'clouds'

  return {
    background: gradients[key],
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  }
}

function conditionAnim(id: number) {
  if (id === 800)
    return { animate: { rotate: 360 }, transition: { duration: 20, repeat: Infinity, ease: 'linear' as const } }
  if (id >= 200 && id < 300)
    return { animate: { x: [0, -5, 5, 0] }, transition: { duration: 0.36, repeat: Infinity, ease: 'easeInOut' as const, repeatDelay: 3.5 } }
  if (id >= 300 && id < 600)
    return { animate: { y: [0, 6, 0] }, transition: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' as const } }
  if (id >= 600 && id < 700)
    return { animate: { y: [0, -9, 0] }, transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const } }
  if (id > 800)
    return { animate: { x: [0, 8, 0] }, transition: { duration: 7, repeat: Infinity, ease: 'easeInOut' as const } }
  return { animate: { opacity: [1, 0.6, 1] }, transition: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' as const } }
}

export function WeatherHero({ data, unit, isDark }: WeatherHeroProps) {
  const sym  = unit === 'C' ? '°C' : '°F'
  const cond = data.weather[0]
  const iconUrl = `https://openweathermap.org/img/wn/${cond.icon}@4x.png`

  // Animated temperature count-up (fires on unit toggle or city change)
  // Uses a plain span + MotionValue DOM subscription to avoid the
  // -webkit-background-clip:text blank-box repaint bug on theme switch.
  const tempMotion  = useMotionValue(data.main.temp)
  const displayTemp = useTransform(tempMotion, (v) => Math.round(v).toString())
  const tempRef     = useRef<HTMLSpanElement>(null)

  // Wire MotionValue → DOM span (bypasses React re-render, no style conflict)
  useEffect(() => {
    return displayTemp.on('change', (v) => {
      if (tempRef.current) tempRef.current.textContent = v
    })
  }, [displayTemp])

  useEffect(() => {
    const controls = animate(tempMotion, data.main.temp, { duration: 1.1, ease: 'easeOut' })
    return () => controls.stop()
  }, [data.main.temp, tempMotion])

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="glass-card relative overflow-hidden"
    >
      {/* Condition-specific gradient accent */}
      <div
        className="absolute inset-0 pointer-events-none rounded-[20px]"
        style={{ background: conditionAccent(cond.id) }}
      />
      {/* Subtle shine at top edge */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        {/* Left */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#3B82F6] shrink-0" />
            <span className="font-sans text-sm font-medium text-dim">
              {data.name}, {data.sys.country}
            </span>
          </div>

          {/* Gradient temperature number — plain span avoids WebkitTextFill repaint bug */}
          <div className="flex items-end gap-2">
            <span
              ref={tempRef}
              className="font-code text-8xl font-semibold leading-none"
              style={tempGradient(cond.id, isDark)}
            >
              {Math.round(data.main.temp)}
            </span>
            <span className="font-code text-3xl text-dim mb-2">{sym}</span>
          </div>

          <p className="font-sans text-dim text-base capitalize tracking-wide">{cond.description}</p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
            <span className="flex items-center gap-1 font-sans text-sm text-dim">
              <Thermometer className="w-3.5 h-3.5 text-[#F59E0B]" />
              Feels like {Math.round(data.main.feels_like)}{sym}
            </span>
            <span className="flex items-center gap-1 font-sans text-sm text-dim">
              <ArrowUp className="w-3.5 h-3.5 text-[#3B82F6]" />
              {Math.round(data.main.temp_max)}{sym}
            </span>
            <span className="flex items-center gap-1 font-sans text-sm text-faint">
              <ArrowDown className="w-3.5 h-3.5 text-faint" />
              {Math.round(data.main.temp_min)}{sym}
            </span>
          </div>

          <div className="flex items-center gap-4 mt-1">
            <span className="flex items-center gap-1.5 font-code text-xs text-dim">
              <Sunrise className="w-3.5 h-3.5 text-[#F59E0B]" />
              {localTime(data.sys.sunrise, data.timezone)}
            </span>
            <span className="flex items-center gap-1.5 font-code text-xs text-dim">
              <Sunset className="w-3.5 h-3.5 text-[#F59E0B]" />
              {localTime(data.sys.sunset, data.timezone)}
            </span>
          </div>
        </div>

        {/* Right — icon with condition animation */}
        <div className="flex flex-col items-center sm:items-end gap-2">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 140, damping: 18 }}
          >
            <motion.img
              src={iconUrl}
              alt={cond.description}
              className="w-32 h-32 drop-shadow-2xl"
              {...conditionAnim(cond.id)}
            />
          </motion.div>
          <p className="font-sans text-dim text-xs text-right">{todayLabel()}</p>
        </div>
      </div>
    </motion.div>
  )
}
