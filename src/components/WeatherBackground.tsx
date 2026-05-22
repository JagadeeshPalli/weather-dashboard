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

/* Condition tint — shifts the whole background subtly per condition */
const tintMap: Record<FXType, { dark: string; light: string }> = {
  thunder: { dark: 'rgba(45,20,80,0.40)',  light: 'rgba(70,40,110,0.22)' },
  rain:    { dark: 'rgba(10,25,70,0.35)',  light: 'rgba(20,60,130,0.18)' },
  drizzle: { dark: 'rgba(10,20,55,0.28)',  light: 'rgba(20,50,110,0.14)' },
  snow:    { dark: 'rgba(20,30,70,0.25)',  light: 'rgba(180,210,240,0.22)' },
  mist:    { dark: 'rgba(20,25,50,0.32)',  light: 'rgba(90,110,150,0.18)' },
  clear:   { dark: 'rgba(10,20,50,0.18)',  light: 'rgba(255,215,60,0.12)' },
  clouds:  { dark: 'rgba(18,22,45,0.30)',  light: 'rgba(70,90,130,0.14)' },
}

/* ─── SVG Cloud (actual cloud shape using overlapping ellipses) ─────────── */
interface CloudSVGProps {
  color: string
  width: number
}
function CloudSVG({ color, width }: CloudSVGProps) {
  return (
    <svg
      viewBox="0 0 240 110"
      width={width}
      height={width * 0.46}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <ellipse cx="120" cy="78" rx="110" ry="32" fill={color} />
      <ellipse cx="70"  cy="60" rx="52"  ry="48" fill={color} />
      <ellipse cx="130" cy="52" rx="60"  ry="52" fill={color} />
      <ellipse cx="185" cy="68" rx="48"  ry="38" fill={color} />
    </svg>
  )
}

/* ─── Clouds ─────────────────────────────────────────────────────────────── */
function Clouds({ isDark = true }: { isDark?: boolean }) {
  const cloudColor = isDark
    ? 'rgba(148,163,184,0.40)'
    : 'rgba(51,65,85,0.52)'

  const clouds = useMemo(
    () => [
      { top: '6%',  width: 300, delay: 0,   dur: 28, op: isDark ? 0.65 : 0.80 },
      { top: '22%', width: 220, delay: 10,  dur: 38, op: isDark ? 0.55 : 0.70 },
      { top: '48%', width: 380, delay: 5,   dur: 46, op: isDark ? 0.50 : 0.65 },
      { top: '68%', width: 260, delay: 18,  dur: 34, op: isDark ? 0.45 : 0.60 },
    ],
    [isDark]
  )

  return (
    <>
      {clouds.map((c, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ top: c.top, opacity: c.op }}
          initial={{ x: '-28vw' }}
          animate={{ x: '118vw' }}
          transition={{ duration: c.dur, delay: c.delay, repeat: Infinity, ease: 'linear' }}
        >
          <CloudSVG color={cloudColor} width={c.width} />
        </motion.div>
      ))}
    </>
  )
}

