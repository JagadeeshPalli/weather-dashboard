import axios from 'axios'
import type { CurrentWeather, ForecastResponse, GeoCity, UnitSystem } from '../types/weather'

const API_KEY = import.meta.env.VITE_OPENWEATHERMAP_API_KEY as string
const BASE_URL = 'https://api.openweathermap.org'

const api = axios.create({ baseURL: BASE_URL })

export async function fetchCurrentWeather(
  lat: number,
  lon: number,
  units: UnitSystem = 'metric'
): Promise<CurrentWeather> {
  const { data } = await api.get<CurrentWeather>('/data/2.5/weather', {
    params: { lat, lon, units, appid: API_KEY },
  })
  return data
}

export async function fetchForecast(
  lat: number,
  lon: number,
  units: UnitSystem = 'metric'
): Promise<ForecastResponse> {
  const { data } = await api.get<ForecastResponse>('/data/2.5/forecast', {
    params: { lat, lon, units, cnt: 40, appid: API_KEY },
  })
  return data
}

export async function geocodeCity(query: string): Promise<GeoCity[]> {
  const { data } = await api.get<GeoCity[]>('/geo/1.0/direct', {
    params: { q: query, limit: 5, appid: API_KEY },
  })
  return data
}

export async function reverseGeocode(lat: number, lon: number): Promise<GeoCity[]> {
  const { data } = await api.get<GeoCity[]>('/geo/1.0/reverse', {
    params: { lat, lon, limit: 1, appid: API_KEY },
  })
  return data
}
