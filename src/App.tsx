import { useState, useCallback, useEffect, useRef, lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { KeyRound, ExternalLink, X, Map } from 'lucide-react'
import { ControlsWidget } from './components/ControlsWidget'
import { BrandLogo } from './components/BrandLogo'
import { SearchBar } from './components/SearchBar'
import { WeatherHero } from './components/WeatherHero'
import { WeatherDetails } from './components/WeatherDetails'
import { SkeletonHero, SkeletonDetails } from './components/SkeletonCard'
import { ErrorState } from './components/ErrorState'
import { ErrorBoundary } from './components/ErrorBoundary'
import { WeatherBackground } from './components/WeatherBackground'
import { LandscapeScene } from './components/LandscapeScene'
import { useWeatherData } from './hooks/useWeatherData'
import { hasApiKey } from './services/weatherApi'
import type { UnitSystem } from './types/weather'

// Chart.js is large — split into its own chunk so initial load is fast
const ChartsSection = lazy(() => import('./components/ChartsSection'))
// Leaflet is large (~165 kB) — split into its own chunk
const WeatherMap = lazy(() =>
  import('./components/WeatherMap').then((m) => ({ default: m.WeatherMap }))
)

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
          <p className="font-sans text-sm font-medium text-fg">API key not configured</p>
          <p className="font-sans text-xs text-dim mt-1 leading-relaxed">
            Create a <span className="font-code text-[#F59E0B]">.env</span> file and add:
          </p>
          <div className="mt-2 px-3 py-2 rounded-lg bg-[rgba(0,0,0,0.35)] font-code text-xs text-[#F59E0B] select-all">
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
          className="text-dim hover:text-fg transition-colors shrink-0 cursor-pointer"
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
  const [isDark, setIsDark] = useState(() => localStorage.getItem('wx-theme') !== 'light')
  const [mapOpen, setMapOpen] = useState(false)
  const unitSystem: UnitSystem = unit === 'C' ? 'metric' : 'imperial'
  const { current, forecast, loading, error, load } = useWeatherData(unitSystem)
  const lastCoordsRef = useRef<{ lat: number; lon: number } | null>(null)

  const showBanner = !hasApiKey() && !bannerDismissed

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.add('light')
    }
    localStorage.setItem('wx-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  const handleThemeToggle = useCallback(() => setIsDark((d) => !d), [])

  const handleLocationSelect = useCallback(
    (lat: number, lon: number, _cityName: string) => {
      lastCoordsRef.current = { lat, lon }
      load(lat, lon)
    },
    [load]
  )

  useEffect(() => {
    if (lastCoordsRef.current) {
      load(lastCoordsRef.current.lat, lastCoordsRef.current.lon)
    }
  }, [load])

  return (
    <div
      className={`min-h-screen transition-all duration-500 ${
        isDark
          ? 'bg-[#000000]'
          : 'bg-gradient-to-br from-[#4A90C4] via-[#6BADD4] to-[#4A8FB8]'
      }`}
    >
      {/* ── Weather-condition FX layer ──────────────────────────────────── */}
      {!loading && !error && current && (
        <WeatherBackground conditionId={current.weather[0].id} isDark={isDark} />
      )}

      {/* ── Samsung-style landscape scene (bottom of screen) ────────────── */}
      {!loading && !error && current && (
        <LandscapeScene conditionId={current.weather[0].id} isDark={isDark} />
      )}

      {/*
        ── Glassmorphism background ─────────────────────────────────────────
        CRITICAL: blobs must be LARGE (65–80 vw) and centred behind where
        the cards sit so backdrop-filter blur has vivid colour to diffract.
      */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {/* Top-left — blue */}
        <div
          className="absolute rounded-full animate-blob"
          style={{
            top: '-18%', left: '-22%',
            width: '80vw', height: '80vw',
            background: isDark
              ? 'radial-gradient(circle at 40% 40%, rgba(37,99,235,0.72) 0%, transparent 65%)'
              : 'radial-gradient(circle at 40% 40%, rgba(29,78,216,0.62) 0%, transparent 65%)',
            filter: 'blur(72px)',
          }}
        />
        {/* Bottom-right — purple */}
        <div
          className="absolute rounded-full animate-blob"
          style={{
            bottom: '-18%', right: '-22%',
            width: '72vw', height: '72vw',
            background: isDark
              ? 'radial-gradient(circle at 60% 60%, rgba(139,92,246,0.68) 0%, transparent 65%)'
              : 'radial-gradient(circle at 60% 60%, rgba(124,58,237,0.58) 0%, transparent 65%)',
            filter: 'blur(72px)',
            animationDelay: '2s',
          }}
        />
        {/* Centre — sky / teal */}
        <div
          className="absolute rounded-full animate-blob"
          style={{
            top: '28%', left: '18%',
            width: '65vw', height: '65vw',
            background: isDark
              ? 'radial-gradient(circle at 50% 50%, rgba(6,182,212,0.52) 0%, transparent 65%)'
              : 'radial-gradient(circle at 50% 50%, rgba(251,191,36,0.42) 0%, transparent 65%)',
            filter: 'blur(72px)',
            animationDelay: '4s',
          }}
        />
      </div>

      {/* ── Brand logo — top left ───────────────────────────────────────── */}
      <BrandLogo isDark={isDark} />

      {/* ── Map trigger — floats above the landscape scene ──────────────── */}
      <AnimatePresence>
        {!loading && !error && current && !mapOpen && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setMapOpen(true)}
            className="fixed z-40 flex items-center gap-2 cursor-pointer glass-card px-4 py-2.5"
            style={{ bottom: 216, right: 20 }}
            aria-label="Open weather map"
          >
            <Map className="w-4 h-4 text-[#3B82F6]" />
            <span className="font-sans text-sm font-medium text-fg">Map</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Weather map slide-up panel ───────────────────────────────────── */}
      {current && (
        <Suspense fallback={null}>
          <WeatherMap
            lat={current.coord.lat}
            lon={current.coord.lon}
            cityName={`${current.name}, ${current.sys.country}`}
            isDark={isDark}
            isOpen={mapOpen}
            onClose={() => setMapOpen(false)}
          />
        </Suspense>
      )}

      {/* ── Minimal floating controls (theme + unit) ────────────────────── */}
      <ControlsWidget
        unit={unit}
        onUnitToggle={() => setUnit((u) => (u === 'C' ? 'F' : 'C'))}
        isDark={isDark}
        onThemeToggle={handleThemeToggle}
      />

      <ErrorBoundary>
        <main className="relative z-10 pt-10 px-4 pb-56 max-w-4xl mx-auto">
          <div className="flex flex-col items-center gap-5">

            {/* Search */}
            <motion.div
              className="w-full flex flex-col items-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut', delay: 0.12 }}
            >
              <SearchBar onSelect={handleLocationSelect} autoDetect />
            </motion.div>

            {/* API key banner */}
            <AnimatePresence>
              {showBanner && (
                <ApiKeyBanner onDismiss={() => setBannerDismissed(true)} />
              )}
            </AnimatePresence>

            {/* Content */}
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

              <AnimatePresence mode="wait">
                {!loading && !error && current && (
                  <motion.div
                    key={current.id}
                    className="flex flex-col gap-4"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                  >
                    <WeatherHero data={current} unit={unit} isDark={isDark} />
                    <WeatherDetails data={current} unit={unit} />
                    {forecast && (
                      <Suspense
                        fallback={
                          <div className="glass-card animate-pulse h-64" aria-label="Loading charts" />
                        }
                      >
                        <ChartsSection items={forecast.list} unit={unit} isDark={isDark} />
                      </Suspense>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {!loading && !error && !current && !showBanner && (
                <motion.div
                  className="text-center py-24"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <p className="font-sans text-dim text-base">
                    Search a city above or tap the{' '}
                    <span className="text-[#3B82F6] font-medium">location pin</span> to use your location.
                  </p>
                </motion.div>
              )}
            </div>

          </div>
        </main>
      </ErrorBoundary>
    </div>
  )
}

export default App
