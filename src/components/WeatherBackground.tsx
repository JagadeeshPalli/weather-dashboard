/**
 * WeatherBackground — full-screen atmospheric FX layer (z-index: 1).
 *
 * Performance model:
 *  - Particle effects (rain, snow, stars, grass) → plain <div> + CSS @keyframes
 *    → runs entirely on GPU compositor, ZERO JS per frame.
 *  - Complex / unique animations (aurora, clouds, lightning, moon) → framer-motion
 *    → these are few elements so JS overhead is negligible.
 *  - will-change: transform applied only to actively translating elements.
 */
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

const tintMap: Record<FXType, { dark: string; light: string }> = {
  thunder: { dark: 'rgba(45,20,80,0.40)',  light: 'rgba(70,40,110,0.22)' },
  rain:    { dark: 'rgba(10,25,70,0.35)',  light: 'rgba(20,60,130,0.18)' },
  drizzle: { dark: 'rgba(10,20,55,0.28)',  light: 'rgba(20,50,110,0.14)' },
  snow:    { dark: 'rgba(20,30,70,0.25)',  light: 'rgba(180,210,240,0.22)' },
  mist:    { dark: 'rgba(20,25,50,0.32)',  light: 'rgba(90,110,150,0.18)' },
  clear:   { dark: 'rgba(10,20,50,0.18)',  light: 'rgba(255,215,60,0.12)' },
  clouds:  { dark: 'rgba(18,22,45,0.30)',  light: 'rgba(70,90,130,0.14)' },
}

/* ── Pre-computed star positions (reduced to 55 for perf) ───────────────── */
const STARS = Array.from({ length: 55 }, (_, i) => ({
  x:      (i * 137.508 + 45) % 100,
  y:      (i * 73.2 + 12) % 65,
  size:   0.9 + (i % 4) * 0.3,
  delay:  (i * 0.23) % 4.8,
  dur:    2.4 + (i % 5) * 0.65,
  bright: 0.30 + (i % 4) * 0.18,
}))

/* ── Star field — CSS animation, 0 JS per frame ─────────────────────────── */
function StarField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {STARS.map((s, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: `${s.x}%`,
            top:  `${s.y}%`,
            width:  s.size,
            height: s.size,
            '--wx-hi': s.bright,
            '--wx-lo': s.bright * 0.14,
            opacity: s.bright,
            animation: `wx-twinkle ${s.dur}s ${s.delay}s ease-in-out infinite`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}

/* ── Shooting stars (3 elements, keep framer-motion) ───────────────────── */
function ShootingStars() {
  const shots = useMemo(() => [
    { top: '7%',  left: '72%', delay: 4,  dur: 1.1, len: 90  },
    { top: '18%', left: '42%', delay: 14, dur: 0.85, len: 72 },
    { top: '5%',  left: '58%', delay: 26, dur: 1.3, len: 110 },
  ], [])
  return (
    <>
      {shots.map((s, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ top: s.top, left: s.left, rotate: 30 }}
          initial={{ opacity: 0, x: 0, y: 0 }}
          animate={{ opacity: [0, 1, 0], x: ['0px', `${s.len * 0.7}px`], y: ['0px', `${s.len * 0.5}px`] }}
          transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, repeatDelay: 22, ease: 'easeOut' }}
        >
          <div style={{ width: s.len, height: 1.5, borderRadius: 2,
            background: 'linear-gradient(to right, rgba(255,255,255,0.9), transparent)' }} />
        </motion.div>
      ))}
    </>
  )
}

