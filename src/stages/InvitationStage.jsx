import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import BirthdayButton from '../components/BirthdayButton.jsx'
import useReducedMotion from '../hooks/useReducedMotion.js'
import { recipientName } from '../config/birthdayConfig.js'
import styles from './InvitationStage.module.css'

const OPEN_DURATION = 1900

/**
 * STAGE 1 · The Secret Birthday Invitation
 *
 * A sealed envelope under a soft glow. The first tap starts the music
 * (an explicit user gesture) and opens the envelope; she can also tap
 * "continue" to move on immediately — nothing is ever blocking.
 */
export default function InvitationStage({ config, onBegin, onAdvance, revisited }) {
  const reduced = useReducedMotion()
  const [opening, setOpening] = useState(false)
  const timerRef = useRef(null)
  const advancedRef = useRef(false)

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [])

  const advance = () => {
    if (advancedRef.current) return
    advancedRef.current = true
    if (timerRef.current) window.clearTimeout(timerRef.current)
    onAdvance()
  }

  const handleOpen = () => {
    if (opening) {
      advance()
      return
    }
    onBegin() // music starts here — the first real user gesture
    setOpening(true)
    timerRef.current = window.setTimeout(advance, reduced ? 500 : OPEN_DURATION)
  }

  const name = recipientName()
  const { invitation } = config

  return (
    <section className={styles.stage} aria-labelledby="invitation-title">
      <div className={styles.copy}>
        <motion.p
          className={styles.greeting}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {invitation.greeting}
        </motion.p>

        <motion.h1
          id="invitation-title"
          className={styles.title}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {name ? `A little universe, just for ${name}` : 'A little universe, just for you'}
        </motion.h1>

        <motion.div
          className={styles.lines}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.9 }}
        >
          {invitation.lines.map((line) => (
            <p key={line} className={styles.line}>
              {line}
            </p>
          ))}
        </motion.div>
      </div>

      {/* ── The envelope ─────────────────────────────────────── */}
      <motion.div
        className={`${styles.envelopeScene} ${opening ? styles.opening : ''}`}
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden="true"
      >
        <div className={styles.halo} />
        <div className={styles.env}>
          <div className={styles.letter}>
            <div className={styles.letterInner}>
              <span className={styles.letterHeart}>♥</span>
              <span className={styles.letterLine} />
              <span className={`${styles.letterLine} ${styles.short}`} />
            </div>
          </div>
          <div className={styles.envBack} />
          <div className={styles.envFront} />
          <div className={styles.envFlap} />
          <div className={styles.seal}>
            <span>♥</span>
          </div>
        </div>
        <p className={styles.envelopeNote}>{invitation.envelopeNote}</p>
      </motion.div>

      <motion.div
        className={styles.actions}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className={styles.prompt}>{invitation.prompt}</p>
        <BirthdayButton onClick={handleOpen} variant={revisited ? 'ghost' : 'primary'}>
          {revisited
            ? invitation.continueButton
            : opening
              ? 'Continue ✨'
              : invitation.button}
        </BirthdayButton>
      </motion.div>
    </section>
  )
}
