import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

interface LandscapeSceneProps {
  conditionId: number
  isDark: boolean
}

type SceneCondition = 'rain' | 'thunder' | 'drizzle' | 'snow' | 'clear' | 'cloudy' | 'mist' | 'default'

function getSceneCondition(id: number): SceneCondition {
  if (id >= 200 && id < 300) return 'thunder'
  if (id >= 300 && id < 400) return 'drizzle'
  if (id >= 500 && id < 600) return 'rain'
  if (id >= 600 && id < 700) return 'snow'
  if (id >= 700 && id < 800) return 'mist'
  if (id === 800) return 'clear'
  if (id > 800) return 'cloudy'
  return 'default'
}

/* ─── Ground / Hill layers ──────────────────────────────────────────────── */
function GroundLayer({ isDark }: { isDark: boolean }) {
  const backFill  = isDark ? 'rgba(15,23,42,0.82)'   : 'rgba(34,100,50,0.60)'
  const frontFill = isDark ? 'rgba(7,10,20,0.94)'    : 'rgba(20,78,40,0.82)'

  return (
    <svg
      viewBox="0 0 1440 190"
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    >
      {/* back rolling hills */}
      <path
        d="M0,88 C180,50 360,78 540,60 C720,42 900,70 1080,52 C1260,34 1380,60 1440,54 L1440,190 L0,190 Z"
        fill={backFill}
      />
      {/* front ground (closer, darker) */}
      <path
        d="M0,136 C120,120 280,146 440,134 C600,120 760,148 920,138 C1080,126 1260,146 1440,138 L1440,190 L0,190 Z"
        fill={frontFill}
      />
    </svg>
  )
}

/* ─── Tree shapes ───────────────────────────────────────────────────────── */
function PineTree({ fill, h = 52 }: { fill: string; h?: number }) {
  const w = h * 0.56
  return (
    <svg
      width={w}
      height={h + 10}
      viewBox={`0 0 ${w} ${h + 10}`}
      overflow="visible"
      aria-hidden="true"
    >
      <polygon points={`${w / 2},0 0,${h} ${w},${h}`} fill={fill} />
      <rect x={w / 2 - 3} y={h} width="6" height="10" rx="1" fill={fill} opacity={0.65} />
    </svg>
  )
}

function RoundTree({ fill, h = 50 }: { fill: string; h?: number }) {
  const r = h * 0.42
  const cx = r * 1.3
  return (
    <svg
      width={cx * 2}
      height={h + 10}
      viewBox={`0 0 ${cx * 2} ${h + 10}`}
      overflow="visible"
      aria-hidden="true"
    >
      <circle cx={cx} cy={r} r={r} fill={fill} />
      <rect x={cx - 3.5} y={r * 1.6} width="7" height={h - r * 1.6 + 8} rx="1.5" fill={fill} opacity={0.60} />
    </svg>
  )
}

/* ─── Tree layer (positioned on back hills) ─────────────────────────────── */
function TreeLayer({ isDark }: { isDark: boolean }) {
  const fill = isDark ? 'rgba(18,32,56,0.90)' : 'rgba(20,84,44,0.84)'

  const trees: { x: string; type: 'pine' | 'round'; sc: number; bot: number }[] = [
    { x: '4%',  type: 'pine',  sc: 0.68, bot: 100 },
    { x: '13%', type: 'round', sc: 0.82, bot: 96  },
    { x: '24%', type: 'pine',  sc: 0.54, bot: 104 },
    { x: '38%', type: 'round', sc: 0.88, bot: 94  },
    { x: '52%', type: 'pine',  sc: 0.62, bot: 102 },
    { x: '64%', type: 'round', sc: 0.78, bot: 98  },
    { x: '76%', type: 'pine',  sc: 0.70, bot: 100 },
    { x: '87%', type: 'round', sc: 0.58, bot: 104 },
    { x: '95%', type: 'pine',  sc: 0.64, bot: 98  },
  ]

  return (
    <>
      {trees.map((t, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: t.x,
            bottom: t.bot,
            transform: `scale(${t.sc})`,
            transformOrigin: 'bottom center',
          }}
        >
          {t.type === 'pine'
            ? <PineTree fill={fill} h={52} />
            : <RoundTree fill={fill} h={50} />}
        </div>
      ))}
    </>
  )
}

