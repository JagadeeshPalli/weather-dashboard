import { memo, useMemo, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { ArrowUp, ArrowDown, Droplets } from 'lucide-react'
import type { ForecastItem } from '../types/weather'
import { TiltCard } from './TiltCard'

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
    if (date === today) continue
    if (days.length >= 5) break

    const temps = dayItems.map((i) => i.main.temp)
    const pops  = dayItems.map((i) => i.pop)
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

const ForecastCard = memo(function ForecastCard({ day, unit, index }: ForecastCardProps) {
  const sym = unit === 'C' ? '°' : '°'
  const iconUrl = `https://openweathermap.org/img/wn/${day.icon}@2x.png`

  return (
    <motion.div
      className="h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.97 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: 'easeOut' }}
    >
      {/* h-full + flex-1 ensure all cards stretch to the same row height */}
      <TiltCard className="glass-card h-full flex flex-col items-center gap-2 text-center">
        <p className="font-code text-xs text-dim uppercase tracking-widest">{day.dayLabel}</p>

        <img
          src={iconUrl}
          alt={day.description}
          className="w-12 h-12 drop-shadow-md"
          loading="lazy"
        />

        <p className="font-sans text-[10px] text-dim capitalize leading-tight min-h-[2.4em]">
          {day.description}
        </p>

        <div className="flex items-center gap-2 mt-auto">
          <span className="flex items-center gap-0.5 font-code text-sm font-semibold text-fg">
            <ArrowUp className="w-3 h-3 text-[#3B82F6]" />
            {day.tempMax}{sym}
          </span>
          <span className="flex items-center gap-0.5 font-code text-sm text-faint">
            <ArrowDown className="w-3 h-3" />
            {day.tempMin}{sym}
          </span>
        </div>

        {/* Always render — keeps card height uniform. Hidden when no rain. */}
        <span
          className="flex items-center gap-0.5 font-code text-[10px]"
          style={{ color: day.pop > 0 ? '#3B82F6' : 'transparent' }}
          aria-hidden={day.pop === 0}
        >
          <Droplets className="w-3 h-3" />
          {day.pop > 0 ? `${day.pop}%` : '0%'}
        </span>
      </TiltCard>
    </motion.div>
  )
})

export const ForecastGrid = memo(function ForecastGrid({ items, unit }: ForecastGridProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const days = useMemo(() => groupByDay(items), [items])

  if (days.length === 0) return null

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <p className="font-sans text-xs text-dim uppercase tracking-widest mb-3 px-1">
        5-Day Forecast
      </p>
      {/* On mobile: horizontal scroll so all 5 cards stay the same width.
          On sm+: normal 5-column grid. items-stretch ensures equal heights. */}
      <div className="hidden sm:grid sm:grid-cols-5 gap-3 items-stretch">
        {days.map((day, i) => (
          <ForecastCard key={day.dayLabel} day={day} unit={unit} index={i} />
        ))}
      </div>
      {/* Mobile horizontal scroll */}
      <div className="flex sm:hidden gap-3 overflow-x-auto pb-1 -mx-1 px-1 snap-x snap-mandatory scrollbar-hide">
        {days.map((day, i) => (
          <div key={day.dayLabel} className="flex-none w-[44vw] snap-start">
            <ForecastCard day={day} unit={unit} index={i} />
          </div>
        ))}
      </div>
    </motion.div>
  )
})
