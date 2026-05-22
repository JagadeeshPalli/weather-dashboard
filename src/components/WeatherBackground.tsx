import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

interface WeatherBackgroundProps {
  conditionId: number
  isDark: boolean
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

/* ─── Subtle background tint per condition ──────────────────────────────── */
const tintMap: Record<FXType, { dark: string; light: string }> = {
  thunder: { dark: 'rgba(30,20,60,0.35)',  light: 'rgba(60,40,100,0.18)' },
  rain:    { dark: 'rgba(10,25,60,0.30)',  light: 'rgba(20,60,120,0.14)' },
  drizzle: { dark: 'rgba(10,20,50,0.22)',  light: 'rgba(20,50,100,0.12)' },
  snow:    { dark: 'rgba(20,30,65,0.22)',  light: 'rgba(180,205,235,0.20)' },
  mist:    { dark: 'rgba(20,25,45,0.28)',  light: 'rgba(90,110,140,0.14)' },
  clear:   { dark: 'rgba(8,18,45,0.15)',   light: 'rgba(255,210,60,0.10)' },
  clouds:  { dark: 'rgba(18,22,40,0.25)',  light: 'rgba(70,95,130,0.12)' },
}

/* ─── Rain ──────────────────────────────────────────────────────────────── */
function Rain({ heavy = false, isDark = true }: { heavy?: boolean; isDark?: boolean }) {
  const count  = heavy ? 48 : 30
  const drops = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id:       i,
        left:     `${(i * (100 / count)) % 100}%`,
        delay:    (i * 0.06) % 2.4,
        duration: heavy ? 0.5 + (i % 5) * 0.05 : 0.75 + (i % 5) * 0.08,
        opacity:  isDark ? 0.35 + (i % 4) * 0.12 : 0.55 + (i % 4) * 0.12,
        height:   heavy ? 20 + (i % 8) * 3 : 14 + (i % 6) * 2,
      })),
    [heavy, isDark, count]
  )

  const dropGradient = isDark
    ? 'linear-gradient(to bottom, rgba(147,197,253,0.85), rgba(147,197,253,0))'
    : 'linear-gradient(to bottom, rgba(30,64,138,0.70), rgba(30,64,138,0))'

  return (
    <>
      {drops.map((d) => (
        <motion.div
          key={d.id}
          className="absolute w-px rounded-full"
          style={{ left: d.left, top: '-3%', height: d.height, background: dropGradient, opacity: d.opacity }}
          animate={{ y: '110vh' }}
          transition={{ duration: d.duration, delay: d.delay, repeat: Infinity, ease: 'linear' }}
        />
      ))}
    </>
  )
}

/* ─── Snow ──────────────────────────────────────────────────────────────── */
function Snow({ isDark = true }: { isDark?: boolean }) {
  const flakes = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id:       i,
        left:     `${(i * 4.17) % 100}%`,
        size:     3 + (i % 5),
        delay:    (i * 0.18) % 4.5,
        duration: 3 + (i % 5) * 0.5,
        sway:     16 + (i % 4) * 14,
        opacity:  isDark ? 0.5 + (i % 3) * 0.15 : 0.65 + (i % 3) * 0.12,
      })),
    [isDark]
  )

  const flakeClass = isDark ? 'absolute rounded-full bg-white' : 'absolute rounded-full bg-slate-400'

  return (
    <>
      {flakes.map((f) => (
        <motion.div
          key={f.id}
          className={flakeClass}
          style={{ left: f.left, top: '-2%', width: f.size, height: f.size, opacity: f.opacity }}
          animate={{ y: '110vh', x: [0, f.sway, -(f.sway / 2), f.sway / 3, 0] }}
          transition={{ duration: f.duration, delay: f.delay, repeat: Infinity, ease: 'linear' }}
        />
      ))}
    </>
  )
}

