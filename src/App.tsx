import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { KeyRound, ExternalLink, X } from 'lucide-react'
import { FloatingNav } from './components/FloatingNav'
import { SearchBar } from './components/SearchBar'
import { WeatherHero } from './components/WeatherHero'
import { WeatherDetails } from './components/WeatherDetails'
import { SkeletonHero, SkeletonDetails } from './components/SkeletonCard'
import { ErrorState } from './components/ErrorState'
import { useWeatherData } from './hooks/useWeatherData'
import { hasApiKey } from './services/weatherApi'
import type { UnitSystem } from './types/weather'

function ApiKeyBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-xl glass-card border-[rgba(245,158,11,0.3)] bg-[rgba(245,158,11,0.06)]"
    >
      <div className="flex items-start gap-3">
        <KeyRound className="w-4 h-4 text-[#F59E0B] mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-sans text-sm font-medium text-[#F1F5F9]">API key not configured</p>
          <p className="font-sans text-xs text-[#94A3B8] mt-1 leading-relaxed">
            Create a <span className="font-code text-[#F59E0B]">.env</span> file in the project
            root and add your key:
          </p>
          <div className="mt-2 px-3 py-2 rounded-lg bg-[rgba(0,0,0,0.4)] font-code text-xs text-[#F59E0B] select-all">
            VITE_OPENWEATHERMAP_API_KEY=your_key_here
          </div>
          <a
            href="https://openweathermap.org/api"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 mt-2 font-sans text-xs text-[#3B82F6] hover:underline"
          >
            Get a free key at openweathermap.org
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <button
          onClick={onDismiss}
          className="text-[#94A3B8] hover:text-[#F1F5F9] transition-colors shrink-0"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )
}

function App() {
  const [unit, setUnit] = useState<'C' | 'F'>('C')
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const unitSystem: UnitSystem = unit === 'C' ? 'metric' : 'imperial'
  const { current, loading, error, load } = useWeatherData(unitSystem)
  const lastCoordsRef = useRef<{ lat: number; lon: number } | null>(null)

  const showBanner = !hasApiKey() && !bannerDismissed

  const handleLocationSelect = useCallback(
    (lat: number, lon: number, _cityName: string) => {
      lastCoordsRef.current = { lat, lon }
      load(lat, lon)
    },
    [load]
  )

  // Re-fetch with new unit whenever load reference changes (unit changed)
  useEffect(() => {
    if (lastCoordsRef.current) {
      load(lastCoordsRef.current.lat, lastCoordsRef.current.lon)
    }
  }, [load])

  return (
    <div className="min-h-screen bg-[#000000] relative">
      {/* Animated gradient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className="absolute top-1/4 -left-16 w-96 h-96 rounded-full opacity-20 blur-3xl animate-blob"
          style={{ background: '#1E40AF' }}
        />
        <div
          className="absolute bottom-1/4 -right-16 w-80 h-80 rounded-full opacity-15 blur-3xl animate-blob"
          style={{ background: '#3B82F6', animationDelay: '2s' }}
        />
        <div
          className="absolute top-3/4 left-1/3 w-72 h-72 rounded-full opacity-10 blur-3xl animate-blob"
          style={{ background: '#0A0E27', animationDelay: '4s' }}
        />
      </div>

      <FloatingNav unit={unit} onUnitToggle={() => setUnit((u) => (u === 'C' ? 'F' : 'C'))} />

      <main className="relative z-10 pt-28 px-4 pb-12 max-w-4xl mx-auto">
        <div className="flex flex-col items-center gap-6">

          {/* Title + search */}
          <motion.div
            className="w-full flex flex-col items-center gap-4"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.15 }}
          >
            <div className="text-center">
              <h1 className="font-code text-3xl font-semibold text-[#F1F5F9] tracking-tight">
                Weather Dashboard
              </h1>
              <p className="font-sans text-[#94A3B8] text-sm mt-1">
                Real-time weather for any city on Earth
              </p>
            </div>
            <SearchBar onSelect={handleLocationSelect} />
          </motion.div>

          {/* API key setup banner */}
          <AnimatePresence>
            {showBanner && (
              <ApiKeyBanner onDismiss={() => setBannerDismissed(true)} />
            )}
          </AnimatePresence>

          {/* Content area */}
          <div className="w-full flex flex-col gap-4">
            {loading && (
              <>
                <SkeletonHero />
                <SkeletonDetails />
              </>
            )}

            {error && !loading && (
              <ErrorState
                message={error}
                onRetry={
                  lastCoordsRef.current
                    ? () => load(lastCoordsRef.current!.lat, lastCoordsRef.current!.lon)
                    : undefined
                }
              />
            )}

            {!loading && !error && current && (
              <>
                <WeatherHero data={current} unit={unit} />
                <WeatherDetails data={current} unit={unit} />
              </>
            )}

            {!loading && !error && !current && !showBanner && (
              <motion.div
                className="text-center py-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <p className="font-sans text-[#94A3B8] text-base">
                  Search for a city or tap{' '}
                  <span className="text-[#3B82F6]">📍</span> to use your location.
                </p>
              </motion.div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}

export default App
