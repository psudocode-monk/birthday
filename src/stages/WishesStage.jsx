import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import BirthdayButton from '../components/BirthdayButton.jsx'
import RevealCard from '../components/RevealCard.jsx'
import { sfx } from '../utils/sfx.js'
import styles from './WishesStage.module.css'

const STAR_POSITIONS = [
  { left: '12%', top: '4%' },
  { left: '50%', top: '-4%' },
  { left: '88%', top: '6%' },
]

/**
 * STAGE 2 · The Birthday Wish Factory
 *
 * Three glowing stars orbit a little wishing jar. Tap each star to
 * collect a birthday wish; the jar fills with light as she goes.
 * Double-taps are ignored while a wish is settling.
 */
export default function WishesStage({ config, collected, onCollect, onContinue }) {
  const [activeIndex, setActiveIndex] = useState(() => collected.findIndex(Boolean))
  const [burst, setBurst] = useState(null)
  const lockRef = useRef(new Set())
  const timersRef = useRef([])

  const { wishes } = config
  const count = collected.filter(Boolean).length
  const allDone = count === wishes.messages.length

  useEffect(() => {
    return () => {
      timersRef.current.forEach((t) => window.clearTimeout(t))
      timersRef.current = []
    }
  }, [])

  const collect = (index) => {
    if (collected[index] || lockRef.current.has(index)) return
    lockRef.current.add(index)

    sfx.chime()
    onCollect(index)
    setActiveIndex(index)
    setBurst(index)

    const t = window.setTimeout(() => setBurst(null), 750)
    timersRef.current.push(t)
  }

  const shownIndex = activeIndex >= 0 ? activeIndex : -1

  return (
    <section className={styles.stage} aria-labelledby="wishes-title">
      <header className={styles.header}>
        <p className={styles.eyebrow}>stage two</p>
        <h2 id="wishes-title" className={styles.title}>
          {wishes.title}
        </h2>
        <p className={styles.subtitle}>{wishes.subtitle}</p>
      </header>

      <p className={styles.instruction}>{wishes.instruction}</p>

      <div className={styles.scene}>
        <div className={styles.starRow}>
          {wishes.messages.map((message, i) => {
            const done = collected[i]
            return (
              <div key={message} className={styles.starSlot} style={STAR_POSITIONS[i]}>
                <button
                  type="button"
                  className={`${styles.starButton} ${done ? styles.starDone : ''}`}
                  onClick={() => collect(i)}
                  disabled={done}
                  aria-label={
                    done
                      ? `Wish ${i + 1} collected`
                      : `Collect birthday wish ${i + 1} of ${wishes.messages.length}`
                  }
                  aria-pressed={done}
                >
                  <svg viewBox="0 0 48 48" className={styles.starGlyph} aria-hidden="true">
                    <path
                      d="M24 3c1.4 8.7 4.6 13.3 15.5 15.6C28.6 20.9 25.4 25.5 24 34.2c-1.4-8.7-4.6-13.3-15.5-15.6C19.4 16.3 22.6 11.7 24 3Z"
                      fill="currentColor"
                    />
                    <path
                      d="M38 30c.7 4 2.2 6 6.6 7-4.4 1-5.9 3-6.6 7-.7-4-2.2-6-6.6-7 4.4-1 5.9-3 6.6-7Z"
                      fill="currentColor"
                      opacity="0.85"
                    />
                  </svg>
                </button>
                {burst === i && (
                  <span className={styles.burst} aria-hidden="true">
                    {[...Array(6)].map((_, k) => (
                      <span
                        key={k}
                        className={styles.spark}
                        style={{
                          '--bx': `${Math.cos((k / 6) * Math.PI * 2) * 34}px`,
                          '--by': `${Math.sin((k / 6) * Math.PI * 2) * 34}px`,
                        }}
                      />
                    ))}
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {/* The wishing jar */}
        {/* The wishing jar */}
        <div
          className={styles.jar}
          style={{ '--fill': count / wishes.messages.length }}
          aria-hidden="true"
        >
          <svg viewBox="0 0 120 140" className={styles.jarSvg}>
            <defs>
              <linearGradient id="jarGlass" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="rgba(242,216,167,0.22)" />
                <stop offset="100%" stopColor="rgba(243,182,199,0.10)" />
              </linearGradient>
              <linearGradient id="jarLight" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="rgba(255,238,198,0.92)" />
                <stop offset="60%" stopColor="rgba(242,216,167,0.70)" />
                <stop offset="100%" stopColor="rgba(255,238,198,0.25)" />
              </linearGradient>
              <radialGradient id="jarOrb" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fff6dd" />
                <stop offset="50%" stopColor="#ffeec6" />
                <stop offset="100%" stopColor="rgba(242,216,167,0)" />
              </radialGradient>
              {/* Exact inner cavity of the bottle to clip all glowing light strictly inside */}
              <clipPath id="jarInside">
                <path d="M40 22h40c6 8 12 16 12 34v56c0 8-6 14-14 14H42c-8 0-14-6-14-14V56c0-18 6-26 12-34Z" />
              </clipPath>
            </defs>

            {/* Glowing light fill — strictly contained inside the jar */}
            <g clipPath="url(#jarInside)">
              <rect
                className={styles.jarFill}
                x="24"
                y="22"
                width="72"
                height="106"
                fill="url(#jarLight)"
              />
              {/* Star orbs resting inside the jar as wishes are gathered */}
              {collected[0] && (
                <circle cx="60" cy="112" r="7" fill="url(#jarOrb)" className={styles.settledStar} />
              )}
              {collected[1] && (
                <circle cx="48" cy="88" r="6.5" fill="url(#jarOrb)" className={styles.settledStar} />
              )}
              {collected[2] && (
                <circle cx="70" cy="64" r="6" fill="url(#jarOrb)" className={styles.settledStar} />
              )}
            </g>

            {/* Jar glass body */}
            <path
              d="M40 22h40c6 8 12 16 12 34v56c0 8-6 14-14 14H42c-8 0-14-6-14-14V56c0-18 6-26 12-34Z"
              fill="url(#jarGlass)"
              stroke="rgba(242,216,167,0.5)"
              strokeWidth="1.6"
            />

            {/* Jar neck lip / rim */}
            <rect x="34" y="8" width="52" height="13" rx="6.5" fill="rgba(242,216,167,0.55)" stroke="rgba(242,216,167,0.7)" strokeWidth="1" />

            {/* Specular glass reflection on left wall */}
            <path d="M44 38c-3 8-5 16-5 28v36" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      <div className={styles.progressArea} aria-live="polite">
        <span className={styles.count}>{wishes.collectedLabel(count)}</span>
        <span className={styles.pips}>
          {wishes.messages.map((message, i) => (
            <span
              key={message}
              className={collected[i] ? `${styles.pip} ${styles.pipOn}` : styles.pip}
            />
          ))}
        </span>
      </div>

      <div className={styles.messageArea}>
        <AnimatePresence mode="wait">
          {shownIndex >= 0 && (
            <RevealCard key={`wish-${shownIndex}`} title={`Wish ${shownIndex + 1}`}>
              <p>{wishes.messages[shownIndex]}</p>
            </RevealCard>
          )}
        </AnimatePresence>
      </div>

      {allDone && (
        <motion.div
          className={styles.footer}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className={styles.complete}>{wishes.completeMessage}</p>
          <BirthdayButton onClick={onContinue}>{wishes.continueButton}</BirthdayButton>
        </motion.div>
      )}
    </section>
  )
}
