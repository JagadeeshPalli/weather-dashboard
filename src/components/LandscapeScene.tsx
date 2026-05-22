/**
 * LandscapeScene — atmospheric city-horizon scene at the bottom of the screen.
 *
 * Design philosophy:
 *  - NO walking characters (they looked toyish at SVG precision)
 *  - Three-layer depth: distant mountains → mid-city skyline → foreground road
 *  - City skyline silhouette with window-light details in dark mode
 *  - Condition-aware environment: birds (clear), puddles (rain), mist wisps,
 *    snow shimmer on rooftops, lightning flicker for thunder
 *  - Pure SVG + framer-motion, zero external deps
 *
 * ViewBox: 1440 × 200, ground strip at y ≈ 162–168
 * Z-index: 2 (above WeatherBackground z=1, below cards z=10)
 */
import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

interface LandscapeSceneProps {
  conditionId: number
  isDark: boolean
}

type SceneCondition =
  | 'rain'
  | 'thunder'
  | 'drizzle'
  | 'snow'
  | 'clear'
  | 'cloudy'
  | 'mist'
  | 'default'

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

/* ─── City skyline profile ──────────────────────────────────────────────────
   Each pair [x, y] is a corner of the stepped building silhouette.
   The path goes left → right along the top profile, then closes at groundY.
   Tallest landmark cluster is at x ≈ 520-570 (y ≈ 48).
*/
const NEAR_PROFILE: [number, number][] = [
  [0, 158], [58, 158], [58, 140], [88, 140], [88, 122], [118, 122],
  [118, 110], [145, 110], [145, 96], [164, 96], [164, 84], [194, 84],
  [194, 96], [218, 96], [218, 112], [250, 112], [250, 98], [280, 98],
  [280, 120], [312, 120], [312, 108], [352, 108], [352, 88], [382, 88],
  [382, 72], [416, 72], [416, 60], [442, 60], [442, 72], [464, 72],
  [464, 88], [496, 88], [496, 75], [526, 75], [526, 58], [549, 58],
  [549, 48], [570, 48], [570, 58], [594, 58], [594, 75], [624, 75],
  [624, 88], [656, 88], [656, 104], [690, 104], [690, 88], [724, 88],
  [724, 76], [754, 76], [754, 92], [788, 92], [788, 106], [822, 106],
  [822, 118], [857, 118], [857, 105], [890, 105], [890, 90], [924, 90],
  [924, 75], [960, 75], [960, 90], [994, 90], [994, 105], [1028, 105],
  [1028, 118], [1062, 118], [1062, 100], [1100, 100], [1100, 112],
  [1140, 112], [1140, 126], [1180, 126], [1180, 115], [1218, 115],
  [1218, 128], [1255, 128], [1255, 138], [1294, 138], [1294, 126],
  [1332, 126], [1332, 140], [1372, 140], [1372, 150], [1412, 150],
  [1412, 158], [1440, 158],
]

const FAR_PROFILE: [number, number][] = [
  [0, 162], [72, 162], [72, 150], [108, 150], [108, 138], [145, 138],
  [145, 148], [182, 148], [182, 135], [212, 135], [212, 148], [248, 148],
  [248, 138], [285, 138], [285, 148], [322, 148], [322, 138], [358, 138],
  [358, 125], [394, 125], [394, 138], [428, 138], [428, 125], [462, 125],
  [462, 115], [494, 115], [494, 105], [522, 105], [522, 118], [552, 118],
  [552, 108], [582, 108], [582, 98], [610, 98], [610, 110], [640, 110],
  [640, 122], [670, 122], [670, 110], [702, 110], [702, 98], [732, 98],
  [732, 110], [764, 110], [764, 122], [798, 122], [798, 132], [832, 132],
  [832, 122], [866, 122], [866, 132], [900, 132], [900, 142], [935, 142],
  [935, 132], [970, 132], [970, 142], [1008, 142], [1008, 150], [1048, 150],
  [1048, 142], [1088, 142], [1088, 150], [1128, 150], [1128, 158],
  [1168, 158], [1168, 150], [1208, 150], [1208, 158], [1440, 158],
]

/* Pre-computed window positions (golden-angle spread for even distribution) */
const WINDOWS = Array.from({ length: 44 }, (_, i) => ({
  x: Math.round((i * 137.508 + 22) % 1440),
  y: Math.round(68 + (i * 53.7 + 9) % 82),
  delay: (i * 0.38) % 5.6,
  dur: 2.5 + (i % 7) * 0.48,
  pulse: i % 3 === 0,
  w: 4 + (i % 3),
}))

