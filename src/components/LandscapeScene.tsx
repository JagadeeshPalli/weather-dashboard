import { useMemo, lazy, Suspense } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useLottieAnim } from '../hooks/useLottieAnim'

// Lazy-load lottie-react so it only bundles when actually needed
const Lottie = lazy(() => import('lottie-react'))

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

/* Jacket colour per condition ─────────────────────────────────────────────── */
const jacketColorMap: Record<SceneCondition, string> = {
  clear:   '#10B981',
  rain:    '#3B82F6',
  drizzle: '#60A5FA',
  thunder: '#6366F1',
  snow:    '#F97316',
  cloudy:  '#64748B',
  mist:    '#94A3B8',
  default: '#64748B',
}

/* ─── Ground / Hill SVG ────────────────────────────────────────────────────── */
function GroundLayer({ isDark }: { isDark: boolean }) {
  const backFill  = isDark ? 'rgba(15,23,42,0.82)'  : 'rgba(34,100,50,0.60)'
  const frontFill = isDark ? 'rgba(6,10,20,0.95)'   : 'rgba(19,74,38,0.84)'
  return (
    <svg viewBox="0 0 1440 190" preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full" aria-hidden="true">
      {/* back rolling hills */}
      <path d="M0,88 C180,50 360,78 540,60 C720,42 900,70 1080,52 C1260,34 1380,60 1440,54 L1440,190 L0,190 Z"
        fill={backFill} />
      {/* front ground */}
      <path d="M0,136 C120,120 280,146 440,134 C600,120 760,148 920,138 C1080,126 1260,146 1440,138 L1440,190 L0,190 Z"
        fill={frontFill} />
    </svg>
  )
}

/* ─── House silhouette (background depth) ──────────────────────────────────── */
function HouseSilhouette({ isDark }: { isDark: boolean }) {
  const fill = isDark ? 'rgba(12,18,36,0.78)' : 'rgba(28,64,40,0.55)'
  return (
    <div style={{ position: 'absolute', right: '16%', bottom: 92 }}>
      <svg width="72" height="66" viewBox="0 0 72 66" aria-hidden="true">
        {/* roof */}
        <polygon points="0,30 36,0 72,30" fill={fill} />
        {/* walls */}
        <rect x="6" y="30" width="60" height="36" fill={fill} />
        {/* door */}
        <rect x="28" y="44" width="16" height="22" rx="2"
          fill={isDark ? 'rgba(0,0,0,0.50)' : 'rgba(255,255,255,0.22)'} />
        {/* left window */}
        <rect x="11" y="36" width="14" height="12" rx="1.5"
          fill={isDark ? 'rgba(253,230,138,0.18)' : 'rgba(255,255,255,0.30)'} />
        {/* right window */}
        <rect x="47" y="36" width="14" height="12" rx="1.5"
          fill={isDark ? 'rgba(253,230,138,0.18)' : 'rgba(255,255,255,0.30)'} />
        {/* chimney */}
        <rect x="48" y="8" width="10" height="24" fill={fill} />
      </svg>
    </div>
  )
}

/* ─── Tree SVG shapes ───────────────────────────────────────────────────────── */
function PineTree({ fill, h = 52 }: { fill: string; h?: number }) {
  const w = h * 0.56
  return (
    <svg width={w} height={h + 10} viewBox={`0 0 ${w} ${h + 10}`} overflow="visible" aria-hidden="true">
      <polygon points={`${w / 2},0 0,${h} ${w},${h}`} fill={fill} />
      <rect x={w / 2 - 3} y={h} width="6" height="10" rx="1" fill={fill} opacity={0.60} />
    </svg>
  )
}
function RoundTree({ fill, h = 50 }: { fill: string; h?: number }) {
  const r = h * 0.42
  const cx = r * 1.3
  return (
    <svg width={cx * 2} height={h + 10} viewBox={`0 0 ${cx * 2} ${h + 10}`} overflow="visible" aria-hidden="true">
      <circle cx={cx} cy={r} r={r} fill={fill} />
      <rect x={cx - 3.5} y={r * 1.6} width="7" height={h - r * 1.6 + 8} rx="1.5" fill={fill} opacity={0.55} />
    </svg>
  )
}

