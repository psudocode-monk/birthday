import { birthdayConfig } from '../config/birthdayConfig.js'
import styles from './ProgressIndicator.module.css'

const STAGE_NAMES = [
  'The invitation',
  'The wish factory',
  'The memory garden',
  'The star challenge',
  'The birthday reveal',
]

/**
 * Top navigation bar: five stage dots + a back chevron when stage > 1.
 * Completed stages can be revisited; unfinished ones stay locked.
 */
export default function ProgressIndicator({ stage, maxStage, onJump, onBack }) {
  const reachedCount = Math.max(1, maxStage)

  return (
    <nav className={styles.bar} aria-label="Journey progress">
      <p className={styles.announce}>
        {`Stage ${stage} of 5 — ${STAGE_NAMES[stage - 1]}. ${reachedCount} of 5 reached.`}
      </p>

      <div className={styles.row}>
        {/* Back button — only visible from stage 2 onwards */}
        <button
          type="button"
          className={`${styles.backButton} ${stage > 1 ? styles.backVisible : ''}`}
          onClick={onBack}
          aria-label="Go back to previous stage"
          disabled={stage <= 1}
          tabIndex={stage <= 1 ? -1 : 0}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M11 14L6 9l5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <ul className={styles.dots}>
          {STAGE_NAMES.map((name, i) => {
            const n = i + 1
            const reached = n <= maxStage
            const current = n === stage

            if (!reached) {
              return (
                <li key={name} className={styles.item}>
                  <span className={styles.locked} aria-hidden="true" />
                </li>
              )
            }

            return (
              <li key={name} className={styles.item}>
                <button
                  type="button"
                  className={current ? `${styles.dot} ${styles.current}` : styles.dot}
                  onClick={() => onJump(n)}
                  aria-current={current ? 'step' : undefined}
                  aria-label={`Go back to stage ${n}: ${name}`}
                >
                  <span className={styles.fill} aria-hidden="true" />
                </button>
              </li>
            )
          })}
        </ul>

        {/* Spacer to balance the back button */}
        <span className={styles.spacer} aria-hidden="true" />
      </div>

      <p className={styles.wordmark}>{birthdayConfig.invitation.greeting}</p>
    </nav>
  )
}
