import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { ArrowUp, ArrowDown } from 'lucide-react'
import type { ForecastItem } from '../types/weather'

interface ForecastGridProps {
  items: ForecastItem[]
  unit: 'C' | 'F'
}

interface DayForecast {
  dayLabel: string
  icon: string
  description: string
  tempMax: number
  tempMin: number
  pop: number
}

function groupByDay(items: ForecastItem[]): DayForecast[] {
  const map = new Map<string, ForecastItem[]>()

  for (const item of items) {
    const day = item.dt_txt.slice(0, 10)
    if (!map.has(day)) map.set(day, [])
    map.get(day)!.push(item)
  }

  const today = new Date().toISOString().slice(0, 10)
  const days: DayForecast[] = []

  for (const [date, dayItems] of map) {
    if (date === today) continue // skip today — shown in WeatherHero
    if (days.length >= 5) break

    const temps = dayItems.map((i) => i.main.temp)
    const pops = dayItems.map((i) => i.pop)

    // Use the midday item (or closest) for icon and description
    const midday = dayItems.find((i) => i.dt_txt.includes('12:00:00')) ?? dayItems[Math.floor(dayItems.length / 2)]

    days.push({
      dayLabel: new Date(date + 'T12:00:00Z').toLocaleDateString('en-US', {
        weekday: 'short',
        timeZone: 'UTC',
      }),
      icon: midday.weather[0].icon,
      description: midday.weather[0].description,
      tempMax: Math.round(Math.max(...temps)),
      tempMin: Math.round(Math.min(...temps)),
      pop: Math.round(Math.max(...pops) * 100),
    })
  }

  return days
}

interface ForecastCardProps {
  day: DayForecast
  unit: 'C' | 'F'
  index: number
}

function ForecastCard({ day, unit, index }: ForecastCardProps) {
  const sym = unit === 'C' ? '°' : '°'
  const iconUrl = `https://openweathermap.org/img/wn/${day.icon}@2x.png`

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: 'easeOut' }}
      className="glass-card flex flex-col items-center gap-2 text-center hover:border-[rgba(255,255,255,0.22)] transition-colors"
    >
      <p className="font-code text-xs text-[#94A3B8] uppercase tracking-widest">{day.dayLabel}</p>

      <img
        src={iconUrl}
        alt={day.description}
        className="w-12 h-12 drop-shadow-md"
        loading="lazy"
      />

      <p className="font-sans text-[10px] text-[#94A3B8] capitalize leading-tight">
        {day.description}
      </p>

      <div className="flex items-center gap-2 mt-1">
        <span className="flex items-center gap-0.5 font-code text-sm font-semibold text-[#F1F5F9]">
          <ArrowUp className="w-3 h-3 text-[#3B82F6]" />
          {day.tempMax}{sym}
        </span>
        <span className="flex items-center gap-0.5 font-code text-sm text-[#64748B]">
          <ArrowDown className="w-3 h-3" />
          {day.tempMin}{sym}
        </span>
      </div>

      {day.pop > 0 && (
        <span className="font-code text-[10px] text-[#3B82F6]">
          💧 {day.pop}%
        </span>
      )}
    </motion.div>
  )
}

export function ForecastGrid({ items, unit }: ForecastGridProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const days = groupByDay(items)

  if (days.length === 0) return null

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <p className="font-sans text-xs text-[#94A3B8] uppercase tracking-widest mb-3 px-1">
        5-Day Forecast
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {days.map((day, i) => (
          <ForecastCard key={day.dayLabel} day={day} unit={unit} index={i} />
        ))}
      </div>
    </motion.div>
  )
}