/* ─── Tree placement layer ──────────────────────────────────────────────────── */
function TreeLayer({ isDark }: { isDark: boolean }) {
  const fill = isDark ? 'rgba(14,26,50,0.92)' : 'rgba(18,78,42,0.86)'
  const trees: { x: string; type: 'pine' | 'round'; sc: number; bot: number }[] = [
    { x: '3%',  type: 'pine',  sc: 0.66, bot: 100 },
    { x: '11%', type: 'round', sc: 0.80, bot: 96  },
    { x: '22%', type: 'pine',  sc: 0.52, bot: 104 },
    { x: '34%', type: 'round', sc: 0.86, bot: 94  },
    { x: '48%', type: 'pine',  sc: 0.60, bot: 102 },
    { x: '60%', type: 'round', sc: 0.76, bot: 98  },
    { x: '73%', type: 'pine',  sc: 0.68, bot: 100 },
    { x: '84%', type: 'round', sc: 0.56, bot: 104 },
    { x: '93%', type: 'pine',  sc: 0.62, bot: 98  },
  ]
  return (
    <>
      {trees.map((t, i) => (
        <div key={i} style={{
          position: 'absolute', left: t.x, bottom: t.bot,
          transform: `scale(${t.sc})`, transformOrigin: 'bottom center',
        }}>
          {t.type === 'pine' ? <PineTree fill={fill} h={52} /> : <RoundTree fill={fill} h={50} />}
        </div>
      ))}
    </>
  )
}

/* ─── Lottie character (when public/lottie/<condition>.json exists) ─────────── */
const LottieCharacter = ({ condition }: { condition: SceneCondition }) => {
  const anim = useLottieAnim(condition)

  if (anim.status !== 'ready') return null   // unavailable → parent renders SVG fallback

  return (
    <motion.div
      style={{ position: 'absolute', bottom: 44, width: 160, height: 160 }}
      initial={{ x: '110vw' }}
      animate={{ x: '-20vw' }}
      transition={{ duration: 30, repeat: Infinity, ease: 'linear', delay: 2 }}
    >
      <Suspense fallback={null}>
        <Lottie
          animationData={anim.data}
          loop
          autoplay
          style={{ width: '100%', height: '100%' }}
          rendererSettings={{ preserveAspectRatio: 'xMidYMid meet' }}
        />
      </Suspense>
    </motion.div>
  )
}

/* ─── Illustrated SVG walking character (Samsung-style flat design) ─────────
   Fallback used when no Lottie JSON is present in public/lottie/.
   SVG viewBox="0 0 62 118" (1:1 px mapping), overflow=visible for umbrella.
   motion.g groups keep shoes/hands anchored to rotating limbs.
   ──────────────────────────────────────────────────────────────────────────── */
