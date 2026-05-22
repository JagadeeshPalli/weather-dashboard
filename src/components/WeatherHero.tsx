import { motion } from 'framer-motion'
import { MapPin, Thermometer, ArrowUp, ArrowDown, Sunrise, Sunset } from 'lucide-react'
import type { CurrentWeather } from '../types/weather'

interface WeatherHeroProps {
  data: CurrentWeather
  unit: 'C' | 'F'
}

function conditionAnim(id: number) {
  if (id === 800)
    return { animate: { rotate: 360 }, transition: { duration: 20, repeat: Infinity, ease: 'linear' as const } }
  if (id >= 200 && id < 300)
    return { animate: { x: [0, -4, 4, 0] }, transition: { duration: 0.38, repeat: Infinity, ease: 'easeInOut' as const, repeatDelay: 4 } }
  if (id >= 300 && id < 600)
    return { animate: { y: [0, 5, 0] }, transition: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' as const } }
  if (id >= 600 && id < 700)
    return { animate: { y: [0, -8, 0] }, transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const } }
  if (id > 800)
    return { animate: { x: [0, 7, 0] }, transition: { duration: 7, repeat: Infinity, ease: 'easeInOut' as const } }
  return { animate: { opacity: [1, 0.65, 1] }, transition: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' as const } }
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

export function WeatherHero({ data, unit }: WeatherHeroProps) {
  const sym = unit === 'C' ? '°C' : '°F'
  const cond = data.weather[0]
  const iconUrl = `https://openweathermap.org/img/wn/${cond.icon}@4x.png`

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="glass-card relative overflow-hidden"
    >
      {/* Gradient accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-[rgba(30,64,175,0.15)] via-transparent to-transparent pointer-events-none" />

      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        {/* Left column */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#3B82F6] shrink-0" />
            <span className="font-sans text-sm font-medium text-dim">
              {data.name}, {data.sys.country}
            </span>
          </div>

          <div className="flex items-end gap-2">
            <span className="font-code text-8xl font-semibold text-fg leading-none">
              {Math.round(data.main.temp)}
            </span>
            <span className="font-code text-3xl text-dim mb-2">{sym}</span>
          </div>

          <p className="font-sans text-dim text-base capitalize tracking-wide">
            {cond.description}
          </p>

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

        {/* Right column */}
        <div className="flex flex-col items-center sm:items-end gap-2">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 140, damping: 18 }}
          >
            <motion.img
              src={iconUrl}
              alt={cond.description}
              className="w-28 h-28 drop-shadow-2xl"
              {...conditionAnim(cond.id)}
            />
          </motion.div>
          <p className="font-sans text-dim text-xs text-right">{todayLabel()}</p>
        </div>
      </div>
    </motion.div>
  )
}
