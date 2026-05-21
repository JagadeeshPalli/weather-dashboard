import { useState, useCallback } from 'react'
import { fetchCurrentWeather, fetchForecast } from '../services/weatherApi'
import type { CurrentWeather, ForecastResponse, UnitSystem } from '../types/weather'

const CACHE_TTL_MS = 10 * 60 * 1000

function readCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const { data, ts }: { data: T; ts: number } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL_MS) {
      localStorage.removeItem(key)
      return null
    }
    return data
  } catch {
    return null
  }
}

function writeCache<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }))
  } catch {
    /* localStorage quota exceeded */
  }
}

interface WeatherData {
  current: CurrentWeather | null
  forecast: ForecastResponse | null
  loading: boolean
  error: string | null
}

export function useWeatherData(unit: UnitSystem) {
  const [state, setState] = useState<WeatherData>({
    current: null,
    forecast: null,
    loading: false,
    error: null,
  })

  const load = useCallback(
    async (lat: number, lon: number) => {
      const cacheBase = `wx_${lat.toFixed(2)}_${lon.toFixed(2)}_${unit}`
      const cachedCurrent = readCache<CurrentWeather>(`${cacheBase}_cur`)
      const cachedForecast = readCache<ForecastResponse>(`${cacheBase}_fct`)

      if (cachedCurrent && cachedForecast) {
        setState({ current: cachedCurrent, forecast: cachedForecast, loading: false, error: null })
        return
      }

      setState((s) => ({ ...s, loading: true, error: null }))
      try {
        const [current, forecast] = await Promise.all([
          fetchCurrentWeather(lat, lon, unit),
          fetchForecast(lat, lon, unit),
        ])
        writeCache(`${cacheBase}_cur`, current)
        writeCache(`${cacheBase}_fct`, forecast)
        setState({ current, forecast, loading: false, error: null })
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch weather data'
        setState((s) => ({ ...s, loading: false, error: message }))
      }
    },
    [unit]
  )

  return { ...state, load }
}