function WalkingCharacter({ condition }: { condition: SceneCondition; isDark?: boolean }) {
  const skinColor  = '#F5CBA7'
  const hairColor  = '#2C1810'
  const pantsColor = '#374151'
  const shoeColor  = '#1F2937'
  const jacketColor = jacketColorMap[condition]

  const isRainy = ['rain', 'thunder', 'drizzle'].includes(condition)
  const isSnowy = condition === 'snow'
  const isClear = condition === 'clear'

  const walkT = { duration: 0.70, repeat: Infinity, ease: 'easeInOut' as const }

  /* Arms: pivot at shoulder joints (18, 34) and (44, 34) */
  const leftArmRotate  = isRainy ? ([-6, -6, -6] as number[])  : ([-26, 20, -26] as number[])
  const rightArmRotate = isRainy ? ([0,   0,   0] as number[]) : ([20, -26, 20]  as number[])

  return (
    <motion.div
      style={{ position: 'absolute', bottom: 52, overflow: 'visible' }}
      initial={{ x: '110vw' }}
      animate={{ x: '-18vw' }}
      transition={{ duration: 28, repeat: Infinity, ease: 'linear', delay: 4 }}
    >
      <svg width="62" height="118" viewBox="0 0 62 118" overflow="visible" aria-hidden="true">

        {/* ── Umbrella (rain) ─────────────────────────────────────────────── */}
        {isRainy && (
          <g>
            {/* canopy */}
            <path d="M7,-44 Q31,-66 55,-44 Q55,-26 31,-28 Q7,-26 7,-44 Z"
              fill="rgba(147,197,253,0.65)" stroke="#3B82F6" strokeWidth="2" />
            {/* panel lines */}
            <line x1="31" y1="-64" x2="31" y2="-28" stroke="rgba(59,130,246,0.40)" strokeWidth="1" />
            <line x1="19" y1="-62" x2="16" y2="-28" stroke="rgba(59,130,246,0.30)" strokeWidth="1" />
            <line x1="43" y1="-62" x2="46" y2="-28" stroke="rgba(59,130,246,0.30)" strokeWidth="1" />
            {/* handle */}
            <path d="M31,-28 L31,-2" stroke="#3B82F6" strokeWidth="2.2" strokeLinecap="round" />
          </g>
        )}

        {/* ── Winter hat (snow) ───────────────────────────────────────────── */}
        {isSnowy && (
          <g>
            <path d="M18,8 Q31,-8 44,8 L42,15 Q31,10 20,15 Z" fill="#F97316" />
            <rect x="13" y="13" width="36" height="5" rx="2.5" fill="#EA580C" />
            {/* pom-pom */}
            <circle cx="31" cy="-6" r="5" fill="#FED7AA" />
          </g>
        )}

        {/* ── Sun hat (clear) ─────────────────────────────────────────────── */}
        {isClear && (
          <g>
            <ellipse cx="31" cy="7" rx="20" ry="5" fill="#D97706" opacity={0.92} />
            <ellipse cx="31" cy="4" rx="11" ry="6.5" fill="#FBBF24" />
          </g>
        )}

        {/* ── Head ────────────────────────────────────────────────────────── */}
        <circle cx="31" cy="14" r="12" fill={skinColor} />

        {/* hair */}
        <path d="M19,10 Q23,1 31,1 Q39,1 43,10 Q39,5 31,4 Q23,5 19,10 Z" fill={hairColor} />

        {/* eyes */}
        <circle cx="26" cy="12" r="2" fill="#1F2937" />
        <circle cx="36" cy="12" r="2" fill="#1F2937" />
        {/* eye shine */}
        <circle cx="27" cy="11" r="0.8" fill="white" opacity={0.8} />
        <circle cx="37" cy="11" r="0.8" fill="white" opacity={0.8} />

        {/* smile */}
        <path d="M26,18 Q31,23 36,18" stroke="#B8702A" strokeWidth="1.4" fill="none" strokeLinecap="round" />

        {/* ── Body / jacket ───────────────────────────────────────────────── */}
        <rect x="19" y="26" width="24" height="32" rx="5" fill={jacketColor} />
        {/* collar */}
        <path d="M23,26 L31,32 L39,26" fill="none"
          stroke={`rgba(255,255,255,0.30)`} strokeWidth="1.5" strokeLinejoin="round" />
        {/* zip / centre seam */}
        <line x1="31" y1="32" x2="31" y2="57"
          stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" strokeDasharray="2.5 2" />

        {/* ── Left arm + hand ─────────────────────────────────────────────── */}
        <motion.g style={{ transformOrigin: '19px 34px' }} animate={{ rotate: leftArmRotate }} transition={walkT}>
          <line x1="19" y1="34" x2="8" y2="51"
            stroke={jacketColor} strokeWidth="7" strokeLinecap="round" />
          <circle cx="7" cy="54" r="4.5" fill={skinColor} />
        </motion.g>

        {/* ── Right arm + hand (raised if holding umbrella) ───────────────── */}
        {isRainy ? (
          /* Static raised arm holding umbrella handle */
          <g>
            <line x1="43" y1="34" x2="31" y2="4"
              stroke={jacketColor} strokeWidth="7" strokeLinecap="round" />
            <circle cx="31" cy="1" r="4.5" fill={skinColor} />
          </g>
        ) : (
          <motion.g style={{ transformOrigin: '43px 34px' }} animate={{ rotate: rightArmRotate }} transition={walkT}>
            <line x1="43" y1="34" x2="54" y2="51"
              stroke={jacketColor} strokeWidth="7" strokeLinecap="round" />
            <circle cx="55" cy="54" r="4.5" fill={skinColor} />
          </motion.g>
        )}

        {/* ── Left leg + shoe ─────────────────────────────────────────────── */}
        <motion.g style={{ transformOrigin: '25px 58px' }}
          initial={{ rotate: -28 }}
          animate={{ rotate: [-28, 28, -28] }}
          transition={walkT}
        >
          <line x1="25" y1="58" x2="22" y2="94"
            stroke={pantsColor} strokeWidth="9" strokeLinecap="round" />
          {/* shoe */}
          <ellipse cx="19" cy="98" rx="10" ry="5" fill={shoeColor} />
          {/* shoe highlight */}
          <ellipse cx="17" cy="96" rx="4" ry="2" fill="rgba(255,255,255,0.12)" />
        </motion.g>

        {/* ── Right leg + shoe ────────────────────────────────────────────── */}
        <motion.g style={{ transformOrigin: '37px 58px' }}
          initial={{ rotate: 28 }}
          animate={{ rotate: [28, -28, 28] }}
          transition={walkT}
        >
          <line x1="37" y1="58" x2="40" y2="94"
            stroke={pantsColor} strokeWidth="9" strokeLinecap="round" />
          {/* shoe */}
          <ellipse cx="43" cy="98" rx="10" ry="5" fill={shoeColor} />
          {/* shoe highlight */}
          <ellipse cx="45" cy="96" rx="4" ry="2" fill="rgba(255,255,255,0.12)" />
        </motion.g>

      </svg>
    </motion.div>
  )
}

