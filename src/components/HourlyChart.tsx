import { useRef, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  type ChartOptions,
  type ChartData,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import type { ForecastItem } from '../types/weather'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip)

interface HourlyChartProps {
  items: ForecastItem[]
  unit: 'C' | 'F'
}

function buildGradient(ctx: CanvasRenderingContext2D, height: number): CanvasGradient {
  const gradient = ctx.createLinearGradient(0, 0, 0, height)
  gradient.addColorStop(0, 'rgba(59, 130, 246, 0.35)')
  gradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)')
  return gradient
}

function formatHour(dtTxt: string): string {
  const date = new Date(dtTxt.replace(' ', 'T') + 'Z')
  return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true, timeZone: 'UTC' })
}

export function HourlyChart({ items, unit }: HourlyChartProps) {
  const ref = useRef<HTMLDivElement>(null)
  const chartRef = useRef<ChartJS<'line'>>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  const sym = unit === 'C' ? '°C' : '°F'
  // First 8 items = next 24 hours (3-hour intervals)
  const slice = items.slice(0, 8)
  const labels = slice.map((it) => formatHour(it.dt_txt))
  const temps = slice.map((it) => Math.round(it.main.temp))

  const data: ChartData<'line'> = {
    labels,
    datasets: [
      {
        data: temps,
        borderColor: '#3B82F6',
        borderWidth: 2,
        pointBackgroundColor: '#3B82F6',
        pointBorderColor: 'rgba(0,0,0,0)',
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
        fill: true,
        backgroundColor: (ctx) => {
          const chart = ctx.chart
          const { chartArea } = chart
          if (!chartArea) return 'rgba(59,130,246,0.15)'
          return buildGradient(chart.ctx, chartArea.bottom - chartArea.top)
        },
      },
    ],
  }

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 900, easing: 'easeInOutQuart' },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(10, 14, 39, 0.9)',
        borderColor: 'rgba(255,255,255,0.12)',
        borderWidth: 1,
        titleColor: '#94A3B8',
        bodyColor: '#F1F5F9',
        padding: 10,
        callbacks: {
          label: (ctx) => ` ${ctx.parsed.y}${sym}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: {
          color: '#94A3B8',
          font: { family: 'Fira Code', size: 11 },
          maxRotation: 0,
        },
        border: { color: 'rgba(255,255,255,0.06)' },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: {
          color: '#94A3B8',
          font: { family: 'Fira Code', size: 11 },
          callback: (v) => `${v}${sym}`,
        },
        border: { color: 'rgba(255,255,255,0.06)' },
      },
    },
  }

  // Trigger chart animation on scroll into view
  useEffect(() => {
    if (inView && chartRef.current) {
      chartRef.current.update()
    }
  }, [inView])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="glass-card"
    >
      <p className="font-sans text-xs text-[#94A3B8] uppercase tracking-widest mb-4">
        Next 24 Hours
      </p>
      <div style={{ height: 200 }}>
        <Line ref={chartRef} data={data} options={options} />
      </div>
    </motion.div>
  )
}
