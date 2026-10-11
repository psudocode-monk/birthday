import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Volume2, Sparkles, Music } from 'lucide-react'
import styles from './SoundPromptOverlay.module.css'

/**
 * SoundPromptOverlay
 *
 * Appears upon app start or refresh when music is off:
 * 1. Shows a warm, focal spotlight in the center.
 * 2. Prompts the user to turn up the volume and turn on the music.
 * 3. Draws a soothing, animated trail of light flowing from the center
 *    directly down to the exact position of the music player in the bottom-right.
 * 4. Pulses a golden beacon over the music player to show exactly where it is.
 */
export default function SoundPromptOverlay({ onTurnOn, onDismiss }) {
  const [dims, setDims] = useState(() => ({
    w: typeof window !== 'undefined' ? window.innerWidth : 400,
    h: typeof window !== 'undefined' ? window.innerHeight : 700,
  }))

  useEffect(() => {
    const onResize = () => {
      setDims({ w: window.innerWidth, h: window.innerHeight })
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Calculate coordinates for the light trail from center card to bottom-right music pill
  const sx = dims.w / 2
  const sy = Math.min(dims.h * 0.58, dims.h / 2 + 130)
  const ex = Math.max(dims.w - 58, dims.w / 2 + 40)
  const ey = Math.max(dims.h - 38, dims.h / 2 + 100)

  // Smooth cubic Bezier control points for an organic flowing light stream
  const cp1x = sx
  const cp1y = dims.h - 90
  const cp2x = Math.max(dims.w - 150, sx)
  const cp2y = ey

  const pathD = `M ${sx} ${sy} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${ex} ${ey}`

  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }}
      transition={{ duration: 0.6 }}
      role="dialog"
      aria-label="Turn on music prompt"
    >
      {/* Central warm spotlight */}
      <div className={styles.centerSpotlight} aria-hidden="true" />

      {/* SVG Light Trail flowing from center to the music player */}
      <svg
        className={styles.lightTrailSvg}
        viewBox={`0 0 ${dims.w} ${dims.h}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="trailGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffeec6" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#f2d8a7" stopOpacity="0.95" />
            <stop offset="85%" stopColor="#f3b6c7" stopOpacity="1" />
            <stop offset="100%" stopColor="#ffeec6" stopOpacity="1" />
          </linearGradient>
          <radialGradient id="beaconGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffeec6" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#f2d8a7" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#f3b6c7" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Soft wide atmospheric glow */}
        <path d={pathD} className={styles.trailGlow} />

        {/* Dynamic streaming core of light */}
        <path d={pathD} className={styles.trailCore} />

        {/* Target beacon pulsing directly over the music player */}
        <circle cx={ex} cy={ey} r="22" fill="url(#beaconGrad)" className={styles.targetHalo} />
        <circle cx={ex} cy={ey} r="36" fill="url(#beaconGrad)" className={styles.targetHaloOuter} />
        <circle cx={ex} cy={ey} r="5" fill="#ffeec6" />
      </svg>

      {/* Floating guide label pointing to music player */}
      <div className={styles.targetLabel} aria-hidden="true">
        <Music size={13} />
        <span>Tap here to play music</span>
      </div>

      {/* Center card */}
      <motion.div
        className={styles.card}
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className={styles.iconWrap} aria-hidden="true">
          <Volume2 size={28} />
        </div>

        <h2 className={styles.title}>Volume up & turn on the music</h2>

        <p className={styles.subtitle}>
          This little universe is made to be heard. Turn your sound up to let the soothing melody in ✨
        </p>

        <div className={styles.actions}>
          <button type="button" className={styles.turnOnBtn} onClick={onTurnOn}>
            <Sparkles size={16} />
            <span>Turn the music on 🎵</span>
          </button>

          <button type="button" className={styles.dismissBtn} onClick={onDismiss}>
            Continue silently
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