/* ─── Sun orb (clear + light mode) ─────────────────────────────────────────── */
function SceneSun(_: { isDark?: boolean }) {
  return (
    <motion.div
      style={{ position: 'absolute', right: '11%', bottom: 105, width: 54, height: 54 }}
      animate={{ y: [-5, 5, -5] }}
      transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      <div style={{
        width: '100%', height: '100%', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,251,200,0.98) 0%, rgba(253,230,138,0.88) 50%, rgba(245,158,11,0.38) 100%)',
        boxShadow: '0 0 30px rgba(245,158,11,0.62), 0 0 70px rgba(245,158,11,0.26)',
        filter: 'blur(0.5px)',
      }} />
    </motion.div>
  )
}

/* ─── Moon orb (clear + dark mode) ─────────────────────────────────────────── */
function SceneMoon() {
  return (
    <motion.div
      style={{ position: 'absolute', right: '12%', bottom: 108, width: 40, height: 40 }}
      animate={{ y: [-4, 4, -4] }}
      transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      <div style={{
        width: '100%', height: '100%', borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 35%, rgba(226,232,240,0.96) 0%, rgba(148,163,184,0.72) 70%, transparent 100%)',
        boxShadow: '0 0 20px rgba(148,163,184,0.48), 0 0 44px rgba(148,163,184,0.18)',
      }} />
    </motion.div>
  )
}

