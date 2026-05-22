/**
 * TiltCard — mouse-tracking 3-D tilt + specular glare overlay.
 *
 * Drop-in wrapper around any glass card.
 * Works on desktop only (pointer: fine); on touch devices the card sits flat.
 *
 * Usage:
 *   <TiltCard className="glass-card ...">…</TiltCard>
 */
import { useRef, useCallback } from 'react'
import {
  motion,
  useMotionValue,
  useTransform,
  useMotionTemplate,
  animate,
} from 'framer-motion'

interface TiltCardProps {
  children: React.ReactNode
  /** Forward your glass-card + layout classes here */
  className?: string
  style?: React.CSSProperties
  /** Maximum tilt angle in degrees (default 8) */
  maxTilt?: number
}

export function TiltCard({
  children,
  className = '',
  style,
  maxTilt = 8,
}: TiltCardProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Normalised mouse position: 0 = top/left edge, 1 = bottom/right edge
  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)

  // Map to rotation angles
  const rotateX = useTransform(my, [0, 1], [maxTilt, -maxTilt])
  const rotateY = useTransform(mx, [0, 1], [-maxTilt, maxTilt])

  // Glare: radial highlight that tracks the cursor
  const glareX = useTransform(mx, [0, 1], [0, 100])
  const glareY = useTransform(my, [0, 1], [0, 100])
  const glareBg = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.13) 0%, transparent 56%)`

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = containerRef.current
      if (!el) return
      const { left, top, width, height } = el.getBoundingClientRect()
      mx.set((e.clientX - left) / width)
      my.set((e.clientY - top) / height)
    },
    [mx, my],
  )

  const onMouseLeave = useCallback(() => {
    // Spring back to centre
    animate(mx, 0.5, { duration: 0.7, ease: [0.22, 1, 0.36, 1] })
    animate(my, 0.5, { duration: 0.7, ease: [0.22, 1, 0.36, 1] })
  }, [mx, my])

  return (
    /* Outer container owns `perspective` so the child 3-D transform is correct */
    <div
      ref={containerRef}
      style={{ perspective: '900px' }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <motion.div
        className={`relative ${className}`}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d', ...style }}
        whileHover={{ scale: 1.018 }}
        transition={{ scale: { type: 'spring', stiffness: 260, damping: 22 } }}
      >
        {/* Specular glare — sits on top of content, pointer-events-none */}
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none rounded-[20px] z-10 overflow-hidden"
          style={{ background: glareBg }}
        />
        {children}
      </motion.div>
    </div>
  )
}
