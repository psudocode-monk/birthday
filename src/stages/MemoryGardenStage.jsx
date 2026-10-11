import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import BirthdayButton from '../components/BirthdayButton.jsx'
import RevealCard from '../components/RevealCard.jsx'
import { sfx } from '../utils/sfx.js'
import styles from './MemoryGardenStage.module.css'

// Composed, not random: a gentle arc across the garden.
const FLOWER_POSITIONS = [
  { left: '16%', top: '68%' },
  { left: '38%', top: '38%' },
  { left: '62%', top: '64%' },
  { left: '26%', top: '12%' },
  { left: '82%', top: '26%' },
]

/**
 * STAGE 3 · Our Little Memory Garden
 *
 * Five night-blooming flowers, each hiding a short note. Progress is
 * preserved: she can reopen any flower, and nothing is lost.
 */
export default function MemoryGardenStage({ config, found, onDiscover, onContinue }) {
  const [openIndex, setOpenIndex] = useState(null)

  const { memory } = config
  const count = found.filter(Boolean).length
  const allDone = count === memory.messages.length

  const openFlower = (index) => {
    sfx.chime()
    onDiscover(index)
    setOpenIndex(index)
  }

  return (
    <section className={styles.stage} aria-labelledby="memory-title">
      <header className={styles.header}>
        <p className={styles.eyebrow}>stage three</p>
        <h2 id="memory-title" className={styles.title}>
          {memory.title}
        </h2>
        <p className={styles.subtitle}>{memory.subtitle}</p>
      </header>

      <p className={styles.instruction}>{memory.instruction}</p>

      <div className={styles.garden} role="group" aria-label="Memory garden">
        <div className={styles.ground} aria-hidden="true" />
        {FLOWER_POSITIONS.map((position, i) => {
          const isOpen = openIndex === i
          return (
            <div key={memory.messages[i]} className={styles.node} style={position}>
              <button
                type="button"
                className={`${styles.flower} ${found[i] ? styles.flowerOpen : ''} ${
                  isOpen ? styles.flowerActive : ''
                }`}
                style={{ animationDelay: `${i * 0.7}s` }}
                onClick={() => openFlower(i)}
                aria-label={`Flower ${i + 1} — ${found[i] ? 'reopen this little note' : 'read the little note'}`}
                aria-pressed={isOpen}
              >
                <svg viewBox="0 0 64 72" className={styles.flowerGlyph} aria-hidden="true">
                  <path d="M32 40v28" stroke="rgba(146,190,150,0.75)" strokeWidth="3" strokeLinecap="round" />
                  <path d="M32 56c-8-2-12-7-13-14 8 0 13 4 13 14Z" fill="rgba(146,190,150,0.6)" />
                  {[0, 60, 120, 180, 240, 300].map((deg) => (
                    <ellipse
                      key={deg}
                      cx="32"
                      cy="24"
                      rx="7.5"
                      ry="13"
                      fill={found[i] ? 'rgba(243,182,199,0.92)' : 'rgba(243,182,199,0.45)'}
                      transform={`rotate(${deg} 32 32)`}
                    />
                  ))}
                  <circle
                    cx="32"
                    cy="32"
                    r={found[i] ? 8.5 : 6.5}
                    fill={found[i] ? '#ffeec6' : 'rgba(242,216,167,0.75)'}
                  />
                </svg>
                <span className={styles.glowRing} aria-hidden="true" />
              </button>
            </div>
          )
        })}
      </div>

      <div className={styles.progressArea} aria-live="polite">
        <span className={styles.count}>{`${count} of ${memory.messages.length} flowers opened`}</span>
        <span className={styles.pips}>
          {memory.messages.map((message, i) => (
            <span key={message} className={found[i] ? `${styles.pip} ${styles.pipOn}` : styles.pip} />
          ))}
        </span>
      </div>

      <div className={styles.noteArea}>
        <AnimatePresence mode="wait">
          {openIndex !== null && (
            <RevealCard
              key={`memory-${openIndex}`}
              title={memory.cardTitle}
              tone="rose"
              onClose={() => setOpenIndex(null)}
            >
              <p>{memory.messages[openIndex]}</p>
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
          <p className={styles.complete}>{memory.allFoundMessage}</p>
          <BirthdayButton onClick={onContinue}>{memory.continueButton}</BirthdayButton>
        </motion.div>
      )}
    </section>
  )
}
