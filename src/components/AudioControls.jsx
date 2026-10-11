import { useState, useEffect, useRef, useCallback } from 'react'
import { Volume2, VolumeX, Pause, Play, Music } from 'lucide-react'
import styles from './AudioControls.module.css'

const AUTO_HIDE_DELAY_MS = 1800

/**
 * AudioControls with Automatic Edge Docking.
 *
 * - Docks flush against the right screen border by default so it never obstructs text or cards.
 * - When tapped at the edge, it smoothly slides open.
 * - Automatically hides back to the edge after 1.8s of inactivity or on outside tap.
 * - Resets the auto-hide timer whenever touched/interacted with.
 * - Remains expanded and highlighted when the initial sound prompt is active.
 */
export default function AudioControls({
  hasTrack,
  playing,
  muted,
  blocked,
  failed,
  onToggle,
  onToggleMute,
  highlighted = false,
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const wrapRef = useRef(null)
  const hideTimerRef = useRef(null)

  // Resets the inactivity timer to automatically tuck controls back to the edge
  const resetHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current)
      hideTimerRef.current = null
    }
    // Only auto-hide when not highlighted by the initial sound prompt
    if (!highlighted) {
      hideTimerRef.current = window.setTimeout(() => {
        setIsExpanded(false)
      }, AUTO_HIDE_DELAY_MS)
    }
  }, [highlighted])

  // When highlighted by the initial sound prompt, stay expanded
  useEffect(() => {
    if (highlighted) {
      setIsExpanded(true)
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current)
    }
  }, [highlighted])

  // When expanded, set auto-hide timer and close on outside tap
  useEffect(() => {
    if (isExpanded && !highlighted) {
      resetHideTimer()

      const handlePointerOutside = (e) => {
        if (wrapRef.current && !wrapRef.current.contains(e.target)) {
          setIsExpanded(false)
        }
      }

      window.addEventListener('pointerdown', handlePointerOutside)
      return () => {
        if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current)
        window.removeEventListener('pointerdown', handlePointerOutside)
      }
    }
  }, [isExpanded, highlighted, resetHideTimer])

  if (!hasTrack || failed) return null

  const handleEdgeClick = () => {
    if (!isExpanded) {
      setIsExpanded(true)
    } else {
      resetHideTimer()
    }
  }

  const isVisibleExpanded = isExpanded || highlighted

  return (
    <div
      ref={wrapRef}
      className={`${styles.wrap} ${
        isVisibleExpanded ? styles.expanded : styles.collapsed
      } ${highlighted ? styles.highlighted : ''}`}
      onClick={handleEdgeClick}
      onPointerEnter={resetHideTimer}
      onTouchStart={resetHideTimer}
    >
      <div
        className={`${styles.pill} ${highlighted ? styles.highlightedPill : ''}`}
        role="region"
        aria-label="Audio controls"
      >
        {/* Edge tab handle — always accessible on the right border */}
        <button
          type="button"
          className={styles.edgeHandle}
          onClick={() => {
            if (!isExpanded) setIsExpanded(true)
            else resetHideTimer()
          }}
          aria-label={isVisibleExpanded ? 'Music controls active' : 'Open music controls'}
          title={isVisibleExpanded ? 'Music controls' : 'Open music controls'}
        >
          <Music size={16} aria-hidden="true" />
        </button>

        {/* Control buttons: Play/Pause and Mute/Unmute (automatically hides after 3.2s) */}
        {isVisibleExpanded && (
          <>
            <button
              type="button"
              className={styles.button}
              onClick={(e) => {
                e.stopPropagation()
                resetHideTimer()
                onToggle()
              }}
              aria-label={playing ? 'Pause the music' : 'Play the music'}
              aria-pressed={playing}
            >
              {playing ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
            </button>

            <span className={styles.divider} aria-hidden="true" />

            <button
              type="button"
              className={styles.button}
              onClick={(e) => {
                e.stopPropagation()
                resetHideTimer()
                onToggleMute()
              }}
              aria-label={muted ? 'Unmute the music' : 'Mute the music'}
              aria-pressed={muted}
            >
              {muted ? <VolumeX size={18} aria-hidden="true" /> : <Volume2 size={18} aria-hidden="true" />}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