/* ─── Rain ──────────────────────────────────────────────────────────────── */
function Rain({ heavy = false, isDark = true }: { heavy?: boolean; isDark?: boolean }) {
  const count = heavy ? 52 : 34
  const drops = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id:       i,
        left:     `${(i / count) * 100}%`,
        delay:    (i * 0.055) % 2.5,
        duration: heavy ? 0.48 + (i % 5) * 0.05 : 0.72 + (i % 5) * 0.08,
        opacity:  isDark ? 0.40 + (i % 4) * 0.13 : 0.60 + (i % 4) * 0.10,
        height:   heavy ? 22 + (i % 8) * 3 : 15 + (i % 6) * 2,
      })),
    [heavy, isDark, count]
  )

  const grad = isDark
    ? 'linear-gradient(to bottom, rgba(147,197,253,0.90), rgba(147,197,253,0))'
    : 'linear-gradient(to bottom, rgba(30,64,138,0.75), rgba(30,64,138,0))'

  return (
    <>
      {drops.map((d) => (
        <motion.div
          key={d.id}
          className="absolute w-px rounded-full"
          style={{ left: d.left, top: '-4%', height: d.height, background: grad, opacity: d.opacity }}
          animate={{ y: '112vh' }}
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
      Array.from({ length: 28 }, (_, i) => ({
        id:       i,
        left:     `${(i / 28) * 100}%`,
        size:     3 + (i % 5),
        delay:    (i * 0.16) % 4.8,
        duration: 2.8 + (i % 5) * 0.5,
        sway:     18 + (i % 4) * 14,
        opacity:  isDark ? 0.55 + (i % 3) * 0.15 : 0.68 + (i % 3) * 0.10,
      })),
    [isDark]
  )

  return (
    <>
      {flakes.map((f) => (
        <motion.div
          key={f.id}
          className={`absolute rounded-full ${isDark ? 'bg-white' : 'bg-slate-500'}`}
          style={{ left: f.left, top: '-3%', width: f.size, height: f.size, opacity: f.opacity }}
          animate={{ y: '112vh', x: [0, f.sway, -(f.sway / 2), f.sway / 3, 0] }}
          transition={{ duration: f.duration, delay: f.delay, repeat: Infinity, ease: 'linear' }}
        />
      ))}
    </>
  )
}

/* ─── Sun Rays ──────────────────────────────────────────────────────────── */
function SunRays({ isDark = true }: { isDark?: boolean }) {
  const glowOp   = isDark ? 0.22 : 0.40
  const rayOp    = isDark ? 0.50 : 0.75
  const coreOp   = isDark ? [0.40, 0.65, 0.40] : [0.60, 0.88, 0.60]
  const flareOp  = isDark ? [0, 0.60, 0] : [0, 0.90, 0]

  return (
    <div className="absolute top-[-90px] right-[-90px] w-[380px] h-[380px]">
      <div
        className="absolute inset-0 rounded-full blur-3xl"
        style={{ background: `rgba(245,158,11,${glowOp})` }}
      />
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ rotate: 360 }}
        transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
      >
        {Array.from({ length: 14 }, (_, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              width: i % 2 === 0 ? 3 : 1.5,
              height: i % 2 === 0 ? 95 : 62,
              borderRadius: 2,
              transformOrigin: 'center bottom',
              transform: `rotate(${i * (360 / 14)}deg) translateY(calc(-50% - 65px))`,
              background: `linear-gradient(to top, rgba(245,158,11,${rayOp}), rgba(245,158,11,0))`,
            }}
          />
        ))}
      </motion.div>
      <motion.div
        className="absolute inset-[34%] rounded-full blur-xl"
        style={{ background: 'rgba(253,230,138,0.55)' }}
        animate={{ scale: [1, 1.35, 1], opacity: coreOp }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-[47%] left-[6%] w-[88%] h-[1.5px]"
        style={{ background: 'linear-gradient(to right, transparent, rgba(253,230,138,0.45), transparent)' }}
        animate={{ opacity: flareOp }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
      />
    </div>
  )
}

/* ─── Mist ──────────────────────────────────────────────────────────────── */
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

/* ─── Thunder ───────────────────────────────────────────────────────────── */
function Thunder({ isDark = true }: { isDark?: boolean }) {
  const flashColor = isDark ? 'rgba(139,92,246,0.18)' : 'rgba(109,40,217,0.25)'
  return (
    <>
      <Rain heavy isDark={isDark} />
      {/* Also show clouds behind the rain */}
      <Clouds isDark={isDark} />
      <motion.div
        className="absolute inset-0"
        style={{ background: flashColor }}
        animate={{ opacity: [0, 0, 1, 0.2, 0, 0, 0.8, 0] }}
        transition={{
          duration: 5.5,
          delay: 1.8,
          repeat: Infinity,
          times: [0, 0.42, 0.44, 0.47, 0.51, 0.76, 0.78, 1],
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
      {/* Per-condition colour tint over background */}
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