/* ── Aurora borealis (3 elements, keep framer-motion) ─────────────────── */
function AuroraEffect() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        style={{ position: 'absolute', top: '-18%', left: '-12%', right: '-12%', height: '52%',
          background: 'linear-gradient(180deg,transparent 0%,rgba(16,185,129,0.055) 35%,rgba(59,130,246,0.075) 65%,transparent 100%)',
          filter: 'blur(52px)' }}
        animate={{ y: [0, 22, 0], opacity: [0.42, 0.88, 0.42], scaleX: [1, 1.08, 0.95, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        style={{ position: 'absolute', top: '2%', left: '15%', right: '-22%', height: '44%',
          background: 'linear-gradient(180deg,transparent 0%,rgba(139,92,246,0.045) 40%,rgba(16,185,129,0.065) 70%,transparent 100%)',
          filter: 'blur(64px)' }}
        animate={{ y: [0, -14, 0], opacity: [0.28, 0.62, 0.28] }}
        transition={{ duration: 14, delay: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        style={{ position: 'absolute', top: '-5%', left: '-20%', right: '20%', height: '38%',
          background: 'linear-gradient(180deg,transparent 0%,rgba(6,182,212,0.04) 45%,rgba(139,92,246,0.055) 70%,transparent 100%)',
          filter: 'blur(70px)' }}
        animate={{ y: [0, 10, 0], opacity: [0.22, 0.50, 0.22] }}
        transition={{ duration: 18, delay: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}

/* ── Moon orb (5 elements, keep framer-motion) ───────────────────────── */
function MoonOrb() {
  return (
    <div className="absolute top-[-55px] right-[-35px] w-[280px] h-[280px] pointer-events-none">
      <div className="absolute inset-0 rounded-full blur-3xl" style={{ background: 'rgba(203,213,225,0.12)' }} />
      {[115, 85, 62].map((r, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{ top: '50%', left: '50%', width: r * 2, height: r * 2,
            marginLeft: -r, marginTop: -r,
            border: `${0.5 + i * 0.25}px solid rgba(203,213,225,${0.11 - i * 0.03})` }}
          animate={{ scale: [1, 1.03, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 4.5 + i * 1.5, repeat: Infinity, ease: 'easeInOut', delay: i * 1.3 }}
        />
      ))}
      <motion.div
        className="absolute rounded-full"
        style={{ top: '50%', left: '50%', width: 86, height: 86, marginLeft: -43, marginTop: -43,
          background: 'radial-gradient(circle at 38% 36%,rgba(241,245,249,0.95) 0%,rgba(203,213,225,0.82) 52%,rgba(148,163,184,0.22) 100%)',
          boxShadow: '0 0 28px rgba(203,213,225,0.42),0 0 80px rgba(148,163,184,0.16)' }}
        animate={{ scale: [1, 1.022, 1] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}

/* ── SVG Cloud shape ────────────────────────────────────────────────────── */
const CLOUD_PATHS = [
  'M20,80 C6,80 2,66 14,60 C10,44 26,34 42,38 C46,20 68,12 84,24 C94,10 120,14 124,30 C140,24 156,38 152,54 C166,58 168,80 150,80 Z',
  'M14,82 C2,82 2,68 14,64 C10,52 24,44 40,48 C42,32 64,24 82,34 C86,20 110,18 118,32 C132,26 150,36 148,52 C162,56 164,82 146,82 Z',
  'M22,78 C6,78 2,62 16,56 C10,38 30,28 48,34 C52,14 78,8 94,22 C106,8 132,12 134,30 C152,26 162,44 156,60 C170,64 170,82 150,80 Z',
]
function CloudSVG({ color, shadowColor, width, variant = 0 }: { color: string; shadowColor: string; width: number; variant?: number }) {
  const path = CLOUD_PATHS[variant % CLOUD_PATHS.length]
  return (
    <svg viewBox="0 0 200 90" width={width} height={width * 0.48} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d={path} fill={shadowColor} transform="translate(4,6)" />
      <path d={path} fill={color} />
    </svg>
  )
}

/* ── Clouds (5 elements, keep framer-motion — translateX is compositor) ── */
function Clouds({ isDark = true }: { isDark?: boolean }) {
  const cloudColor  = isDark ? 'rgba(148,163,184,0.55)' : 'rgba(255,255,255,0.82)'
  const shadowColor = isDark ? 'rgba(71,85,105,0.30)'   : 'rgba(148,163,184,0.45)'
  const clouds = useMemo(() => [
    { top: '4%',  width: 320, delay: 0,  dur: 30, op: isDark ? 0.70 : 0.88, v: 0 },
    { top: '20%', width: 240, delay: 9,  dur: 42, op: isDark ? 0.60 : 0.78, v: 1 },
    { top: '44%', width: 400, delay: 4,  dur: 50, op: isDark ? 0.55 : 0.72, v: 2 },
    { top: '66%', width: 280, delay: 18, dur: 36, op: isDark ? 0.50 : 0.68, v: 0 },
    { top: '14%', width: 180, delay: 24, dur: 28, op: isDark ? 0.42 : 0.60, v: 1 },
  ], [isDark])
  return (
    <>
      {clouds.map((c, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ top: c.top, opacity: c.op, willChange: 'transform' }}
          initial={{ x: '-32vw' }}
          animate={{ x: '120vw' }}
          transition={{ duration: c.dur, delay: c.delay, repeat: Infinity, ease: 'linear' }}
        >
          <CloudSVG color={cloudColor} shadowColor={shadowColor} width={c.width} variant={c.v} />
        </motion.div>
      ))}
    </>
  )
}

/* ── Rain — CSS animation, 0 JS per frame ──────────────────────────────── */
function Rain({ heavy = false, isDark = true }: { heavy?: boolean; isDark?: boolean }) {
  const count = heavy ? 45 : 28
  const windAngleDeg = heavy ? -14 : -8
  const drops = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id:       i,
      left:     `${-2 + (i / count) * 106}%`,
      delay:    `${(i * 0.048) % 2.2}s`,
      duration: `${heavy ? 0.44 + (i % 5) * 0.04 : 0.68 + (i % 5) * 0.07}s`,
      opacity:  isDark ? 0.44 + (i % 4) * 0.14 : 0.62 + (i % 4) * 0.12,
      height:   heavy ? 26 + (i % 8) * 3 : 18 + (i % 6) * 2,
      width:    heavy ? 1.5 : 1,
    })),
    [heavy, isDark, count],
  )
  const grad = isDark
    ? 'linear-gradient(to bottom,rgba(147,197,253,0.92),rgba(147,197,253,0))'
    : 'linear-gradient(to bottom,rgba(30,64,138,0.80),rgba(30,64,138,0))'
  return (
    <div style={{ transform: `skewX(${windAngleDeg}deg)`, position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {drops.map((d) => (
        <div
          key={d.id}
          className="absolute rounded-full"
          style={{
            left: d.left, top: '-6%',
            height: d.height, width: d.width,
            background: grad, opacity: d.opacity,
            willChange: 'transform',
            animation: `wx-rain-fall ${d.duration} ${d.delay} linear infinite`,
          }}
        />
      ))}
    </div>
  )
}

/* ── Snow — CSS animation, 0 JS per frame ──────────────────────────────── */
function Snow({ isDark = true }: { isDark?: boolean }) {
  const flakes = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id:       i,
      left:     `${(i / 20) * 100}%`,
      size:     3 + (i % 5),
      delay:    `${(i * 0.22) % 4.8}s`,
      duration: `${2.8 + (i % 5) * 0.5}s`,
      opacity:  isDark ? 0.55 + (i % 3) * 0.15 : 0.68 + (i % 3) * 0.10,
    })),
    [isDark],
  )
  return (
    <>
      {flakes.map((f) => (
        <div
          key={f.id}
          className={`absolute rounded-full ${isDark ? 'bg-white' : 'bg-slate-500'}`}
          style={{
            left: f.left, top: '-3%',
            width: f.size, height: f.size,
            opacity: f.opacity,
            willChange: 'transform',
            animation: `wx-snow-${f.id % 4} ${f.duration} ${f.delay} linear infinite`,
          }}
        />
      ))}
    </>
  )
}

/* ── Sun Rays (keep framer-motion — 1 rotating element) ─────────────────── */
function SunRays({ isDark = true }: { isDark?: boolean }) {
  const glowOp  = isDark ? 0.22 : 0.40
  const rayOp   = isDark ? 0.50 : 0.75
  const coreOp  = isDark ? [0.40, 0.65, 0.40] : [0.60, 0.88, 0.60]
  const flareOp = isDark ? [0, 0.60, 0] : [0, 0.90, 0]
  return (
    <div className="absolute top-[-90px] right-[-90px] w-[380px] h-[380px]">
      <div className="absolute inset-0 rounded-full blur-3xl"
        style={{ background: `rgba(245,158,11,${glowOp})` }} />
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        style={{ willChange: 'transform' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
      >
        {Array.from({ length: 14 }, (_, i) => (
          <div key={i} className="absolute" style={{
            width: i % 2 === 0 ? 3 : 1.5,
            height: i % 2 === 0 ? 95 : 62,
            borderRadius: 2,
            transformOrigin: 'center bottom',
            transform: `rotate(${i * (360 / 14)}deg) translateY(calc(-50% - 65px))`,
            background: `linear-gradient(to top,rgba(245,158,11,${rayOp}),rgba(245,158,11,0))`,
          }} />
        ))}
      </motion.div>
      <motion.div className="absolute inset-[34%] rounded-full blur-xl"
        style={{ background: 'rgba(253,230,138,0.55)' }}
        animate={{ scale: [1, 1.35, 1], opacity: coreOp }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div className="absolute top-[47%] left-[6%] w-[88%] h-[1.5px]"
        style={{ background: 'linear-gradient(to right,transparent,rgba(253,230,138,0.45),transparent)' }}
        animate={{ opacity: flareOp }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }} />
    </div>
  )
}

/* ── Mist (3 elements) ───────────────────────────────────────────────────── */
function Mist({ isDark = true }: { isDark?: boolean }) {
  return (
    <>
      {[
        { top: '12%', oD: 0.12, oL: 0.26 },
        { top: '38%', oD: 0.10, oL: 0.22 },
        { top: '64%', oD: 0.08, oL: 0.18 },
      ].map((m, i) => (
        <motion.div
          key={i}
          className={`absolute left-0 right-0 h-36 blur-3xl ${isDark ? 'bg-slate-300' : 'bg-slate-700'}`}
          style={{ top: m.top, opacity: isDark ? m.oD : m.oL }}
          animate={{ x: ['-6%', '6%', '-6%'] }}
          transition={{ duration: 9 + i * 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </>
  )
}

/* ── SVG Lightning bolts ─────────────────────────────────────────────────── */
const BOLT_LEFT  = 'M0,0 L-9,38 L2,38 L-11,82 L14,30 L2,30 Z'
const BOLT_RIGHT = 'M0,0 L-7,30 L2,30 L-9,68 L11,24 L2,24 Z'

function LightningBolts() {
  return (
    <>
      <motion.div className="absolute pointer-events-none" style={{ left: '26%', top: '8%' }}
        animate={{ opacity: [0, 0, 1, 0, 0, 0, 0.85, 0] }}
        transition={{ duration: 5.5, delay: 1.8, repeat: Infinity, times: [0, 0.40, 0.42, 0.47, 0.52, 0.74, 0.76, 1] }}>
        <svg width="30" height="90" viewBox="-15 0 30 90" overflow="visible" aria-hidden="true">
          <path d={BOLT_LEFT} fill="rgba(253,224,71,0.88)" />
          <path d={BOLT_LEFT} fill="rgba(253,224,71,0.35)" style={{ filter: 'blur(4px)' }} transform="scale(1.4) translate(-3,0)" />
        </svg>
      </motion.div>
      <motion.div className="absolute pointer-events-none" style={{ left: '64%', top: '12%' }}
        animate={{ opacity: [0, 0, 0.85, 0, 0, 0, 1, 0] }}
        transition={{ duration: 5.5, delay: 2.2, repeat: Infinity, times: [0, 0.40, 0.43, 0.48, 0.52, 0.74, 0.77, 1] }}>
        <svg width="24" height="76" viewBox="-12 0 24 76" overflow="visible" aria-hidden="true">
          <path d={BOLT_RIGHT} fill="rgba(253,224,71,0.80)" />
          <path d={BOLT_RIGHT} fill="rgba(253,224,71,0.28)" style={{ filter: 'blur(3px)' }} transform="scale(1.3) translate(-2,0)" />
        </svg>
      </motion.div>
    </>
  )
}

/* ── Thunder ─────────────────────────────────────────────────────────────── */
function Thunder({ isDark = true }: { isDark?: boolean }) {
  const flashColor = isDark ? 'rgba(139,92,246,0.18)' : 'rgba(109,40,217,0.25)'
  return (
    <>
      <Rain heavy isDark={isDark} />
      <Clouds isDark={isDark} />
      <LightningBolts />
      <motion.div className="absolute inset-0" style={{ background: flashColor }}
        animate={{ opacity: [0, 0, 1, 0.2, 0, 0, 0.8, 0] }}
        transition={{ duration: 5.5, delay: 1.8, repeat: Infinity, times: [0, 0.42, 0.44, 0.47, 0.51, 0.76, 0.78, 1] }} />
    </>
  )
}

/* ── Main export ─────────────────────────────────────────────────────────── */
export function WeatherBackground({ conditionId, isDark }: WeatherBackgroundProps) {
  const prefersReducedMotion = useReducedMotion()
  if (prefersReducedMotion) return null

  const fx = getFXType(conditionId)
  if (!fx) return null

  const tint = tintMap[fx]

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }} aria-hidden="true">
      <div className="absolute inset-0" style={{ background: isDark ? tint.dark : tint.light }} />

      {fx === 'clear' && isDark  && <AuroraEffect />}
      {fx === 'clear' && isDark  && <StarField />}
      {fx === 'clear' && isDark  && <ShootingStars />}
      {fx === 'clear' && isDark  && <MoonOrb />}
      {fx === 'clear' && !isDark && <SunRays isDark={isDark} />}

      {(fx === 'rain' || fx === 'drizzle') && <Rain isDark={isDark} />}
      {fx === 'thunder'                    && <Thunder isDark={isDark} />}
      {fx === 'snow'                        && <Snow isDark={isDark} />}
      {fx === 'clouds'                      && <Clouds isDark={isDark} />}
      {fx === 'mist'                        && <Mist isDark={isDark} />}
    </div>
  )
}
