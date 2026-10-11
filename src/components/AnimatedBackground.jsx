import { useMemo } from 'react'
import styles from './AnimatedBackground.module.css'

/**
 * The night sky behind everything.
 *
 * - A deep gradient that shifts mood with each stage.
 * - A starfield generated once (no re-render churn).
 * - A few slow drifting motes and an occasional shooting star.
 * - A soft film grain so gradients never look flat.
 *
 * All animation is transform/opacity only, and every loop is
 * paused under `prefers-reduced-motion`.
 */
export default function AnimatedBackground({ stage = 1 }) {
  const stars = useMemo(() => {
    // Deterministic-ish spread so the sky feels composed, not random noise.
    return Array.from({ length: 46 }, (_, i) => {
      const x = (i * 37.7 + 11) % 100
      const y = (i * 61.3 + 7) % 100
      const size = i % 7 === 0 ? 2.4 : i % 3 === 0 ? 1.8 : 1.2
      return {
        id: i,
        x,
        y,
        size,
        delay: ((i * 1.7) % 7).toFixed(2),
        duration: (3.5 + ((i * 13) % 30) / 10).toFixed(2),
        bright: i % 5 === 0,
      }
    })
  }, [])

  const motes = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => ({
        id: i,
        x: (i * 14.3 + 6) % 96,
        delay: (i * 3.1).toFixed(2),
        duration: (16 + i * 2.5).toFixed(1),
        size: 3 + (i % 3),
      })),
    [],
  )

  // Gentle, intermittent falling stars: same direction (138deg), slow graceful glide, infrequent intervals
  const fallingStars = useMemo(
    () => [
      { id: 1, top: '6%', left: '80%', length: 115, delay: '2.0s', duration: '15s' },
      { id: 2, top: '18%', left: '55%', length: 95, delay: '8.0s', duration: '18s' },
      { id: 3, top: '10%', left: '92%', length: 125, delay: '14.0s', duration: '21s' },
    ],
    [],
  )

  return (
    <div className={styles.sky} aria-hidden="true">
      <div className={styles.base} />

      {/* Per-stage mood glow — cross-faded with opacity */}
      {[1, 2, 3, 4, 5].map((n) => (
        <div
          key={n}
          className={`${styles.glow} ${styles[`glow${n}`]} ${stage === n ? styles.glowOn : ''}`}
        />
      ))}

      <div className={styles.stars}>
        {stars.map((star) => (
          <span
            key={star.id}
            className={star.bright ? `${styles.star} ${styles.starBright}` : styles.star}
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`,
            }}
          />
        ))}
      </div>

      <div className={styles.fallingStarsWrap}>
        {fallingStars.map((s) => (
          <div
            key={s.id}
            className={styles.fallingStar}
            style={{
              top: s.top,
              left: s.left,
              '--angle': s.angle,
              animationDelay: s.delay,
              animationDuration: s.duration,
            }}
          >
            <div className={styles.fallingStarHead} />
            <div
              className={styles.fallingStarTail}
              style={{ width: `${s.length}px`, left: `-${s.length}px` }}
            />
          </div>
        ))}
      </div>

      <div className={styles.motes}>
        {motes.map((mote) => (
          <span
            key={mote.id}
            className={styles.mote}
            style={{
              left: `${mote.x}%`,
              bottom: '-12px',
              width: `${mote.size}px`,
              height: `${mote.size}px`,
              animationDelay: `${mote.delay}s`,
              animationDuration: `${mote.duration}s`,
            }}
          />
        ))}
      </div>

      <div className={styles.grain} />
      <div className={styles.vignette} />
    </div>
  )
}
