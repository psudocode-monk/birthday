import { useState, useEffect } from 'react'
import { Volume2, VolumeX, Pause, Play, Music, ChevronRight } from 'lucide-react'
import styles from './AudioControls.module.css'

/**
 * AudioControls with Edge Docking.
 *
 * - Docks neatly to the right edge as a sleek, non-intrusive tab by default so it
 *   never obstructs text on cards or buttons below.
 * - When tapped at the edge, it smoothly slides into full view ("when tapped at edge it will come").
 * - Once opened, it stays open while the user wants it ("when touched keep it the way it is").
 * - Features a tuck chevron so the user can easily slide it back to the edge whenever desired.
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

  // When highlighted by the initial sound prompt, keep it expanded
  useEffect(() => {
    if (highlighted) {
      setIsExpanded(true)
    }
  }, [highlighted])

  if (!hasTrack || failed) return null

  const handleEdgeClick = () => {
    if (!isExpanded) {
      setIsExpanded(true)
    }
  }

  const handleTuck = (e) => {
    e.stopPropagation()
    setIsExpanded(false)
  }

  const isVisibleExpanded = isExpanded || highlighted

  return (
    <div
      className={`${styles.wrap} ${
        isVisibleExpanded ? styles.expanded : styles.collapsed
      } ${highlighted ? styles.highlighted : ''}`}
      onClick={handleEdgeClick}
    >
      <div
        className={`${styles.pill} ${highlighted ? styles.highlightedPill : ''}`}
        role="region"
        aria-label="Audio controls"
      >
        {/* Edge tab handle — always accessible on the right screen border */}
        <button
          type="button"
          className={styles.edgeHandle}
          onClick={() => setIsExpanded((prev) => !prev)}
          aria-label={isVisibleExpanded ? 'Tuck music controls to edge' : 'Open music controls'}
          title={isVisibleExpanded ? 'Tuck to edge' : 'Open music controls'}
        >
          <Music size={16} aria-hidden="true" />
        </button>

        {/* Full controls: Play/Pause, Mute/Unmute, and Tuck */}
        {isVisibleExpanded && (
          <>
            <button
              type="button"
              className={styles.button}
              onClick={(e) => {
                e.stopPropagation()
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
                onToggleMute()
              }}
              aria-label={muted ? 'Unmute the music' : 'Mute the music'}
              aria-pressed={muted}
            >
              {muted ? <VolumeX size={18} aria-hidden="true" /> : <Volume2 size={18} aria-hidden="true" />}
            </button>

            {!highlighted && (
              <>
                <span className={styles.divider} aria-hidden="true" />
                <button
                  type="button"
                  className={styles.tuckButton}
                  onClick={handleTuck}
                  aria-label="Tuck music controls to edge"
                  title="Tuck to edge"
                >
                  <ChevronRight size={17} aria-hidden="true" />
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
