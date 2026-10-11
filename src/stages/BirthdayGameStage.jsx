import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import BirthdayButton from '../components/BirthdayButton.jsx'
import useReducedMotion from '../hooks/useReducedMotion.js'
import { gameResultFor } from '../config/birthdayConfig.js'
import { sfx } from '../utils/sfx.js'
import styles from './BirthdayGameStage.module.css'

const MAX_STARS = 9

/**
 * STAGE 4 · The Cute Birthday Challenge
 *
 * "Catch the falling birthday stars" — a relaxed 12-second round.
 * Built with CSS animation (transform/opacity only), with timers and
 * animation frames cleaned up properly. The round pauses when the page
 * is hidden, and nobody is ever punished for a missed star.
 */
export default function BirthdayGameStage({ config, completed, bestScore, onFinish, onContinue }) {
  const reduced = useReducedMotion()
  const { game } = config

  const durationMs = Math.max(5, game.durationSeconds) * 1000

  const [phase, setPhase] = useState('intro') // intro | playing | result
  const [stars, setStars] = useState([])
  const [floaters, setFloaters] = useState([])
  const [score, setScore] = useState(0)
  const [finalScore, setFinalScore] = useState(0)
  const [remaining, setRemaining] = useState(game.durationSeconds)
  const [paused, setPaused] = useState(false)
  const [fieldHeight, setFieldHeight] = useState(520)

  const fieldRef = useRef(null)
  const spawnTimerRef = useRef(null)
  const countdownRef = useRef(null)
  const floatersRef = useRef([])
  const startTimeRef = useRef(0)
  const pauseStartRef = useRef(0)
  const idRef = useRef(0)
  const scoreRef = useRef(0)
  const playingRef = useRef(false)
  const phaseRef = useRef('intro')

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  const clearTimers = useCallback(() => {
    if (spawnTimerRef.current) {
      window.clearTimeout(spawnTimerRef.current)
      spawnTimerRef.current = null
    }
    if (countdownRef.current) {
      window.clearInterval(countdownRef.current)
      countdownRef.current = null
    }
    floatersRef.current.forEach((t) => window.clearTimeout(t))
    floatersRef.current = []
  }, [])

  const spawnOne = useCallback(() => {
    if (!playingRef.current) return
    setStars((prev) => {
      if (prev.length >= MAX_STARS) return prev
      idRef.current += 1
      const size = 46 + Math.round(Math.random() * 16)
      return [
        ...prev,
        {
          id: idRef.current,
          x: 7 + Math.random() * 82,
          size,
          duration: 3.2 + Math.random() * 1.8,
          spin: (Math.random() * 40 - 20).toFixed(1),
        },
      ]
    })
    const delay = 400 + Math.random() * 520
    spawnTimerRef.current = window.setTimeout(spawnOne, delay)
  }, [])

  const endRound = useCallback(() => {
    playingRef.current = false
    clearTimers()
    setStars([])
    setPaused(false)
    setFinalScore(scoreRef.current)
    setPhase('result')
    onFinish(scoreRef.current)
  }, [clearTimers, onFinish])

  const startCountdown = useCallback(() => {
    countdownRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current
      const left = Math.max(0, durationMs - elapsed)
      setRemaining(Math.ceil(left / 1000))
      if (left <= 0) endRound()
    }, 200)
  }, [durationMs, endRound])

  const startRound = useCallback(() => {
    if (fieldRef.current) setFieldHeight(fieldRef.current.clientHeight || 520)
    clearTimers()
    scoreRef.current = 0
    setScore(0)
    setFinalScore(0)
    setStars([])
    setFloaters([])
    setRemaining(game.durationSeconds)
    setPaused(false)
    setPhase('playing')
    playingRef.current = true
    startTimeRef.current = Date.now()
    startCountdown()
    spawnTimerRef.current = window.setTimeout(spawnOne, 500)
  }, [clearTimers, game.durationSeconds, spawnOne, startCountdown])

  // Pause the round when the tab is hidden; resume where it left off.
  useEffect(() => {
    const onVisibility = () => {
      if (phaseRef.current !== 'playing') return
      if (document.hidden) {
        playingRef.current = false
        pauseStartRef.current = Date.now()
        if (spawnTimerRef.current) window.clearTimeout(spawnTimerRef.current)
        if (countdownRef.current) window.clearInterval(countdownRef.current)
        setPaused(true)
      } else if (paused) {
        const hiddenFor = Date.now() - pauseStartRef.current
        startTimeRef.current += hiddenFor
        playingRef.current = true
        setPaused(false)
        startCountdown()
        spawnTimerRef.current = window.setTimeout(spawnOne, 400)
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [paused, spawnOne, startCountdown])

  // Unmount safety: nothing keeps running after the stage is left.
  useEffect(() => {
    return () => {
      playingRef.current = false
      clearTimers()
    }
  }, [clearTimers])

  const removeStar = useCallback((id) => {
    setStars((prev) => prev.filter((star) => star.id !== id))
  }, [])

  const catchStar = (star) => {
    if (!playingRef.current) return
    removeStar(star.id)
    scoreRef.current += 1
    setScore(scoreRef.current)
    sfx.pop()

    const floaterId = star.id + 100000
    setFloaters((prev) => [...prev, { id: floaterId, x: star.x }])
    const t = window.setTimeout(() => {
      setFloaters((prev) => prev.filter((f) => f.id !== floaterId))
    }, 720)
    floatersRef.current.push(t)
  }

  const result = gameResultFor(phase === 'result' ? finalScore : score)
  const showIntro = phase === 'intro'
  const showResult = phase === 'result'

  return (
    <section className={styles.stage} aria-labelledby="game-title">
      <header className={styles.header}>
        <p className={styles.eyebrow}>stage four</p>
        <h2 id="game-title" className={styles.title}>
          {game.title}
        </h2>
      </header>

      {/* ── Game field ─────────────────────────────────────── */}
      <div className={styles.fieldWrap}>
        <div
          ref={fieldRef}
          className={`${styles.field} ${paused ? styles.paused : ''}`}
          style={{ '--fall-distance': `${fieldHeight + 130}px` }}
        >
          {phase === 'playing' && (
            <>
              <div className={styles.hud}>
                <span className={styles.hudItem}>
                  <span className={styles.hudValue}>{score}</span>
                  <span className={styles.hudLabel}>{game.scoreLabel}</span>
                </span>
                <span className={styles.hudItem}>
                  <span className={styles.hudValue}>{remaining}</span>
                  <span className={styles.hudLabel}>{game.timeLabel}</span>
                </span>
              </div>

              <AnimatePresence>
                {stars.map((star) => (
                  <button
                    key={star.id}
                    type="button"
                    className={styles.star}
                    style={{
                      left: `${star.x}%`,
                      width: `${star.size}px`,
                      height: `${star.size}px`,
                      animationDuration: `${star.duration}s`,
                      '--spin': `${star.spin}deg`,
                    }}
                    onClick={() => catchStar(star)}
                    onAnimationEnd={() => removeStar(star.id)}
                    aria-label="Catch this star"
                  >
                    <svg viewBox="0 0 48 48" aria-hidden="true">
                      <path
                        d="M24 4c1.3 8.2 4.3 12.6 14.6 14.8C28.3 21 25.3 25.4 24 33.6c-1.3-8.2-4.3-12.6-14.6-14.8C19.7 16.6 22.7 12.2 24 4Z"
                        fill="currentColor"
                      />
                    </svg>
                  </button>
                ))}
              </AnimatePresence>

              {floaters.map((floater) => (
                <span
                  key={floater.id}
                  className={styles.plusOne}
                  style={{ left: `${floater.x}%` }}
                  aria-hidden="true"
                >
                  ✦
                </span>
              ))}

              {paused && (
                <div className={styles.pauseOverlay}>
                  <p>{game.pauseLabel}</p>
                </div>
              )}
            </>
          )}

          {/* ── Intro ──────────────────────────────────────── */}
          {showIntro && (
            <div className={styles.overlay}>
              <p className={styles.instruction}>{game.instruction}</p>
              <BirthdayButton onClick={startRound}>{game.startButton}</BirthdayButton>
              {completed && bestScore > 0 && (
                <p className={styles.bestSoFar}>{`Your best so far: ${bestScore} ✦`}</p>
              )}
            </div>
          )}

          {/* ── Result ─────────────────────────────────────── */}
          {showResult && (
            <motion.div
              className={styles.overlay}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              aria-live="polite"
            >
              <p className={styles.finalScore}>{`${finalScore} ✦`}</p>
              <h3 className={styles.resultTitle}>{result.title}</h3>
              <p className={styles.resultMessage}>{result.message}</p>
              <div className={styles.resultActions}>
                <BirthdayButton onClick={onContinue}>{game.continueButton}</BirthdayButton>
                <BirthdayButton onClick={startRound} variant="ghost">
                  {game.replayButton}
                </BirthdayButton>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {phase === 'playing' && (
        <p className={styles.liveHint} aria-live="off">
          {`${score} caught — ${remaining}s`}
        </p>
      )}
    </section>
  )
}