/* ─── Walking character ─────────────────────────────────────────────────── */
function WalkingCharacter({ condition, isDark }: { condition: SceneCondition; isDark: boolean }) {
  const bodyColor = isDark ? 'rgba(203,213,225,0.90)' : 'rgba(15,23,42,0.84)'
  const isRainy   = ['rain', 'thunder', 'drizzle'].includes(condition)
  const isSnowy   = condition === 'snow'

  const umbrellaStroke = isDark ? '#93C5FD' : '#2563EB'
  const umbrellaFill   = isDark ? 'rgba(147,197,253,0.55)' : 'rgba(59,130,246,0.60)'

  // Snowy character gets a slightly rounder body (coat)
  const bodyW = isSnowy ? 13 : 10
  const bodyX = isSnowy ? 19.5 : 21

  return (
    <motion.div
      style={{ position: 'absolute', bottom: 52 }}
      initial={{ x: '110vw' }}
      animate={{ x: '-18vw' }}
      transition={{ duration: 28, repeat: Infinity, ease: 'linear', delay: 4 }}
    >
      <svg
        width="54"
        height={isRainy ? 96 : 80}
        viewBox={isRainy ? '0 -22 54 96' : '0 0 54 80'}
        overflow="visible"
        aria-hidden="true"
      >
        {/* Umbrella */}
        {isRainy && (
          <>
            <path
              d="M6,-18 Q27,-40 48,-18"
              fill={umbrellaFill}
              stroke={umbrellaStroke}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line x1="27" y1="-18" x2="27" y2="2" stroke={umbrellaStroke} strokeWidth="2" strokeLinecap="round" />
          </>
        )}

        {/* Head */}
        <circle cx="27" cy="10" r={isSnowy ? 11 : 9} fill={bodyColor} />

        {/* Body */}
        <rect x={bodyX} y="20" width={bodyW} height="26" rx="3.5" fill={bodyColor} />

        {/* Left arm — static when holding umbrella */}
        <motion.line
          x1="21" y1="26" x2="11" y2="38"
          stroke={bodyColor} strokeWidth="4.5" strokeLinecap="round"
          style={{ transformOrigin: '21px 26px' }}
          animate={{ rotate: isRainy ? [-8, -8] : [-26, 20, -26] }}
          transition={{ duration: 0.70, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Right arm — raised to hold umbrella when rainy */}
        <motion.line
          x1="33" y1="26"
          x2={isRainy ? '27' : '43'}
          y2={isRainy ? '0'  : '38'}
          stroke={bodyColor} strokeWidth="4.5" strokeLinecap="round"
          style={{ transformOrigin: '33px 26px' }}
          animate={{ rotate: isRainy ? [-4, -4] : [20, -26, 20] }}
          transition={{ duration: 0.70, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Left leg */}
        <motion.line
          x1="23" y1="46" x2="15" y2="68"
          stroke={bodyColor} strokeWidth={isSnowy ? 6 : 5} strokeLinecap="round"
          style={{ transformOrigin: '23px 46px' }}
          animate={{ rotate: [-30, 30, -30] }}
          transition={{ duration: 0.70, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Right leg */}
        <motion.line
          x1="31" y1="46" x2="39" y2="68"
          stroke={bodyColor} strokeWidth={isSnowy ? 6 : 5} strokeLinecap="round"
          style={{ transformOrigin: '31px 46px' }}
          animate={{ rotate: [30, -30, 30] }}
          transition={{ duration: 0.70, repeat: Infinity, ease: 'easeInOut' }}
        />
      </svg>
    </motion.div>
  )
}

/* ─── Sun orb (clear + light) ───────────────────────────────────────────── */
function SceneSun() {
  return (
    <motion.div
      style={{ position: 'absolute', right: '11%', bottom: 105, width: 52, height: 52 }}
      animate={{ y: [-5, 5, -5] }}
      transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,249,196,0.98) 0%, rgba(253,230,138,0.88) 50%, rgba(245,158,11,0.40) 100%)',
          boxShadow: '0 0 28px rgba(245,158,11,0.60), 0 0 64px rgba(245,158,11,0.28)',
          filter: 'blur(0.5px)',
        }}
      />
    </motion.div>
  )
}

/* ─── Moon orb (clear + dark) ───────────────────────────────────────────── */
function SceneMoon() {
  return (
    <motion.div
      style={{ position: 'absolute', right: '12%', bottom: 108, width: 38, height: 38 }}
      animate={{ y: [-4, 4, -4] }}
      transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 35%, rgba(226,232,240,0.95) 0%, rgba(148,163,184,0.72) 70%, transparent 100%)',
          boxShadow: '0 0 18px rgba(148,163,184,0.45), 0 0 40px rgba(148,163,184,0.18)',
        }}
      />
    </motion.div>
  )
}

