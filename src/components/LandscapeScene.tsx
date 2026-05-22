/**
 * LandscapeScene — Samsung-style atmospheric bottom scene.
 *
 * Pure SVG + framer-motion, zero external dependencies.
 * Layers (back → front):
 *   sky tint → back trees → house → ground hills → road → front trees
 *   → puddles/sun shimmer → distant character → walking character
 *   → swaying grass → condition FX (rain/snow/mist/lightning)
 */
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

const JACKET: Record<SceneCondition, string> = {
  clear: '#10B981', rain: '#3B82F6', drizzle: '#60A5FA',
  thunder: '#6366F1', snow: '#F97316', cloudy: '#64748B',
  mist: '#94A3B8', default: '#64748B',
}

/* ─── Ground + hills ────────────────────────────────────────────────────────── */
function GroundLayer({ isDark }: { isDark: boolean }) {
  const back  = isDark ? 'rgba(15,23,42,0.82)'  : 'rgba(34,100,50,0.60)'
  const front = isDark ? 'rgba(6,10,20,0.95)'   : 'rgba(19,74,38,0.84)'
  const road  = isDark ? 'rgba(30,41,59,0.88)'  : 'rgba(100,116,139,0.55)'
  const line  = isDark ? 'rgba(248,213,69,0.30)' : 'rgba(248,213,69,0.55)'
  return (
    <svg viewBox="0 0 1440 190" preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full" aria-hidden="true">
      {/* back hills */}
      <path d="M0,88 C180,50 360,78 540,60 C720,42 900,70 1080,52 C1260,34 1380,60 1440,54 L1440,190 L0,190 Z"
        fill={back} />
      {/* road/path strip before the front ground */}
      <path d="M0,143 C200,138 500,142 800,139 C1100,136 1300,140 1440,137 L1440,155 C1300,152 1100,153 800,154 C500,155 200,153 0,156 Z"
        fill={road} />
      {/* dashed centre line */}
      {[0,120,240,360,480,600,720,840,960,1080,1200,1320].map((x, i) => (
        <rect key={i} x={x + 5} y="148" width="72" height="2.5" rx="1.2" fill={line} />
      ))}
      {/* front ground */}
      <path d="M0,155 C120,148 280,162 440,152 C600,142 760,165 920,155 C1080,144 1260,162 1440,155 L1440,190 L0,190 Z"
        fill={front} />
    </svg>
  )
}

/* ─── House silhouette ──────────────────────────────────────────────────────── */
function HouseSilhouette({ isDark }: { isDark: boolean }) {
  const fill   = isDark ? 'rgba(12,18,36,0.80)' : 'rgba(28,64,40,0.58)'
  const winFill= isDark ? 'rgba(253,230,138,0.22)' : 'rgba(255,255,255,0.32)'
  return (
    <div style={{ position: 'absolute', right: '17%', bottom: 96 }}>
      <svg width="80" height="72" viewBox="0 0 80 72" aria-hidden="true">
        <polygon points="0,32 40,0 80,32" fill={fill} />
        <rect x="6" y="32" width="68" height="40" fill={fill} />
        <rect x="30" y="48" width="20" height="24" rx="2" fill={isDark ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.20)'} />
        <rect x="9"  y="38" width="16" height="13" rx="1.5" fill={winFill} />
        <rect x="55" y="38" width="16" height="13" rx="1.5" fill={winFill} />
        <rect x="54" y="10" width="11" height="26" fill={fill} />
      </svg>
    </div>
  )
}

