import axios from 'axios'
import type { CurrentWeather, ForecastResponse, GeoCity, UnitSystem, AirQualityResponse } from '../types/weather'

const BASE_URL = 'https://api.openweathermap.org'

const api = axios.create({ baseURL: BASE_URL })

export function getApiKey(): string {
  return (import.meta.env.VITE_OPENWEATHERMAP_API_KEY as string | undefined) ?? ''
}

export function hasApiKey(): boolean {
  const key = getApiKey()
  return key.length > 0 && key !== 'your_api_key_here'
}

function apiError(err: unknown): never {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status
    if (status === 401) throw new Error('Invalid or missing API key — create a .env file with VITE_OPENWEATHERMAP_API_KEY set to your key from openweathermap.org')
    if (status === 404) throw new Error('Location not found')
    if (status === 429) throw new Error('API rate limit reached — please wait a minute')
    if (!err.response) throw new Error('Network error — check your internet connection')
    throw new Error(`API error (${status ?? 'unknown'})`)
  }
  throw err instanceof Error ? err : new Error('Unexpected error')
}

export async function fetchCurrentWeather(
  lat: number,
  lon: number,
  units: UnitSystem = 'metric'
): Promise<CurrentWeather> {
  try {
    const { data } = await api.get<CurrentWeather>('/data/2.5/weather', {
      params: { lat, lon, units, appid: getApiKey() },
    })
    return data
  } catch (err) {
    return apiError(err)
  }
}

export async function fetchForecast(
  lat: number,
  lon: number,
  units: UnitSystem = 'metric'
): Promise<ForecastResponse> {
  try {
    const { data } = await api.get<ForecastResponse>('/data/2.5/forecast', {
      params: { lat, lon, units, cnt: 40, appid: getApiKey() },
    })
    return data
  } catch (err) {
    return apiError(err)
  }
}

export async function geocodeCity(query: string): Promise<GeoCity[]> {
  try {
    const { data } = await api.get<GeoCity[]>('/geo/1.0/direct', {
      params: { q: query, limit: 5, appid: getApiKey() },
    })
    return data
  } catch (err) {
    return apiError(err)
  }
}

export async function reverseGeocode(lat: number, lon: number): Promise<GeoCity[]> {
  try {
    const { data } = await api.get<GeoCity[]>('/geo/1.0/reverse', {
      params: { lat, lon, limit: 1, appid: getApiKey() },
    })
    return data
  } catch (err) {
    return apiError(err)
  }
}

export async function fetchAirQuality(lat: number, lon: number): Promise<AirQualityResponse> {
  try {
    const { data } = await api.get<AirQualityResponse>('/data/2.5/air_pollution', {
      params: { lat, lon, appid: getApiKey() },
    })
    return data
  } catch (err) {
    return apiError(err)
  }
}
