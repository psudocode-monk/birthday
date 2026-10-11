import { motion } from 'framer-motion'
import styles from './RevealCard.module.css'

/**
 * A softly animated card used for wishes, notes, results and the letter.
 * Never covers the whole screen — it sits within the scene.
 */
export default function RevealCard({ title, children, onClose, footer, tone = 'warm', delay = 0 }) {
  return (
    <motion.div
      className={`${styles.card} ${tone === 'rose' ? styles.rose : ''}`}
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.98 }}
      transition={{ duration: 0.42, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {onClose && (
        <button type="button" className={styles.close} onClick={onClose} aria-label="Close this note">
          <span aria-hidden="true">×</span>
        </button>
      )}
      {title && <h3 className={styles.title}>{title}</h3>}
      <div className={styles.body}>{children}</div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </motion.div>
  )
}
