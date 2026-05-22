import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

interface WeatherBackgroundProps {
  conditionId: number
}

type FXType = 'thunder' | 'rain' | 'drizzle' | 'snow' | 'clear' | 'clouds' | 'mist'

function getFXType(id: number): FXType | null {
  if (id >= 200 && id < 300) return 'thunder'
  if (id >= 300 && id < 400) return 'drizzle'
  if (id >= 500 && id < 600) return 'rain'
  if (id >= 600 && id < 700) return 'snow'
  if (id >= 700 && id < 800) return 'mist'
  if (id === 800) return 'clear'
  if (id > 800) return 'clouds'
  return null
}

/* ─── Rain ─────────────────────────────────────────────────────────────── */
function Rain({ heavy = false }: { heavy?: boolean }) {
  const drops = useMemo(
    () =>
      Array.from({ length: heavy ? 36 : 22 }, (_, i) => ({
        id: i,
        left: `${(i * 2.78) % 100}%`,
        delay: (i * 0.07) % 2.2,
        duration: heavy ? 0.6 + (i % 5) * 0.06 : 0.85 + (i % 5) * 0.1,
        opacity: 0.18 + (i % 4) * 0.1,
        height: heavy ? 18 + (i % 8) * 2 : 12 + (i % 6) * 2,
      })),
    [heavy]
  )
  return (
    <>
      {drops.map((d) => (
        <motion.div
          key={d.id}
          className="absolute w-px rounded-full"
          style={{
            left: d.left,
            top: '-3%',
            height: d.height,
            background:
              'linear-gradient(to bottom, rgba(147,197,253,0.65), rgba(147,197,253,0))',
          }}
          animate={{ y: '110vh' }}
          transition={{
            duration: d.duration,
            delay: d.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </>
  )
}

/* ─── Snow ─────────────────────────────────────────────────────────────── */
function Snow() {
  const flakes = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        left: `${(i * 5.56) % 100}%`,
        size: 3 + (i % 4),
        delay: (i * 0.2) % 4.5,
        duration: 3 + (i % 5) * 0.55,
        sway: 18 + (i % 4) * 14,
        opacity: 0.45 + (i % 3) * 0.15,
      })),
    []
  )
  return (
    <>
      {flakes.map((f) => (
        <motion.div
          key={f.id}
          className="absolute rounded-full bg-white"
          style={{
            left: f.left,
            top: '-2%',
            width: f.size,
            height: f.size,
            opacity: f.opacity,
          }}
          animate={{
            y: '110vh',
            x: [0, f.sway, -(f.sway / 2), f.sway / 3, 0],
          }}
          transition={{
            duration: f.duration,
            delay: f.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </>
  )
}

/* ─── Clear / Sun rays ──────────────────────────────────────────────────── */
function SunRays() {
  return (
    <div className="absolute top-[-60px] right-[-60px] w-[280px] h-[280px]">
      {/* Outer ambient glow */}
      <div className="absolute inset-0 rounded-full bg-[rgba(245,158,11,0.1)] blur-3xl" />
      {/* Rotating ray group */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ rotate: 360 }}
        transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}
      >
        {Array.from({ length: 10 }, (_, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              width: i % 2 === 0 ? 2 : 1,
              height: i % 2 === 0 ? 75 : 50,
              borderRadius: 1,
              transformOrigin: 'center bottom',
              transform: `rotate(${i * 36}deg) translateY(calc(-50% - 55px))`,
              background:
                'linear-gradient(to top, rgba(245,158,11,0.4), rgba(245,158,11,0))',
            }}
          />
        ))}
      </motion.div>
      {/* Inner core pulse */}
      <motion.div
        className="absolute inset-[38%] rounded-full bg-[rgba(253,230,138,0.3)] blur-lg"
        animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Lens-flare streak */}
      <motion.div
        className="absolute top-[48%] left-[10%] w-[80%] h-px"
        style={{
          background:
            'linear-gradient(to right, transparent, rgba(253,230,138,0.25), transparent)',
        }}
        animate={{ opacity: [0, 0.6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
      />
    </div>
  )
}

/* ─── Clouds ────────────────────────────────────────────────────────────── */
function Clouds() {
  const shapes = useMemo(
    () => [
      { top: '7%',  w: 180, h: 60, delay: 0,  dur: 24, opacity: 0.1  },
      { top: '20%', w: 120, h: 42, delay: 10, dur: 32, opacity: 0.07 },
      { top: '38%', w: 220, h: 70, delay: 5,  dur: 40, opacity: 0.06 },
    ],
    []
  )
  return (
    <>
      {shapes.map((c, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-2xl bg-slate-400"
          style={{ top: c.top, width: c.w, height: c.h, opacity: c.opacity }}
          initial={{ x: '-22vw' }}
          animate={{ x: '122vw' }}
          transition={{ duration: c.dur, delay: c.delay, repeat: Infinity, ease: 'linear' }}
        />
      ))}
    </>
  )
}

/* ─── Mist / Fog ────────────────────────────────────────────────────────── */
function Mist() {
  return (
    <>
      {[
        { top: '12%', opacity: 0.05 },
        { top: '38%', opacity: 0.04 },
        { top: '64%', opacity: 0.03 },
      ].map((m, i) => (
        <motion.div
          key={i}
          className="absolute left-0 right-0 h-28 blur-3xl bg-slate-300"
          style={{ top: m.top, opacity: m.opacity }}
          animate={{ x: ['-5%', '5%', '-5%'] }}
          transition={{ duration: 8 + i * 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </>
  )
}

/* ─── Thunder ───────────────────────────────────────────────────────────── */
function Thunder() {
  return (
    <>
      <Rain heavy />
      <motion.div
        className="absolute inset-0 bg-[rgba(99,102,241,0.06)]"
        animate={{ opacity: [0, 0, 0.5, 0.1, 0, 0, 0.35, 0] }}
        transition={{
          duration: 5.5,
          delay: 2.5,
          repeat: Infinity,
          times: [0, 0.44, 0.46, 0.48, 0.5, 0.77, 0.79, 1],
        }}
      />
    </>
  )
}

/* ─── Main export ───────────────────────────────────────────────────────── */
export function WeatherBackground({ conditionId }: WeatherBackgroundProps) {
  const prefersReducedMotion = useReducedMotion()
  if (prefersReducedMotion) return null

  const fx = getFXType(conditionId)
  if (!fx) return null

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 1 }}
      aria-hidden="true"
    >
      {(fx === 'rain' || fx === 'drizzle') && <Rain />}
      {fx === 'thunder' && <Thunder />}
      {fx === 'snow' && <Snow />}
      {fx === 'clear' && <SunRays />}
      {fx === 'clouds' && <Clouds />}
      {fx === 'mist' && <Mist />}
    </div>
  )
}