function profileToPath(pts: [number, number][], groundY: number): string {
  return (
    `M0,${groundY} ` +
    pts.map(([x, y]) => `L${x},${y}`).join(' ') +
    ` L1440,${groundY} Z`
  )
}

/* ─── Scene sky tint (adds warmth/coolness at the horizon) ──────────────── */
const TINT: Record<SceneCondition, { dark: string; light: string }> = {
  clear:   { dark: 'linear-gradient(to top, rgba(245,158,11,0.14) 0%, transparent 55%)',   light: 'linear-gradient(to top, rgba(253,186,116,0.32) 0%, transparent 55%)' },
  rain:    { dark: 'linear-gradient(to top, rgba(30,64,138,0.22) 0%, transparent 55%)',    light: 'linear-gradient(to top, rgba(30,58,138,0.22) 0%, transparent 55%)' },
  drizzle: { dark: 'linear-gradient(to top, rgba(30,58,138,0.18) 0%, transparent 55%)',   light: 'linear-gradient(to top, rgba(30,58,138,0.18) 0%, transparent 55%)' },
  thunder: { dark: 'linear-gradient(to top, rgba(91,33,182,0.26) 0%, transparent 55%)',   light: 'linear-gradient(to top, rgba(91,33,182,0.20) 0%, transparent 55%)' },
  snow:    { dark: 'linear-gradient(to top, rgba(186,230,253,0.18) 0%, transparent 55%)', light: 'linear-gradient(to top, rgba(186,230,253,0.34) 0%, transparent 55%)' },
  mist:    { dark: 'linear-gradient(to top, rgba(100,116,139,0.20) 0%, transparent 55%)', light: 'linear-gradient(to top, rgba(148,163,184,0.28) 0%, transparent 55%)' },
  cloudy:  { dark: 'linear-gradient(to top, rgba(51,65,85,0.24) 0%, transparent 55%)',    light: 'linear-gradient(to top, rgba(100,116,139,0.22) 0%, transparent 55%)' },
  default: { dark: 'linear-gradient(to top, rgba(15,23,42,0.22) 0%, transparent 55%)',    light: 'linear-gradient(to top, rgba(100,116,139,0.18) 0%, transparent 55%)' },
}

/* ─── Mountains ─────────────────────────────────────────────────────────── */
function MountainLayer({ isDark }: { isDark: boolean }) {
  const farFill  = isDark ? 'rgba(14,20,42,0.48)' : 'rgba(40,90,60,0.28)'
  const nearFill = isDark ? 'rgba(8,12,28,0.68)'  : 'rgba(24,62,42,0.48)'
  return (
    <svg
      viewBox="0 0 1440 200"
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    >
      {/* Far range — slightly blurred, faded */}
      <path
        d="M-10,92 C80,60 180,80 278,54 C378,28 478,64 578,40
           C678,16 778,56 878,32 C978,8 1078,46 1178,24
           C1278,2 1368,30 1450,18 L1450,200 L-10,200 Z"
        fill={farFill}
        style={{ filter: 'blur(0.6px)' }}
      />
      {/* Near range */}
      <path
        d="M-10,112 C60,82 148,106 238,84 C328,62 415,96 505,72
           C595,48 680,84 770,60 C860,36 946,74 1036,52
           C1126,30 1212,64 1302,44 C1372,28 1416,44 1450,38
           L1450,200 L-10,200 Z"
        fill={nearFill}
      />
    </svg>
  )
}

