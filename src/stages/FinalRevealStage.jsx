import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import BirthdayButton from '../components/BirthdayButton.jsx'
import RevealCard from '../components/RevealCard.jsx'
import useReducedMotion from '../hooks/useReducedMotion.js'
import { finalHeadline, senderName } from '../config/birthdayConfig.js'
import { preloadImage } from '../utils/assetFallbacks.js'
import { sfx } from '../utils/sfx.js'
import styles from './FinalRevealStage.module.css'

const LIGHTS = [...Array(12)].map((_, i) => ({
  id: i,
  left: 4 + ((i * 8.4) % 92),
  top: 6 + ((i * 17.3) % 40),
  delay: (i * 0.16).toFixed(2),
  size: 4 + (i % 3),
}))

/**
 * STAGE 5 · The Grand Birthday Reveal
 *
 * The sky warms, lights shimmer, the birthday cake appears with glowing candles,
 * confetti drifts down, and the heartfelt message & letter are revealed.
 */
export default function FinalRevealStage({ config, letterOpen, onToggleLetter, onRestart, reduced }) {
  const { final } = config
  const confettiRef = useRef(null)
  const [keepsake, setKeepsake] = useState(null)

  const fireConfetti = useCallback(() => {
    if (reduced) return
    const run = (confetti) => {
      const origin = { x: 0.5, y: 0.65 }
      confetti({
        particleCount: 80,
        spread: 85,
        startVelocity: 42,
        scalar: 0.9,
        ticks: 240,
        origin,
        colors: ['#f2d8a7', '#ffeec6', '#f3b6c7', '#d98aa0', '#fdf6ec'],
        disableForReducedMotion: true,
      })
    }
    if (confettiRef.current) {
      run(confettiRef.current)
      return
    }
    import('canvas-confetti')
      .then((mod) => {
        confettiRef.current = mod.default || mod
        run(confettiRef.current)
      })
      .catch(() => {
        /* confetti is decorative */
      })
  }, [reduced])

  // Fire confetti and sparkle sound automatically on mount
  useEffect(() => {
    sfx.sparkle()
    const timer = window.setTimeout(() => {
      fireConfetti()
    }, 400)
    return () => window.clearTimeout(timer)
  }, [fireConfetti])

  // Optional keepsake photo from config — skipped silently if unused/broken.
  useEffect(() => {
    const url = config.final.image
    if (!url) return
    let cancelled = false
    preloadImage(url).then((ok) => {
      if (ok && !cancelled) setKeepsake(url)
    })
    return () => {
      cancelled = true
    }
  }, [config.final.image])

  const sender = senderName()

  return (
    <section className={styles.stage} aria-labelledby="final-title">
      {/* Warm lights shimmering in the sky */}
      <div className={styles.lights} aria-hidden="true">
        {LIGHTS.map((light) => (
          <span
            key={light.id}
            className={styles.light}
            style={{
              left: `${light.left}%`,
              top: `${light.top}%`,
              width: `${light.size}px`,
              height: `${light.size}px`,
              animationDelay: `${light.delay}s`,
              opacity: 1,
            }}
          />
        ))}
      </div>

      {/* The Birthday Cake — animates in smoothly */}
      <motion.div
        className={styles.cakeWrap}
        initial={reduced ? false : { opacity: 0, scale: 0.86, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        aria-label="A birthday cake with three glowing candles"
      >
        <div className={styles.cakeGlow} aria-hidden="true" />
        <svg viewBox="0 0 240 200" className={styles.cake} aria-hidden="true">
          <defs>
            <linearGradient id="tier1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5b3f7e" />
              <stop offset="100%" stopColor="#3a2859" />
            </linearGradient>
            <linearGradient id="tier2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6d4c92" />
              <stop offset="100%" stopColor="#45306a" />
            </linearGradient>
            <linearGradient id="frost" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffeec6" />
              <stop offset="100%" stopColor="#f3b6c7" />
            </linearGradient>
            <radialGradient id="flame" cx="50%" cy="35%" r="70%">
              <stop offset="0%" stopColor="#fff6dd" />
              <stop offset="55%" stopColor="#f2d8a7" />
              <stop offset="100%" stopColor="#d98aa0" />
            </radialGradient>
          </defs>

          {/* plate */}
          <ellipse cx="120" cy="182" rx="92" ry="11" fill="rgba(242,216,167,0.22)" />

          {/* candles */}
          {[78, 120, 162].map((x, i) => (
            <g key={x}>
              <rect x={x - 4} y="52" width="8" height="30" rx="3" fill="#f3b6c7" />
              <rect x={x - 4} y="58" width="8" height="5" fill="rgba(255,255,255,0.5)" />
              <ellipse
                className={styles.flame}
                cx={x}
                cy="43"
                rx="5"
                ry="9"
                fill="url(#flame)"
                style={{ animationDelay: `${i * 0.34}s` }}
              />
            </g>
          ))}

          {/* top tier */}
          <rect x="82" y="82" width="76" height="34" rx="9" fill="url(#tier2)" />
          <path
            d="M82 92c6 6 10-4 16 2s10 5 16-1 10 4 16 0 10 5 16-2 6 6 12 1v-2H82Z"
            fill="url(#frost)"
            opacity="0.9"
          />

          {/* bottom tier */}
          <rect x="58" y="118" width="124" height="46" rx="12" fill="url(#tier1)" />
          <path
            d="M58 130c8 7 14-5 22 2s14 6 22-2 14 5 22 0 14 6 22-2 14 6 22 1v-3H58Z"
            fill="url(#frost)"
            opacity="0.9"
          />

          {/* sprinkles of light */}
          <circle cx="86" cy="148" r="2.4" fill="#f2d8a7" opacity="0.9" />
          <circle cx="150" cy="152" r="2" fill="#f3b6c7" opacity="0.9" />
          <circle cx="118" cy="140" r="1.8" fill="#ffeec6" opacity="0.8" />
          <circle cx="104" cy="102" r="1.8" fill="#ffeec6" opacity="0.8" />
          <circle cx="140" cy="106" r="2.2" fill="#f2d8a7" opacity="0.9" />
        </svg>
      </motion.div>

      {/* Birthday Message */}
      <motion.div
        className={styles.message}
        initial={reduced ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className={styles.eyebrow}>{final.eyebrow}</p>
        <h2 id="final-title" className={styles.headline}>
          {finalHeadline()}
        </h2>
        <p className={styles.description}>{final.description}</p>
        <p className={styles.closing}>{final.closing}</p>

        {keepsake && (
          <img
            className={styles.keepsake}
            src={keepsake}
            alt="A keepsake moment"
            loading="lazy"
            decoding="async"
          />
        )}

        {sender && <p className={styles.signature}>{`— ${sender}`}</p>}

        <div className={styles.actions}>
          <BirthdayButton
            onClick={() => {
              if (!letterOpen) sfx.sparkle()
              onToggleLetter()
            }}
            variant={letterOpen ? 'ghost' : 'primary'}
          >
            {letterOpen ? final.letterButtonOpen : final.letterButton}
          </BirthdayButton>

          <AnimatePresence>
            {letterOpen && (
              <RevealCard
                key="letter"
                title={final.letterTitle}
                tone="rose"
                onClose={onToggleLetter}
              >
                <div className={styles.letter}>
                  {final.letter.split('\n\n').map((paragraph) => (
                    <p key={paragraph} className={styles.paragraph}>
                      {paragraph}
                    </p>
                  ))}
                  <p className={styles.signOff}>{final.signOff}</p>
                </div>
              </RevealCard>
            )}
          </AnimatePresence>

          {/* Home button — goes back to the very beginning */}
          <button type="button" className={styles.homeButton} onClick={onRestart}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 12L12 4l9 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {final.restartButton}
          </button>
        </div>
      </motion.div>
    </section>
  )
}
