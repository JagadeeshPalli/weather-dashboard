export type UnitSystem = 'metric' | 'imperial'

export interface Coord {
  lon: number
  lat: number
}

export interface WeatherCondition {
  id: number
  main: string
  description: string
  icon: string
}

export interface CurrentWeather {
  id: number
  name: string
  coord: Coord
  dt: number
  timezone: number
  weather: WeatherCondition[]
  main: {
    temp: number
    feels_like: number
    temp_min: number
    temp_max: number
    pressure: number
    humidity: number
  }
  visibility: number
  wind: {
    speed: number
    deg: number
    gust?: number
  }
  clouds: {
    all: number
  }
  sys: {
    country: string
    sunrise: number
    sunset: number
  }
}

export interface ForecastItem {
  dt: number
  main: {
    temp: number
    feels_like: number
    temp_min: number
    temp_max: number
    pressure: number
    humidity: number
  }
  weather: WeatherCondition[]
  wind: {
    speed: number
    deg: number
  }
  pop: number
  dt_txt: string
}

export interface ForecastResponse {
  list: ForecastItem[]
  city: {
    id: number
    name: string
    coord: Coord
    country: string
    timezone: number
    sunrise: number
    sunset: number
  }
}

export interface GeoCity {
  name: string
  lat: number
  lon: number
  country: string
  state?: string
}