/* ─── Lightning bolt + flash (thunder) ─────────────────────────────────────── */
function SceneLightning({ isDark }: { isDark: boolean }) {
  const boltColor  = isDark ? '#FDE68A' : '#F59E0B'
  const flashColor = isDark ? 'rgba(139,92,246,0.18)' : 'rgba(109,40,217,0.22)'

  // keyframe times: two double-flashes per 7-second cycle
  const flashTimes = [0, 0.26, 0.28, 0.30, 0.34, 0.58, 0.60, 0.62, 0.66, 1] as const
  const flashOp    = [0, 0,    1,    0.4,  0,    0,    0.9,  0.3,  0,    0]

  return (
    <>
      {/* Scene-wide flash */}
      <motion.div
        className="absolute inset-0"
        style={{ background: flashColor }}
        animate={{ opacity: flashOp }}
        transition={{ duration: 7, repeat: Infinity, ease: 'linear', times: [...flashTimes] }}
      />
      {/* Bolt SVG */}
      <motion.div
        style={{ position: 'absolute', right: '30%', top: 8 }}
        animate={{ opacity: flashOp }}
        transition={{ duration: 7, repeat: Infinity, ease: 'linear', times: [...flashTimes] }}
      >
        <svg width="22" height="52" viewBox="0 0 22 52" aria-hidden="true">
          <path d="M14,0 L4,26 L10,26 L8,52 L20,20 L13,20 Z" fill={boltColor} />
        </svg>
      </motion.div>
      {/* Second bolt, offset */}
      <motion.div
        style={{ position: 'absolute', right: '44%', top: 16 }}
        animate={{ opacity: flashOp.slice().reverse() }}
        transition={{ duration: 7, repeat: Infinity, ease: 'linear', times: [...flashTimes], delay: 0.8 }}
      >
        <svg width="16" height="38" viewBox="0 0 16 38" aria-hidden="true">
          <path d="M10,0 L3,19 L7,19 L6,38 L14,14 L9,14 Z" fill={boltColor} opacity={0.75} />
        </svg>
      </motion.div>
    </>
  )
}

/* ─── In-scene rain drops ───────────────────────────────────────────────────── */
function SceneRain({ heavy, isDark }: { heavy: boolean; isDark: boolean }) {
  const count = heavy ? 24 : 15
  const drops = useMemo(
    () => Array.from({ length: count }, (_, i) => ({
      id:      i,
      left:    `${4 + (i / count) * 92}%`,
      delay:   (i * 0.10) % 1.8,
      dur:     heavy ? 0.34 + (i % 4) * 0.04 : 0.50 + (i % 4) * 0.06,
      height:  heavy ? 18 + (i % 6) * 2 : 12 + (i % 5) * 2,
      opacity: isDark ? 0.48 + (i % 3) * 0.16 : 0.64 + (i % 3) * 0.14,
    })),
    [heavy, isDark, count]
  )
  const grad = isDark
    ? 'linear-gradient(to bottom, rgba(147,197,253,0.92), rgba(147,197,253,0))'
    : 'linear-gradient(to bottom, rgba(30,64,138,0.85), rgba(30,64,138,0))'
  return (
    <>
      {drops.map((d) => (
        <motion.div key={d.id} className="absolute w-px rounded-full"
          style={{ left: d.left, top: 0, height: d.height, background: grad, opacity: d.opacity }}
          animate={{ y: '200px' }}
          transition={{ duration: d.dur, delay: d.delay, repeat: Infinity, ease: 'linear' }}
        />
      ))}
    </>
  )
}

