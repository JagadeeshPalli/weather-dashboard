import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MapPin, Loader2 } from 'lucide-react'
import { geocodeCity } from '../services/weatherApi'
import { useDebounce } from '../hooks/useDebounce'
import { useGeolocation } from '../hooks/useGeolocation'
import type { GeoCity } from '../types/weather'

interface SearchBarProps {
  onSelect: (lat: number, lon: number, cityName: string) => void
}

export function SearchBar({ onSelect }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GeoCity[]>([])
  const [open, setOpen] = useState(false)
  const [searching, setSearching] = useState(false)
  const debouncedQuery = useDebounce(query, 400)
  const geo = useGeolocation()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!debouncedQuery.trim() || debouncedQuery.length < 2) {
      setResults([])
      setOpen(false)
      return
    }
    setSearching(true)
    geocodeCity(debouncedQuery)
      .then((cities) => {
        setResults(cities)
        setOpen(cities.length > 0)
      })
      .catch(() => setResults([]))
      .finally(() => setSearching(false))
  }, [debouncedQuery])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (geo.lat !== null && geo.lon !== null) {
      onSelect(geo.lat, geo.lon, 'My Location')
      setQuery('My Location')
      setOpen(false)
    }
  }, [geo.lat, geo.lon, onSelect])

  const handleSelect = (city: GeoCity) => {
    const label = city.state
      ? `${city.name}, ${city.state}, ${city.country}`
      : `${city.name}, ${city.country}`
    setQuery(label)
    setOpen(false)
    setResults([])
    onSelect(city.lat, city.lon, city.name)
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <div className="glass-card py-0 flex items-center gap-3 px-4 h-14">
        {searching ? (
          <Loader2 className="w-5 h-5 text-[#3B82F6] animate-spin shrink-0" />
        ) : (
          <Search className="w-5 h-5 text-[#94A3B8] shrink-0" />
        )}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search for a city…"
          className="flex-1 bg-transparent font-sans text-[#F1F5F9] placeholder:text-[#94A3B8] text-base focus:outline-none"
        />
        <button
          onClick={geo.detect}
          disabled={geo.loading}
          title="Use my location"
          className="shrink-0 p-1 text-[#94A3B8] hover:text-[#3B82F6] transition-colors disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] rounded"
        >
          {geo.loading
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <MapPin className="w-4 h-4" />
          }
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-full mt-2 left-0 right-0 z-50 glass-card py-1 overflow-hidden"
            role="listbox"
          >
            {results.map((city, i) => (
              <motion.li
                key={`${city.lat}-${city.lon}-${i}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => handleSelect(city)}
                role="option"
                aria-selected={false}
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[rgba(255,255,255,0.06)] transition-colors"
              >
                <MapPin className="w-4 h-4 text-[#3B82F6] shrink-0" />
                <span className="font-sans text-[#F1F5F9] text-sm">
                  {city.name}
                  {city.state && <span className="text-[#94A3B8]">, {city.state}</span>}
                  <span className="text-[#94A3B8]">, {city.country}</span>
                </span>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
