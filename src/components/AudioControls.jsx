import { Volume2, VolumeX, Pause, Play, Music4 } from 'lucide-react'
import styles from './AudioControls.module.css'

/**
 * A small floating music control that stays out of the way.
 * Shows play/pause plus an independent mute toggle, and a gentle
 * hint chip when the browser blocked autoplay.
 *
 * Can receive `highlighted={true}` when the SoundPromptOverlay is active,
 * giving it an enchanting glowing beacon and higher z-index.
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
  if (!hasTrack || failed) return null

  return (
    <div className={`${styles.wrap} ${highlighted ? styles.highlighted : ''}`}>
      {blocked && !playing && !highlighted && (
        <span className={styles.hint} role="status">
          <Music4 size={14} aria-hidden="true" />
          Tap for music
        </span>
      )}
      <div className={`${styles.pill} ${highlighted ? styles.highlightedPill : ''}`}>
        <button
          type="button"
          className={styles.button}
          onClick={onToggle}
          aria-label={playing ? 'Pause the music' : 'Play the music'}
          aria-pressed={playing}
        >
          {playing ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
        </button>
        <span className={styles.divider} aria-hidden="true" />
        <button
          type="button"
          className={styles.button}
          onClick={onToggleMute}
          aria-label={muted ? 'Unmute the music' : 'Mute the music'}
          aria-pressed={muted}
        >
          {muted ? <VolumeX size={18} aria-hidden="true" /> : <Volume2 size={18} aria-hidden="true" />}
        </button>
      </div>
    </div>
  )
}
