import { memo } from 'react'
import { motion } from 'framer-motion'
import { Droplets, Wind, Gauge, Eye, Cloud, Navigation2 } from 'lucide-react'
import type { ReactNode } from 'react'
import type { CurrentWeather } from '../types/weather'
import { TiltCard } from './TiltCard'

interface WeatherDetailsProps {
  data: CurrentWeather
  unit: 'C' | 'F'
}

interface StatCardProps {
  icon: ReactNode
  label: string
  value: string
  index: number
  bar?: number
}

const StatCard = memo(function StatCard({ icon, label, value, index, bar }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.97 }}
      transition={{ delay: index * 0.07, duration: 0.4, ease: 'easeOut' }}
    >
    <TiltCard className="glass-card flex flex-col gap-3 cursor-default">
      <div className="flex items-center justify-between">
        <span className="font-sans text-[10px] text-dim uppercase tracking-widest">{label}</span>
        {icon}
      </div>
      <p className="font-code text-xl font-semibold text-fg">{value}</p>
      {bar !== undefined && (
        <div className="h-1 rounded-full bg-[rgba(128,128,128,0.15)] overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-[#3B82F6]"
            initial={{ width: 0 }}
            animate={{ width: `${bar}%` }}
            transition={{ delay: index * 0.07 + 0.3, duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      )}
    </TiltCard>
    </motion.div>
  )
})

function windDir(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  return dirs[Math.round(deg / 45) % 8]
}

export function WeatherDetails({ data, unit }: WeatherDetailsProps) {
  const speedUnit = unit === 'C' ? 'm/s' : 'mph'
  const visKm = (data.visibility / 1000).toFixed(1)

  const stats: StatCardProps[] = [
    {
      icon: <Droplets className="w-4 h-4 text-[#3B82F6]" />,
      label: 'Humidity',
      value: `${data.main.humidity}%`,
      bar: data.main.humidity,
      index: 0,
    },
    {
      icon: <Wind className="w-4 h-4 text-dim" />,
      label: 'Wind Speed',
      value: `${data.wind.speed.toFixed(1)} ${speedUnit}`,
      index: 1,
    },
    {
      icon: <Gauge className="w-4 h-4 text-[#F59E0B]" />,
      label: 'Pressure',
      value: `${data.main.pressure} hPa`,
      index: 2,
    },
    {
      icon: <Eye className="w-4 h-4 text-[#3B82F6]" />,
      label: 'Visibility',
      value: `${visKm} km`,
      bar: Math.min((data.visibility / 10000) * 100, 100),
      index: 3,
    },
    {
      icon: <Cloud className="w-4 h-4 text-dim" />,
      label: 'Cloud Cover',
      value: `${data.clouds.all}%`,
      bar: data.clouds.all,
      index: 4,
    },
    {
      icon: (
        <Navigation2
          className="w-4 h-4 text-[#F59E0B]"
          style={{ transform: `rotate(${data.wind.deg}deg)` }}
        />
      ),
      label: 'Wind Dir',
      value: windDir(data.wind.deg),
      index: 5,
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  )
}