/* ─── In-scene snow ─────────────────────────────────────────────────────────── */
function SceneSnow({ isDark }: { isDark: boolean }) {
  const flakes = useMemo(
    () => Array.from({ length: 18 }, (_, i) => ({
      id:      i,
      left:    `${(i / 18) * 100}%`,
      size:    2.5 + (i % 4),
      delay:   (i * 0.19) % 3.2,
      dur:     2.0 + (i % 5) * 0.38,
      opacity: isDark ? 0.60 + (i % 3) * 0.16 : 0.52 + (i % 3) * 0.14,
    })),
    [isDark]
  )
  return (
    <>
      {flakes.map((f) => (
        <motion.div key={f.id}
          className={`absolute rounded-full ${isDark ? 'bg-white' : 'bg-slate-500'}`}
          style={{ left: f.left, top: 0, width: f.size, height: f.size, opacity: f.opacity }}
          animate={{ y: '195px', x: [0, 14, -10, 6, 0] }}
          transition={{ duration: f.dur, delay: f.delay, repeat: Infinity, ease: 'linear' }}
        />
      ))}
    </>
  )
}

/* ─── Mist wisps ────────────────────────────────────────────────────────────── */
function SceneMist({ isDark }: { isDark: boolean }) {
  return (
    <>
      {[{ bot: 90, oD: 0.14, oL: 0.26, dur: 10 },
        { bot: 72, oD: 0.10, oL: 0.20, dur: 14 },
        { bot: 55, oD: 0.08, oL: 0.16, dur: 12 }].map((m, i) => (
        <motion.div key={i}
          className={`absolute left-0 right-0 h-10 blur-2xl ${isDark ? 'bg-slate-300' : 'bg-slate-500'}`}
          style={{ bottom: m.bot, opacity: isDark ? m.oD : m.oL }}
          animate={{ x: ['-5%', '5%', '-5%'] }}
          transition={{ duration: m.dur, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </>
  )
}

/* ─── Character switcher: Lottie (preferred) → SVG fallback ────────────────── */
function CharacterLayer({ condition, isDark }: { condition: SceneCondition; isDark: boolean }) {
  const lottie = useLottieAnim(condition)

  // Lottie file found → use it
  if (lottie.status === 'ready') {
    return <LottieCharacter condition={condition} />
  }

  // Lottie loading or unavailable → always render SVG (no flash)
  return <WalkingCharacter condition={condition} isDark={isDark} />
}

/* ─── Main export ───────────────────────────────────────────────────────────── */
export function LandscapeScene({ conditionId, isDark }: LandscapeSceneProps) {
  const prefersReducedMotion = useReducedMotion()
  if (prefersReducedMotion) return null

  const condition  = getSceneCondition(conditionId)
  const hasRain    = ['rain', 'thunder', 'drizzle'].includes(condition)
  const hasThunder = condition === 'thunder'
  const hasSnow    = condition === 'snow'
  const hasMist    = condition === 'mist'
  const isClear    = condition === 'clear'

  return (
    <div
      className="fixed bottom-0 left-0 right-0 overflow-hidden pointer-events-none"
      style={{ height: 190, zIndex: 2 }}
      aria-hidden="true"
    >
      {/* Top-edge fade — blends scene into page content above */}
      <div className="absolute inset-x-0 top-0 z-10" style={{
        height: 58,
        background: isDark
          ? 'linear-gradient(to bottom, #000000 0%, transparent 100%)'
          : 'linear-gradient(to bottom, #5AAED4 0%, transparent 100%)',
      }} />

      {/* ── Condition FX ── */}
      {hasRain    && <SceneRain heavy={hasThunder} isDark={isDark} />}
      {hasThunder && <SceneLightning isDark={isDark} />}
      {hasSnow    && <SceneSnow isDark={isDark} />}
      {hasMist    && <SceneMist isDark={isDark} />}

      {/* ── Celestial bodies ── */}
      {isClear && isDark  && <SceneMoon />}
      {isClear && !isDark && <SceneSun />}

      {/* ── Background layers (trees → house → hills) ── */}
      <TreeLayer isDark={isDark} />
      <HouseSilhouette isDark={isDark} />
      <GroundLayer isDark={isDark} />

      {/* ── Character: Lottie when JSON present, SVG fallback otherwise ── */}
      <CharacterLayer condition={condition} isDark={isDark} />
    </div>
  )
}
