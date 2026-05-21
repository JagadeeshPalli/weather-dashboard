import { useState } from 'react'

interface GeolocationState {
  lat: number | null
  lon: number | null
  loading: boolean
  error: string | null
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    lat: null,
    lon: null,
    loading: false,
    error: null,
  })

  const detect = () => {
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, error: 'Geolocation is not supported by your browser' }))
      return
    }
    setState((s) => ({ ...s, loading: true, error: null }))
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          loading: false,
          error: null,
        })
      },
      (err) => {
        setState((s) => ({ ...s, loading: false, error: err.message }))
      }
    )
  }

  return { ...state, detect }
}