/* ─── Tree shapes ───────────────────────────────────────────────────────────── */
function PineTree({ fill, h = 52 }: { fill: string; h?: number }) {
  const w = h * 0.56
  return (
    <svg width={w} height={h + 10} viewBox={`0 0 ${w} ${h + 10}`} overflow="visible" aria-hidden="true">
      <polygon points={`${w/2},0 0,${h} ${w},${h}`} fill={fill} />
      <rect x={w/2 - 3} y={h} width="6" height="10" rx="1" fill={fill} opacity={0.60} />
    </svg>
  )
}
function RoundTree({ fill, h = 50, sway = false }: { fill: string; h?: number; sway?: boolean }) {
  const r = h * 0.42; const cx = r * 1.3
  const inner = (
    <>
      <circle cx={cx} cy={r} r={r} fill={fill} />
      <rect x={cx-3.5} y={r*1.6} width="7" height={h - r*1.6 + 8} rx="1.5" fill={fill} opacity={0.55} />
    </>
  )
  return (
    <svg width={cx * 2} height={h + 10} viewBox={`0 0 ${cx * 2} ${h + 10}`} overflow="visible" aria-hidden="true">
      {sway ? (
        <motion.g style={{ transformOrigin: `${cx}px ${h + 5}px` }}
          animate={{ rotate: [-2, 2, -2] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
          {inner}
        </motion.g>
      ) : inner}
    </svg>
  )
}

/* ─── Tree layers ───────────────────────────────────────────────────────────── */
function TreeLayer({ isDark }: { isDark: boolean }) {
  const fill = isDark ? 'rgba(14,26,50,0.92)' : 'rgba(18,78,42,0.86)'
  const trees: { x: string; t: 'p'|'r'; sc: number; bot: number; sw?: boolean }[] = [
    { x: '3%',  t: 'p', sc: 0.62, bot: 100 },
    { x: '10%', t: 'r', sc: 0.76, bot: 96, sw: true },
    { x: '20%', t: 'p', sc: 0.50, bot: 104 },
    { x: '33%', t: 'r', sc: 0.84, bot: 94, sw: true },
    { x: '46%', t: 'p', sc: 0.58, bot: 102 },
    { x: '59%', t: 'r', sc: 0.72, bot: 98, sw: true },
    { x: '72%', t: 'p', sc: 0.66, bot: 100 },
    { x: '83%', t: 'r', sc: 0.54, bot: 104, sw: true },
    { x: '92%', t: 'p', sc: 0.60, bot: 98 },
  ]
  return (
    <>
      {trees.map((t, i) => (
        <div key={i} style={{ position: 'absolute', left: t.x, bottom: t.bot,
          transform: `scale(${t.sc})`, transformOrigin: 'bottom center' }}>
          {t.t === 'p' ? <PineTree fill={fill} h={52} /> : <RoundTree fill={fill} h={50} sway={t.sw} />}
        </div>
      ))}
    </>
  )
}

/* ─── Foreground swaying grass blades ──────────────────────────────────────── */
function ForegroundGrass({ isDark }: { isDark: boolean }) {
  const grassColor = isDark ? 'rgba(20,40,70,0.75)' : 'rgba(22,101,52,0.70)'
  const blades = useMemo(() =>
    Array.from({ length: 28 }, (_, i) => ({
      x: `${1 + (i / 28) * 98}%`,
      h: 16 + (i % 5) * 4,
      delay: (i * 0.18) % 2.8,
      dur: 2.4 + (i % 4) * 0.5,
      lean: (i % 2 === 0 ? 1 : -1) * (8 + (i % 3) * 4),
    })), [])

  return (
    <>
      {blades.map((b, i) => (
        <motion.div key={i} style={{
          position: 'absolute', left: b.x, bottom: 2,
          width: 3, height: b.h,
          background: `linear-gradient(to top, ${grassColor}, transparent)`,
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

/* ─── Rain puddle ripples ───────────────────────────────────────────────────── */
function RainPuddles({ isDark }: { isDark: boolean }) {
  const puddles = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => ({
      left: `${10 + i * 14}%`,
      delay: i * 0.55,
      dur: 1.8 + (i % 3) * 0.3,
    })), [])
  const ringColor = isDark ? 'rgba(147,197,253,0.40)' : 'rgba(30,64,138,0.35)'
  return (
    <>
      {puddles.map((p, i) => (
        <motion.div key={i} style={{
          position: 'absolute', left: p.left, bottom: 16,
          width: 24, height: 8, borderRadius: '50%',
          border: `1.5px solid ${ringColor}`,
          transformOrigin: 'center',
        }}
          animate={{ scaleX: [0.2, 2.2], scaleY: [0.5, 0.3], opacity: [0.8, 0] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'easeOut' }}
        />
      ))}
    </>
  )
}

/* ─── Sunny ground shimmer ──────────────────────────────────────────────────── */
function SunShimmer({ isDark }: { isDark: boolean }) {
  if (isDark) return null
  return (
    <div style={{ position: 'absolute', bottom: 16, left: '10%', right: '10%', height: 4,
      background: 'linear-gradient(to right, transparent, rgba(253,230,138,0.55), transparent)',
      borderRadius: 4 }}>
      <motion.div className="absolute inset-0 rounded"
        style={{ background: 'linear-gradient(to right, transparent, rgba(253,230,138,0.80), transparent)' }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}

/* ─── Distant silhouette character (parallax depth) ────────────────────────── */
function DistantCharacter({ isDark }: { isDark: boolean }) {
  const col = isDark ? 'rgba(30,50,80,0.55)' : 'rgba(20,60,35,0.45)'
  return (
    <motion.div style={{ position: 'absolute', bottom: 62 }}
      initial={{ x: '105vw' }}
      animate={{ x: '-12vw' }}
      transition={{ duration: 44, repeat: Infinity, ease: 'linear', delay: 8 }}
    >
      {/* tiny silhouette — no detail, just depth */}
      <svg width="28" height="52" viewBox="0 0 28 52" aria-hidden="true">
        <circle cx="14" cy="7" r="6" fill={col} />
        <rect x="10" y="13" width="8" height="18" rx="3" fill={col} />
        <motion.line x1="10" y1="18" x2="4" y2="26" stroke={col} strokeWidth="3" strokeLinecap="round"
          style={{ transformOrigin: '10px 18px' }} animate={{ rotate: [-22, 18, -22] }}
          transition={{ duration: 0.65, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.line x1="18" y1="18" x2="24" y2="26" stroke={col} strokeWidth="3" strokeLinecap="round"
          style={{ transformOrigin: '18px 18px' }} animate={{ rotate: [18, -22, 18] }}
          transition={{ duration: 0.65, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.g style={{ transformOrigin: '11px 31px' }} animate={{ rotate: [-26, 26, -26] }}
          transition={{ duration: 0.65, repeat: Infinity, ease: 'easeInOut' }}>
          <line x1="11" y1="31" x2="9" y2="48" stroke={col} strokeWidth="4" strokeLinecap="round" />
        </motion.g>
        <motion.g style={{ transformOrigin: '17px 31px' }} animate={{ rotate: [26, -26, 26] }}
          transition={{ duration: 0.65, repeat: Infinity, ease: 'easeInOut' }}>
          <line x1="17" y1="31" x2="19" y2="48" stroke={col} strokeWidth="4" strokeLinecap="round" />
        </motion.g>
      </svg>
    </motion.div>
  )
}

/* ─── Main walking character — 100px wide, detailed flat design ─────────────── */
function WalkingCharacter({ condition }: { condition: SceneCondition }) {
  const skin  = '#F5CBA7'
  const hair  = '#2C1810'
  const pants = '#374151'
  const shoe  = '#1F2937'
  const jacket = JACKET[condition]

  const isRainy   = ['rain', 'thunder', 'drizzle'].includes(condition)
  const isSnowy   = condition === 'snow'
  const isClear   = condition === 'clear'
  const isWindy   = condition === 'mist' || condition === 'cloudy'

  const wt = { duration: 0.68, repeat: Infinity, ease: 'easeInOut' as const }

  return (
    <motion.div
      style={{ position: 'absolute', bottom: 50, overflow: 'visible' }}
      initial={{ x: '112vw' }}
      animate={{ x: '-22vw' }}
      transition={{ duration: 30, repeat: Infinity, ease: 'linear', delay: 3 }}
    >
      <svg width="100" height="190" viewBox="0 0 100 190" overflow="visible" aria-hidden="true">

        {/* ── Umbrella ─── */}
        {isRainy && (
          <g>
            <path d="M12,-58 Q50,-88 88,-58 Q88,-36 50,-40 Q12,-36 12,-58 Z"
              fill="rgba(147,197,253,0.68)" stroke="#3B82F6" strokeWidth="2.5" />
            <line x1="50" y1="-38" x2="50" y2="-2" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />
            <line x1="50" y1="-84" x2="50" y2="-40" stroke="rgba(59,130,246,0.35)" strokeWidth="1.2" />
            <line x1="31" y1="-80" x2="25" y2="-40" stroke="rgba(59,130,246,0.25)" strokeWidth="1.2" />
            <line x1="69" y1="-80" x2="75" y2="-40" stroke="rgba(59,130,246,0.25)" strokeWidth="1.2" />
          </g>
        )}

        {/* ── Winter hat ─── */}
        {isSnowy && (
          <g>
            <path d="M30,14 Q50,-6 70,14 L67,22 Q50,16 33,22 Z" fill="#F97316" />
            <rect x="22" y="20" width="56" height="7" rx="3.5" fill="#EA580C" />
            <circle cx="50" cy="-2" r="8" fill="#FED7AA" />
          </g>
        )}

        {/* ── Sun hat ─── */}
        {isClear && (
          <g>
            <ellipse cx="50" cy="12" rx="32" ry="7" fill="#D97706" opacity={0.90} />
            <ellipse cx="50" cy="8"  rx="18" ry="10" fill="#FBBF24" />
          </g>
        )}

        {/* ── Hood-up for mist/cloudy ─── */}
        {isWindy && (
          <path d="M28,24 Q18,10 50,6 Q82,10 72,24 Q66,18 50,16 Q34,18 28,24 Z"
            fill={jacket} opacity={0.75} />
        )}

        {/* ── Head ─── */}
        <circle cx="50" cy="24" r="18" fill={skin} />

        {/* hair */}
        <path d="M32,18 Q36,4 50,4 Q64,4 68,18 Q62,10 50,8 Q38,10 32,18 Z" fill={hair} />

        {/* ears */}
        <ellipse cx="32" cy="24" rx="4.5" ry="5.5" fill={skin} />
        <ellipse cx="68" cy="24" rx="4.5" ry="5.5" fill={skin} />

        {/* eyes */}
        <circle cx="42" cy="21" r="3"   fill="#1F2937" />
        <circle cx="58" cy="21" r="3"   fill="#1F2937" />
        <circle cx="43" cy="20" r="1.2" fill="white" opacity={0.85} />
        <circle cx="59" cy="20" r="1.2" fill="white" opacity={0.85} />

        {/* eyebrows */}
        <path d="M38,16 Q42,14 46,15" stroke="#2C1810" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M54,15 Q58,14 62,16" stroke="#2C1810" strokeWidth="1.5" fill="none" strokeLinecap="round" />

        {/* smile */}
        <path d="M43,29 Q50,35 57,29" stroke="#B8702A" strokeWidth="1.8" fill="none" strokeLinecap="round" />

        {/* ── Body / jacket ─── */}
        <rect x="32" y="42" width="36" height="46" rx="7" fill={jacket} />
        {/* collar V */}
        <path d="M38,42 L50,52 L62,42" fill="none"
          stroke="rgba(255,255,255,0.28)" strokeWidth="2" strokeLinejoin="round" />
        {/* zip seam */}
        <line x1="50" y1="52" x2="50" y2="87"
          stroke="rgba(255,255,255,0.16)" strokeWidth="2" strokeDasharray="3.5 2.5" />

        {/* ── Left arm + hand ─── */}
        <motion.g style={{ transformOrigin: '32px 54px' }}
          animate={{ rotate: isRainy ? [-6,-6,-6] : [-24, 18, -24] }} transition={wt}>
          <line x1="32" y1="54" x2="14" y2="76"
            stroke={jacket} strokeWidth="11" strokeLinecap="round" />
          <circle cx="13" cy="79" r="7" fill={skin} />
        </motion.g>

        {/* ── Right arm + hand (raised for umbrella) ─── */}
        {isRainy ? (
          <g>
            <line x1="68" y1="54" x2="50" y2="6"
              stroke={jacket} strokeWidth="11" strokeLinecap="round" />
            <circle cx="50" cy="3" r="7" fill={skin} />
          </g>
        ) : (
          <motion.g style={{ transformOrigin: '68px 54px' }}
            animate={{ rotate: [18, -24, 18] }} transition={wt}>
            <line x1="68" y1="54" x2="86" y2="76"
              stroke={jacket} strokeWidth="11" strokeLinecap="round" />
            <circle cx="87" cy="79" r="7" fill={skin} />
          </motion.g>
        )}

        {/* ── Left leg + shoe ─── */}
        <motion.g style={{ transformOrigin: '40px 88px' }}
          initial={{ rotate: -28 }}
          animate={{ rotate: [-28, 28, -28] }} transition={wt}>
          <line x1="40" y1="88" x2="35" y2="144"
            stroke={pants} strokeWidth="13" strokeLinecap="round" />
          <ellipse cx="31" cy="150" rx="15" ry="7" fill={shoe} />
          <ellipse cx="28" cy="147" rx="6"  ry="3" fill="rgba(255,255,255,0.12)" />
        </motion.g>

        {/* ── Right leg + shoe ─── */}
        <motion.g style={{ transformOrigin: '60px 88px' }}
          initial={{ rotate: 28 }}
          animate={{ rotate: [28, -28, 28] }} transition={wt}>
          <line x1="60" y1="88" x2="65" y2="144"
            stroke={pants} strokeWidth="13" strokeLinecap="round" />
          <ellipse cx="69" cy="150" rx="15" ry="7" fill={shoe} />
          <ellipse cx="72" cy="147" rx="6"  ry="3" fill="rgba(255,255,255,0.12)" />
        </motion.g>

        {/* ── Ground shadow ─── */}
        <motion.ellipse cx="50" cy="164" rx="26" ry="5"
          fill="rgba(0,0,0,0.20)"
          animate={{ scaleX: [1, 0.85, 1] }}
          transition={{ duration: 0.68, repeat: Infinity, ease: 'easeInOut' }}
        />
      </svg>
    </motion.div>
  )
}

/* ─── Celestial bodies ──────────────────────────────────────────────────────── */
function SceneSun() {
  return (
    <motion.div style={{ position: 'absolute', right: '11%', bottom: 110, width: 56, height: 56 }}
      animate={{ y: [-5, 5, -5] }} transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}>
      <div style={{
        width: '100%', height: '100%', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,251,200,0.98) 0%, rgba(253,230,138,0.88) 50%, rgba(245,158,11,0.38) 100%)',
        boxShadow: '0 0 32px rgba(245,158,11,0.65), 0 0 72px rgba(245,158,11,0.28)',
        filter: 'blur(0.5px)',
      }} />
    </motion.div>
  )
}
function SceneMoon() {
  return (
    <motion.div style={{ position: 'absolute', right: '12%', bottom: 112, width: 42, height: 42 }}
      animate={{ y: [-4, 4, -4] }} transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}>
      <div style={{
        width: '100%', height: '100%', borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 35%, rgba(226,232,240,0.96) 0%, rgba(148,163,184,0.72) 70%, transparent 100%)',
        boxShadow: '0 0 20px rgba(148,163,184,0.50), 0 0 46px rgba(148,163,184,0.20)',
      }} />
    </motion.div>
  )
}

/* ─── Lightning + flash (thunder) ───────────────────────────────────────────── */
function SceneLightning({ isDark }: { isDark: boolean }) {
  const bolt  = isDark ? '#FDE68A' : '#F59E0B'
  const flash = isDark ? 'rgba(139,92,246,0.18)' : 'rgba(109,40,217,0.22)'
  const times = [0, 0.26, 0.28, 0.30, 0.34, 0.58, 0.60, 0.62, 0.66, 1] as const
  const op    = [0, 0, 1, 0.4, 0, 0, 0.9, 0.3, 0, 0]
  return (
    <>
      <motion.div className="absolute inset-0" style={{ background: flash }}
        animate={{ opacity: op }} transition={{ duration: 7, repeat: Infinity, ease: 'linear', times: [...times] }} />
      <motion.div style={{ position: 'absolute', right: '30%', top: 8 }}
        animate={{ opacity: op }} transition={{ duration: 7, repeat: Infinity, ease: 'linear', times: [...times] }}>
        <svg width="24" height="56" viewBox="0 0 24 56" aria-hidden="true">
          <path d="M15,0 L4,28 L11,28 L9,56 L22,21 L14,21 Z" fill={bolt} />
        </svg>
      </motion.div>
      <motion.div style={{ position: 'absolute', right: '46%', top: 18 }}
        animate={{ opacity: op.slice().reverse() }}
        transition={{ duration: 7, repeat: Infinity, ease: 'linear', times: [...times], delay: 0.8 }}>
        <svg width="17" height="40" viewBox="0 0 17 40" aria-hidden="true">
          <path d="M11,0 L3,20 L8,20 L6,40 L15,14 L9,14 Z" fill={bolt} opacity={0.75} />
        </svg>
      </motion.div>
    </>
  )
}

/* ─── Angled rain drops ─────────────────────────────────────────────────────── */
function SceneRain({ heavy, isDark }: { heavy: boolean; isDark: boolean }) {
  const count = heavy ? 26 : 16
  const drops = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i, left: `${-2 + (i / count) * 106}%`,
      delay: (i * 0.10) % 1.8,
      dur: heavy ? 0.36 + (i % 4) * 0.04 : 0.52 + (i % 4) * 0.06,
      height: heavy ? 20 + (i % 6) * 3 : 14 + (i % 5) * 2,
      opacity: isDark ? 0.48 + (i % 3) * 0.16 : 0.65 + (i % 3) * 0.14,
    })), [heavy, isDark, count])
  const grad = isDark
    ? 'linear-gradient(to bottom, rgba(147,197,253,0.92), rgba(147,197,253,0))'
    : 'linear-gradient(to bottom, rgba(30,64,138,0.85), rgba(30,64,138,0))'
  return (
    <div style={{ transform: `skewX(${heavy ? -14 : -8}deg)`, position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {drops.map((d) => (
        <motion.div key={d.id} className="absolute rounded-full"
          style={{ left: d.left, top: 0, height: d.height, width: heavy ? 1.5 : 1, background: grad, opacity: d.opacity }}
          animate={{ y: '200px' }}
          transition={{ duration: d.dur, delay: d.delay, repeat: Infinity, ease: 'linear' }}
        />
      ))}
    </div>
  )
}

/* ─── Snow ──────────────────────────────────────────────────────────────────── */
function SceneSnow({ isDark }: { isDark: boolean }) {
  const flakes = useMemo(() =>
    Array.from({ length: 18 }, (_, i) => ({
      id: i, left: `${(i / 18) * 100}%`, size: 2.5 + (i % 4),
      delay: (i * 0.19) % 3.2, dur: 2.0 + (i % 5) * 0.38,
      opacity: isDark ? 0.60 + (i % 3) * 0.16 : 0.52 + (i % 3) * 0.14,
    })), [isDark])
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

/* ─── Mist ──────────────────────────────────────────────────────────────────── */
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
  const hasPuddles = hasRain

  return (
    <div className="fixed bottom-0 left-0 right-0 overflow-hidden pointer-events-none"
      style={{ height: 196, zIndex: 2 }} aria-hidden="true">

      {/* Top edge fade */}
      <div className="absolute inset-x-0 top-0 z-10" style={{
        height: 60,
        background: isDark
          ? 'linear-gradient(to bottom, #000000 0%, transparent 100%)'
          : 'linear-gradient(to bottom, #5AAED4 0%, transparent 100%)',
      }} />

      {/* Condition FX (below ground level, full height) */}
      {hasRain    && <SceneRain heavy={hasThunder} isDark={isDark} />}
      {hasThunder && <SceneLightning isDark={isDark} />}
      {hasSnow    && <SceneSnow isDark={isDark} />}
      {hasMist    && <SceneMist isDark={isDark} />}

      {/* Celestial */}
      {isClear && isDark  && <SceneMoon />}
      {isClear && !isDark && <SceneSun />}

      {/* Environment */}
      <TreeLayer isDark={isDark} />
      <HouseSilhouette isDark={isDark} />
      <GroundLayer isDark={isDark} />

      {/* Ground-level details */}
      {hasPuddles && <RainPuddles isDark={isDark} />}
      {isClear    && <SunShimmer isDark={isDark} />}

      {/* Characters */}
      <DistantCharacter isDark={isDark} />
      <WalkingCharacter condition={condition} />

      {/* Foreground grass (on top of everything for depth) */}
      <ForegroundGrass isDark={isDark} />
    </div>
  )
}
