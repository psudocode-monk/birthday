import { motion } from 'framer-motion'

/**
 * Wraps each stage for a short, cinematic cross-fade.
 * Kept deliberately brief so the journey keeps flowing.
 */
export default function TransitionWrapper({ children, reduced = false, className = '' }) {
  return (
    <motion.div
      className={className}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 18 }}
      animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, y: -14 }}
      transition={{ duration: reduced ? 0.2 : 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