/* ─── City skyline silhouette + window lights ────────────────────────────── */
function CityLayer({ isDark }: { isDark: boolean }) {
  const farFill  = isDark ? 'rgba(6,10,22,0.60)'  : 'rgba(16,50,30,0.42)'
  const nearFill = isDark ? 'rgba(4,7,16,0.90)'   : 'rgba(10,35,22,0.76)'
  const nearPath = profileToPath(NEAR_PROFILE, 168)
  const farPath  = profileToPath(FAR_PROFILE,  168)
  const antCol   = isDark ? 'rgba(148,163,184,0.55)' : 'rgba(30,58,138,0.38)'

  return (
    <svg
      viewBox="0 0 1440 200"
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
      overflow="visible"
    >
      {/* Tallest landmark antenna (x≈559, topY≈48) */}
      <line x1="559" y1="48" x2="559" y2="28" stroke={antCol} strokeWidth="2.5" strokeLinecap="round" />
      <motion.circle
        cx="559" cy="27" r="2.5"
        fill="rgba(239,68,68,0.72)"
        animate={{ opacity: [0.72, 0.2, 0.72] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Secondary antenna (x≈429, topY≈60) */}
      <line x1="429" y1="60" x2="429" y2="44" stroke={antCol} strokeWidth="1.8" strokeLinecap="round" />

      {/* Far skyline */}
      <path d={farPath} fill={farFill} />
      {/* Near skyline */}
      <path d={nearPath} fill={nearFill} />

      {/* Window lights — dark mode only */}
      {isDark && WINDOWS.map((w, i) =>
        w.pulse ? (
          <motion.rect
            key={i}
            x={w.x} y={w.y}
            width={w.w} height={3.5}
            rx="0.8"
            fill="rgba(253,224,96,0.50)"
            animate={{ opacity: [0.50, 0.78, 0.50] }}
            transition={{ duration: w.dur, delay: w.delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        ) : (
          <rect
            key={i}
            x={w.x} y={w.y}
            width={w.w} height={3.5}
            rx="0.8"
            fill="rgba(253,224,96,0.38)"
          />
        ),
      )}
    </svg>
  )
}

/* ─── Ground / road ─────────────────────────────────────────────────────── */
function GroundLayer({ isDark }: { isDark: boolean }) {
  const road = isDark ? 'rgba(22,32,52,0.92)' : 'rgba(88,104,122,0.60)'
  const line = isDark ? 'rgba(248,213,69,0.28)' : 'rgba(248,213,69,0.52)'
  const fore = isDark ? 'rgba(4,7,14,0.96)'   : 'rgba(14,52,28,0.88)'
  return (
    <svg
      viewBox="0 0 1440 200"
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    >
      <path
        d="M0,164 C240,160 560,163 800,160 C1040,157 1280,161 1440,158
           L1440,175 C1280,172 1040,171 800,173 C560,175 240,173 0,175 Z"
        fill={road}
      />
      {Array.from({ length: 13 }, (_, i) => (
        <rect key={i} x={i * 112 + 8} y="166.5" width="70" height="2.5" rx="1.2" fill={line} />
      ))}
      <path
        d="M0,175 C160,169 340,179 520,171 C700,163 880,179 1060,171
           C1240,163 1360,176 1440,171 L1440,200 L0,200 Z"
        fill={fore}
      />
    </svg>
  )
}

/* ─── Tree layer ────────────────────────────────────────────────────────── */
function PineTree({ fill, h = 50 }: { fill: string; h?: number }) {
  const w = h * 0.54
  return (
    <svg width={w} height={h + 8} viewBox={`0 0 ${w} ${h + 8}`} overflow="visible" aria-hidden="true">
      <polygon points={`${w / 2},0 0,${h} ${w},${h}`} fill={fill} />
      <rect x={w / 2 - 2.5} y={h} width="5" height="8" rx="1" fill={fill} opacity={0.52} />
    </svg>
  )
}
function RoundTree({ fill, h = 48 }: { fill: string; h?: number }) {
  const r = h * 0.40; const cx = r * 1.28
  return (
    <svg width={cx * 2} height={h + 8} viewBox={`0 0 ${cx * 2} ${h + 8}`} overflow="visible" aria-hidden="true">
      <motion.g
        style={{ transformOrigin: `${cx}px ${h + 3}px` }}
        animate={{ rotate: [-2, 2, -2] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <circle cx={cx} cy={r} r={r} fill={fill} />
        <rect x={cx - 3} y={r * 1.62} width="6" height={h - r * 1.62 + 8} rx="1.5" fill={fill} opacity={0.50} />
      </motion.g>
    </svg>
  )
}
function TreeLayer({ isDark }: { isDark: boolean }) {
  const fill = isDark ? 'rgba(8,14,30,0.92)' : 'rgba(14,60,32,0.86)'
  const trees: { x: string; t: 'p' | 'r'; sc: number; bot: number }[] = [
    { x: '2%',  t: 'p', sc: 0.58, bot: 98 },
    { x: '9%',  t: 'r', sc: 0.72, bot: 94 },
    { x: '17%', t: 'p', sc: 0.48, bot: 102 },
    { x: '29%', t: 'r', sc: 0.80, bot: 92 },
    { x: '44%', t: 'p', sc: 0.55, bot: 100 },
    { x: '58%', t: 'r', sc: 0.68, bot: 96 },
    { x: '70%', t: 'p', sc: 0.62, bot: 98 },
    { x: '81%', t: 'r', sc: 0.52, bot: 102 },
    { x: '91%', t: 'p', sc: 0.58, bot: 97 },
  ]
  return (
    <>
      {trees.map((t, i) => (
        <div
          key={i}
          style={{ position: 'absolute', left: t.x, bottom: t.bot, transform: `scale(${t.sc})`, transformOrigin: 'bottom center' }}
        >
          {t.t === 'p' ? <PineTree fill={fill} h={50} /> : <RoundTree fill={fill} h={48} />}
        </div>
      ))}
    </>
  )
}

/* ─── Flying birds (clear / cloudy) ─────────────────────────────────────── */
function SceneBirds({ isDark }: { isDark: boolean }) {
  const col = isDark ? 'rgba(148,163,184,0.55)' : 'rgba(30,58,138,0.42)'
  const flock = useMemo(() => [
    { topPct: 16, scale: 1.00, delay: 0,  dur: 24, count: 2 },
    { topPct: 28, scale: 0.65, delay: 6,  dur: 30, count: 3 },
    { topPct: 10, scale: 0.45, delay: 14, dur: 36, count: 2 },
    { topPct: 38, scale: 0.80, delay: 20, dur: 21, count: 2 },
  ], [])
  return (
    <>
      {flock.map((f, fi) => (
        <motion.div
          key={fi}
          style={{ position: 'absolute', top: `${f.topPct}%` }}
          initial={{ x: '110vw' }}
          animate={{ x: '-10vw' }}
          transition={{ duration: f.dur, delay: f.delay, repeat: Infinity, ease: 'linear' }}
        >
          <svg width={38 * f.scale} height={14 * f.scale} viewBox="0 0 38 14" aria-hidden="true">
            {Array.from({ length: f.count }, (_, i) => (
              <path
                key={i}
                d={`M${i * 18},${i % 2 === 0 ? 6 : 8} Q${i * 18 + 5},${i % 2 === 0 ? 2 : 4} ${i * 18 + 9},${i % 2 === 0 ? 6 : 8} Q${i * 18 + 13},${i % 2 === 0 ? 2 : 4} ${i * 18 + 18},${i % 2 === 0 ? 6 : 8}`}
                fill="none" stroke={col} strokeWidth="1.8" strokeLinecap="round" opacity={1 - i * 0.18}
              />
            ))}
          </svg>
        </motion.div>
      ))}
    </>
  )
}

/* ─── Sun / Moon ────────────────────────────────────────────────────────── */
function SceneSun() {
  return (
    <motion.div
      style={{ position: 'absolute', right: '12%', bottom: 106, width: 52, height: 52 }}
      animate={{ y: [-4, 4, -4] }}
      transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
    >
      <div style={{
        width: '100%', height: '100%', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,251,200,0.98) 0%, rgba(253,230,138,0.88) 48%, rgba(245,158,11,0.32) 100%)',
        boxShadow: '0 0 28px rgba(245,158,11,0.65), 0 0 68px rgba(245,158,11,0.26)',
      }} />
    </motion.div>
  )
}
function SceneMoon() {
  return (
    <motion.div
      style={{ position: 'absolute', right: '12%', bottom: 106, width: 44, height: 44 }}
      animate={{ y: [-3, 3, -3] }}
      transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      <div style={{
        width: '100%', height: '100%', borderRadius: '50%',
        background: 'radial-gradient(circle at 38% 38%, rgba(241,245,249,0.96) 0%, rgba(203,213,225,0.82) 60%, rgba(148,163,184,0.24) 100%)',
        boxShadow: '0 0 22px rgba(203,213,225,0.45), 0 0 56px rgba(148,163,184,0.18)',
      }} />
    </motion.div>
  )
}

/* ─── Rain puddle rings ──────────────────────────────────────────────────── */
function RainPuddles({ isDark }: { isDark: boolean }) {
  const ring = isDark ? 'rgba(147,197,253,0.38)' : 'rgba(30,64,138,0.32)'
  const puddles = useMemo(
    () => Array.from({ length: 7 }, (_, i) => ({
      left: `${8 + i * 13}%`,
      delay: i * 0.52,
      dur: 1.8 + (i % 4) * 0.3,
    })),
    [],
  )
  return (
    <>
      {puddles.map((p, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute', left: p.left, bottom: 14,
            width: 26, height: 9, borderRadius: '50%',
            border: `1.5px solid ${ring}`, transformOrigin: 'center',
          }}
          animate={{ scaleX: [0.18, 2.4], scaleY: [0.5, 0.25], opacity: [0.85, 0] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'easeOut' }}
        />
      ))}
    </>
  )
}

/* ─── Sun shimmer (clear light-mode) ─────────────────────────────────────── */
function SunShimmer({ isDark }: { isDark: boolean }) {
  if (isDark) return null
  return (
    <div style={{
      position: 'absolute', bottom: 14, left: '8%', right: '8%',
      height: 5, borderRadius: 3,
      background: 'linear-gradient(to right, transparent, rgba(253,230,138,0.48), transparent)',
    }}>
      <motion.div
        className="absolute inset-0 rounded"
        style={{ background: 'linear-gradient(to right, transparent, rgba(253,230,138,0.82), transparent)' }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}

/* ─── Ground mist wisps ──────────────────────────────────────────────────── */
function GroundMist({ isDark }: { isDark: boolean }) {
  const col = isDark ? 'rgba(148,163,184,0.10)' : 'rgba(148,163,184,0.22)'
  return (
    <>
      {[
        { bot: 18, w: '85%', l: '7.5%', dur: 10, d: 3 },
        { bot: 32, w: '65%', l: '17%',  dur: 14, d: 7 },
        { bot: 48, w: '45%', l: '27%',  dur: 18, d: 11 },
      ].map((m, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute', bottom: m.bot, left: m.l, width: m.w,
            height: 28, background: col, borderRadius: 28, filter: 'blur(12px)',
          }}
          animate={{ x: ['-5%', '5%', '-5%'], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: m.dur, delay: m.d, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </>
  )
}

/* ─── Snow caps on rooftops ─────────────────────────────────────────────── */
function RooftopSnow({ isDark }: { isDark: boolean }) {
  const col = isDark ? 'rgba(224,242,254,0.55)' : 'rgba(186,230,253,0.72)'
  const snowCaps = useMemo(() => {
    const caps: { x: number; w: number; y: number }[] = []
    for (let i = 0; i < NEAR_PROFILE.length - 1; i++) {
      const [x1, y1] = NEAR_PROFILE[i]
      const [x2]     = NEAR_PROFILE[i + 1]
      if (x2 - x1 >= 28) caps.push({ x: x1, w: x2 - x1, y: y1 })
    }
    return caps
  }, [])
  return (
    <svg
      viewBox="0 0 1440 200"
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    >
      {snowCaps.map((c, i) => (
        <rect key={i} x={c.x} y={c.y} width={c.w} height={Math.min(7, c.w * 0.18)}
          rx="1.5" fill={col} opacity={0.75} />
      ))}
    </svg>
  )
}

/* ─── Thunder scene flash ────────────────────────────────────────────────── */
function ThunderFlash({ isDark }: { isDark: boolean }) {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      style={{ background: isDark ? 'rgba(139,92,246,0.16)' : 'rgba(109,40,217,0.20)' }}
      animate={{ opacity: [0, 0, 1, 0.15, 0, 0, 0.75, 0] }}
      transition={{ duration: 5.5, delay: 2.0, repeat: Infinity, times: [0, 0.40, 0.42, 0.46, 0.50, 0.74, 0.76, 1] }}
    />
  )
}

/* ─── Foreground grass blades ────────────────────────────────────────────── */
function ForegroundGrass({ isDark }: { isDark: boolean }) {
  const col = isDark ? 'rgba(8,16,36,0.80)' : 'rgba(16,80,38,0.68)'
  const blades = useMemo(
    () => Array.from({ length: 30 }, (_, i) => ({
      x: `${1 + (i / 30) * 98}%`,
      h: 14 + (i % 5) * 4,
      delay: (i * 0.17) % 2.8,
      dur: 2.2 + (i % 5) * 0.45,
      lean: (i % 2 === 0 ? 1 : -1) * (7 + (i % 3) * 5),
    })),
    [],
  )
  return (
    <>
      {blades.map((b, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute', left: b.x, bottom: 2,
            width: 3, height: b.h,
            background: `linear-gradient(to top, ${col}, transparent)`,
            borderRadius: '2px 2px 0 0',
            transformOrigin: 'bottom center',
          }}
          animate={{ rotate: [0, b.lean, 0] }}
          transition={{ duration: b.dur, delay: b.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </>
  )
}

/* ─── Chimney smoke wisps ───────────────────────────────────────────────── */
/* Smoke rises from three approximate chimney positions on the city layer.   */
function ChimneySmoke({ isDark }: { isDark: boolean }) {
  const col = isDark ? 'rgba(148,163,184,0.25)' : 'rgba(100,116,139,0.18)'
  const chimneys = [
    { left: '22%', bot: 96 },
    { left: '54%', bot: 90 },
    { left: '77%', bot: 92 },
  ]
  return (
    <>
      {chimneys.map((ch, ci) =>
        [0, 1, 2].map((j) => (
          <motion.div
            key={`${ci}-${j}`}
            style={{
              position: 'absolute', left: ch.left, bottom: ch.bot,
              width: 10, height: 16, borderRadius: '50%',
              background: col, filter: 'blur(5px)',
              transformOrigin: 'center bottom',
            }}
            animate={{
              y: [0, -48 - j * 16],
              opacity: [0, 0.72, 0],
              scaleX: [0.45, 1.6 + j * 0.45, 3.2],
            }}
            transition={{
              duration: 3.8,
              delay: j * 1.38 + ci * 0.55,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        )),
      )}
    </>
  )
}

/* ─── Fireflies (clear dark mode) ──────────────────────────────────────── */
const FIREFLIES = Array.from({ length: 14 }, (_, i) => ({
  left:   `${8  + (i * 137.508) % 84}%`,
  top:    `${30 + (i * 63.2)    % 52}%`,
  delay:  (i * 0.62) % 5.8,
  dur:    1.9 + (i % 5) * 0.55,
  dx:     (i % 2 === 0 ? 1 : -1) * (14 + (i % 3) * 9),
  dy:     -7 - (i % 4) * 5,
}))

function Fireflies({ isDark }: { isDark: boolean }) {
  if (!isDark) return null
  return (
    <>
      {FIREFLIES.map((f, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute', left: f.left, top: f.top,
            width: 3, height: 3, borderRadius: '50%',
            background: 'rgba(253,224,71,0.92)',
            boxShadow: '0 0 7px rgba(253,224,71,0.75)',
          }}
          animate={{ opacity: [0, 1, 0], x: [0, f.dx], y: [0, f.dy] }}
          transition={{ duration: f.dur, delay: f.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </>
  )
}

/* ─── Main export ───────────────────────────────────────────────────────── */
export function LandscapeScene({ conditionId, isDark }: LandscapeSceneProps) {
  const prefersReducedMotion = useReducedMotion()
  if (prefersReducedMotion) return null

  const cond    = getSceneCondition(conditionId)
  const tint    = TINT[cond]
  const isRainy = cond === 'rain' || cond === 'thunder' || cond === 'drizzle'
  const isClear = cond === 'clear'
  const isMisty = cond === 'mist' || cond === 'cloudy'
  const isSnowy = cond === 'snow'

  return (
    <div
      className="fixed bottom-0 left-0 right-0 pointer-events-none overflow-hidden"
      style={{ height: 200, zIndex: 2 }}
      aria-hidden="true"
    >
      {/* Horizon tint */}
      <div className="absolute inset-0" style={{ background: isDark ? tint.dark : tint.light }} />

      {/* Depth layers — back → front */}
      <MountainLayer isDark={isDark} />
      <CityLayer isDark={isDark} />

      {/* Condition overlays */}
      {isSnowy              && <RooftopSnow isDark={isDark} />}
      {isMisty              && <GroundMist isDark={isDark} />}
      {cond === 'thunder'   && <ThunderFlash isDark={isDark} />}

      {/* Celestial bodies */}
      {isClear &&  isDark   && <SceneMoon />}
      {isClear && !isDark   && <SceneSun />}

      {/* Birds */}
      {(isClear || cond === 'cloudy') && <SceneBirds isDark={isDark} />}

      {/* Ground */}
      <TreeLayer isDark={isDark} />
      <GroundLayer isDark={isDark} />

      {/* Ground FX */}
      {isRainy && <RainPuddles isDark={isDark} />}
      {isClear && <SunShimmer isDark={isDark} />}

      {/* City life */}
      <ChimneySmoke isDark={isDark} />
      {isClear && <Fireflies isDark={isDark} />}

      {/* Foreground */}
      <ForegroundGrass isDark={isDark} />
    </div>
  )
}