/* ─── In-scene rain drops ───────────────────────────────────────────────── */
function SceneRain({ heavy, isDark }: { heavy: boolean; isDark: boolean }) {
  const count = heavy ? 22 : 14
  const drops = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id:      i,
        left:    `${5 + (i / count) * 90}%`,
        delay:   (i * 0.11) % 1.6,
        dur:     heavy ? 0.36 + (i % 4) * 0.04 : 0.52 + (i % 4) * 0.06,
        height:  heavy ? 16 + (i % 6) * 2 : 12 + (i % 5) * 2,
        opacity: isDark ? 0.50 + (i % 3) * 0.14 : 0.65 + (i % 3) * 0.12,
      })),
    [heavy, isDark, count]
  )

  const grad = isDark
    ? 'linear-gradient(to bottom, rgba(147,197,253,0.90), rgba(147,197,253,0))'
    : 'linear-gradient(to bottom, rgba(30,64,138,0.82), rgba(30,64,138,0))'

  return (
    <>
      {drops.map((d) => (
        <motion.div
          key={d.id}
          className="absolute w-px rounded-full"
          style={{ left: d.left, top: 0, height: d.height, background: grad, opacity: d.opacity }}
          animate={{ y: '200px' }}
          transition={{ duration: d.dur, delay: d.delay, repeat: Infinity, ease: 'linear' }}
        />
      ))}
    </>
  )
}

/* ─── In-scene snow ─────────────────────────────────────────────────────── */
function SceneSnow({ isDark }: { isDark: boolean }) {
  const flakes = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        id:      i,
        left:    `${(i / 16) * 100}%`,
        size:    2.5 + (i % 4),
        delay:   (i * 0.20) % 3.2,
        dur:     2.2 + (i % 5) * 0.36,
        opacity: isDark ? 0.58 + (i % 3) * 0.16 : 0.55 + (i % 3) * 0.12,
      })),
    [isDark]
  )

  return (
    <>
      {flakes.map((f) => (
        <motion.div
          key={f.id}
          className={`absolute rounded-full ${isDark ? 'bg-white' : 'bg-slate-500'}`}
          style={{ left: f.left, top: 0, width: f.size, height: f.size, opacity: f.opacity }}
          animate={{ y: '195px', x: [0, 14, -10, 6, 0] }}
          transition={{ duration: f.dur, delay: f.delay, repeat: Infinity, ease: 'linear' }}
        />
      ))}
    </>
  )
}

/* ─── Mist wisps ────────────────────────────────────────────────────────── */
function SceneMist({ isDark }: { isDark: boolean }) {
  return (
    <>
      {[
        { bottom: 90, op: isDark ? 0.14 : 0.24, dur: 10 },
        { bottom: 72, op: isDark ? 0.10 : 0.18, dur: 14 },
        { bottom: 55, op: isDark ? 0.08 : 0.14, dur: 12 },
      ].map((m, i) => (
        <motion.div
          key={i}
          className={`absolute left-0 right-0 h-10 blur-2xl ${isDark ? 'bg-slate-300' : 'bg-slate-500'}`}
          style={{ bottom: m.bottom, opacity: m.op }}
          animate={{ x: ['-5%', '5%', '-5%'] }}
          transition={{ duration: m.dur, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </>
  )
}

/* ─── Main export ───────────────────────────────────────────────────────── */
export function LandscapeScene({ conditionId, isDark }: LandscapeSceneProps) {
  const prefersReducedMotion = useReducedMotion()
  if (prefersReducedMotion) return null

  const condition = getSceneCondition(conditionId)

  const hasRain = ['rain', 'thunder', 'drizzle'].includes(condition)
  const hasSnow = condition === 'snow'
  const hasMist = condition === 'mist'
  const isClear = condition === 'clear'

  return (
    <div
      className="fixed bottom-0 left-0 right-0 overflow-hidden pointer-events-none"
      style={{ height: 190, zIndex: 2 }}
      aria-hidden="true"
    >
      {/* Fade the top edge so the scene dissolves into the page content */}
      <div
        className="absolute inset-x-0 top-0 z-10"
        style={{
          height: 60,
          background: isDark
            ? 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, transparent 100%)'
            : 'linear-gradient(to bottom, rgba(74,144,196,1) 0%, transparent 100%)',
        }}
      />

      {/* Condition-specific FX within the scene */}
      {hasRain && <SceneRain heavy={condition === 'thunder'} isDark={isDark} />}
      {hasSnow && <SceneSnow isDark={isDark} />}
      {hasMist && <SceneMist isDark={isDark} />}

      {/* Celestial bodies */}
      {isClear && isDark  && <SceneMoon />}
      {isClear && !isDark && <SceneSun />}

      {/* Trees behind the character */}
      <TreeLayer isDark={isDark} />

      {/* Ground hills */}
      <GroundLayer isDark={isDark} />

      {/* Walking character (on top of ground) */}
      <WalkingCharacter condition={condition} isDark={isDark} />
    </div>
  )
}
