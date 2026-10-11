/**
 * Soft, synthesised sound effects — no audio files, no licensing worries.
 * Every effect is short, quiet, and generated with the Web Audio API.
 * Respects a global enable flag (tied to the mute control).
 */

let context = null
let enabled = true

function getCtx() {
  if (typeof window === 'undefined') return null
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return null
    if (!context) context = new Ctx()
    if (context.state === 'suspended') context.resume().catch(() => {})
    return context
  } catch (err) {
    return null
  }
}

/** Plays one soft, bell-like tone. */
function tone({ freq = 660, dur = 0.5, type = 'sine', gain = 0.09, glide = 0 }) {
  const ctx = getCtx()
  if (!ctx || !enabled) return
  try {
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const amp = ctx.createGain()

    osc.type = type
    osc.frequency.setValueAtTime(freq, now)
    if (glide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq + glide), now + dur)

    amp.gain.setValueAtTime(0.0001, now)
    amp.gain.exponentialRampToValueAtTime(gain, now + 0.02)
    amp.gain.exponentialRampToValueAtTime(0.0001, now + dur)

    osc.connect(amp)
    amp.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + dur + 0.05)
    osc.onended = () => {
      try {
        osc.disconnect()
        amp.disconnect()
      } catch (err) {
        /* ignore */
      }
    }
  } catch (err) {
    /* sound is a garnish, never a requirement */
  }
}

export const sfx = {
  setEnabled(value) {
    enabled = Boolean(value)
  },
  /** Envelope / invitation opening. */
  open() {
    tone({ freq: 392, dur: 0.55, gain: 0.07 })
    window.setTimeout(() => tone({ freq: 587, dur: 0.6, gain: 0.06 }), 140)
    window.setTimeout(() => tone({ freq: 784, dur: 0.7, gain: 0.05 }), 300)
  },
  /** Discovering a wish or a memory. */
  chime() {
    tone({ freq: 880, dur: 0.5, gain: 0.06 })
    window.setTimeout(() => tone({ freq: 1174, dur: 0.6, gain: 0.045 }, 120), 120)
  },
  /** Catching a star in the mini-game. */
  pop() {
    tone({ freq: 1046, dur: 0.18, type: 'triangle', gain: 0.07, glide: 220 })
  },
  /** Revealing the final letter. */
  sparkle() {
    const notes = [1046, 1318, 1568]
    notes.forEach((freq, i) => {
      window.setTimeout(() => tone({ freq, dur: 0.7, gain: 0.05 }), i * 130)
    })
  },
}
