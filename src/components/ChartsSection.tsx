import { HourlyChart } from './HourlyChart'
import { ForecastGrid } from './ForecastGrid'
import type { ForecastItem } from '../types/weather'

interface ChartsSectionProps {
  items: ForecastItem[]
  unit: 'C' | 'F'
  isDark: boolean
}

export default function ChartsSection({ items, unit, isDark }: ChartsSectionProps) {
  return (
    <>
      <HourlyChart items={items} unit={unit} isDark={isDark} />
      <ForecastGrid items={items} unit={unit} />
    </>
  )
}
