import { useState, useMemo } from 'react'
import { HourlyChart } from './HourlyChart'
import { ForecastGrid } from './ForecastGrid'
import { HourlyModal } from './HourlyModal'
import type { ForecastItem } from '../types/weather'

interface ChartsSectionProps {
  items:  ForecastItem[]
  unit:   'C' | 'F'
  isDark: boolean
}

export default function ChartsSection({ items, unit, isDark }: ChartsSectionProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  // Filter forecast items to the selected day (3-hourly slots)
  const hourlyItems = useMemo(
    () => (selectedDate ? items.filter((i) => i.dt_txt.startsWith(selectedDate)) : []),
    [items, selectedDate],
  )

  return (
    <>
      <HourlyChart items={items} unit={unit} isDark={isDark} />

      <ForecastGrid
        items={items}
        unit={unit}
        onDaySelect={(date) => setSelectedDate(date)}
      />

      {/* Hourly detail modal — only mounts when a day has been selected */}
      {selectedDate && (
        <HourlyModal
          items={hourlyItems}
          date={selectedDate}
          unit={unit}
          isDark={isDark}
          isOpen={!!selectedDate}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </>
  )
}