/* ─── Sun rays ──────────────────────────────────────────────────────────── */
function SunRays({ isDark = true }: { isDark?: boolean }) {
  const glowOpacity   = isDark ? 0.18 : 0.35
  const rayOpacity    = isDark ? 0.45 : 0.70
  const coreOpacity   = isDark ? [0.35, 0.55, 0.35] : [0.55, 0.80, 0.55]
  const flareOpacity  = isDark ? [0, 0.55, 0] : [0, 0.85, 0]

  return (
    <div className="absolute top-[-80px] right-[-80px] w-[340px] h-[340px]">
      {/* Outer ambient glow */}
      <div
        className="absolute inset-0 rounded-full blur-3xl"
        style={{ background: `rgba(245,158,11,${glowOpacity})` }}
      />
      {/* Rotating rays */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ rotate: 360 }}
        transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
      >
        {Array.from({ length: 12 }, (_, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              width: i % 2 === 0 ? 2 : 1,
              height: i % 2 === 0 ? 85 : 55,
              borderRadius: 2,
              transformOrigin: 'center bottom',
              transform: `rotate(${i * 30}deg) translateY(calc(-50% - 60px))`,
              background: `linear-gradient(to top, rgba(245,158,11,${rayOpacity}), rgba(245,158,11,0))`,
            }}
          />
        ))}
      </motion.div>
      {/* Core pulse */}
      <motion.div
        className="absolute inset-[36%] rounded-full blur-lg"
        style={{ background: 'rgba(253,230,138,0.45)' }}
        animate={{ scale: [1, 1.3, 1], opacity: coreOpacity }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Lens flare */}
      <motion.div
        className="absolute top-[48%] left-[8%] w-[84%] h-px"
        style={{ background: 'linear-gradient(to right, transparent, rgba(253,230,138,0.35), transparent)' }}
        animate={{ opacity: flareOpacity }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
      />
    </div>
  )
}

/* ─── Clouds ─────────────────────────────────────────────────────────────── */
function Clouds({ isDark = true }: { isDark?: boolean }) {
  const shapes = useMemo(
    () => [
      { top: '5%',  w: 220, h: 70,  delay: 0,  dur: 22, oD: 0.20, oL: 0.42 },
      { top: '18%', w: 160, h: 52,  delay: 9,  dur: 30, oD: 0.16, oL: 0.35 },
      { top: '36%', w: 260, h: 80,  delay: 5,  dur: 38, oD: 0.14, oL: 0.30 },
      { top: '58%', w: 180, h: 56,  delay: 14, dur: 28, oD: 0.12, oL: 0.28 },
    ],
    []
  )

  return (
    <>
      {shapes.map((c, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full blur-2xl ${isDark ? 'bg-slate-400' : 'bg-slate-600'}`}
          style={{ top: c.top, width: c.w, height: c.h, opacity: isDark ? c.oD : c.oL }}
          initial={{ x: '-22vw' }}
          animate={{ x: '122vw' }}
          transition={{ duration: c.dur, delay: c.delay, repeat: Infinity, ease: 'linear' }}
        />
      ))}
    </>
  )
}

/* ─── Mist ──────────────────────────────────────────────────────────────── */
function Mist({ isDark = true }: { isDark?: boolean }) {
  const layers = [
    { top: '12%', oD: 0.10, oL: 0.22 },
    { top: '38%', oD: 0.08, oL: 0.18 },
    { top: '64%', oD: 0.06, oL: 0.14 },
  ]

  return (
    <>
      {layers.map((m, i) => (
        <motion.div
          key={i}
          className={`absolute left-0 right-0 h-32 blur-3xl ${isDark ? 'bg-slate-300' : 'bg-slate-600'}`}
          style={{ top: m.top, opacity: isDark ? m.oD : m.oL }}
          animate={{ x: ['-5%', '5%', '-5%'] }}
          transition={{ duration: 9 + i * 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </>
  )
}

/* ─── Thunder ───────────────────────────────────────────────────────────── */
function Thunder({ isDark = true }: { isDark?: boolean }) {
  const flashColor = isDark ? 'rgba(120,100,220,0.12)' : 'rgba(90,70,180,0.20)'
  return (
    <>
      <Rain heavy isDark={isDark} />
      <motion.div
        className="absolute inset-0"
        style={{ background: flashColor }}
        animate={{ opacity: [0, 0, 1, 0.2, 0, 0, 0.7, 0] }}
        transition={{
          duration: 5.5,
          delay: 2,
          repeat: Infinity,
          times: [0, 0.42, 0.44, 0.46, 0.50, 0.76, 0.78, 1],
        }}
      />
    </>
  )
}

/* ─── Main export ───────────────────────────────────────────────────────── */
export function WeatherBackground({ conditionId, isDark }: WeatherBackgroundProps) {
  const prefersReducedMotion = useReducedMotion()
  if (prefersReducedMotion) return null

  const fx = getFXType(conditionId)
  if (!fx) return null

  const tint = tintMap[fx]

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 1 }}
      aria-hidden="true"
    >
      {/* Condition-specific colour tint over background */}
      <div className="absolute inset-0" style={{ background: isDark ? tint.dark : tint.light }} />

      {(fx === 'rain' || fx === 'drizzle') && <Rain isDark={isDark} />}
      {fx === 'thunder'                    && <Thunder isDark={isDark} />}
      {fx === 'snow'                        && <Snow isDark={isDark} />}
      {fx === 'clear'                       && <SunRays isDark={isDark} />}
      {fx === 'clouds'                      && <Clouds isDark={isDark} />}
      {fx === 'mist'                        && <Mist isDark={isDark} />}
    </div>
  )
}
