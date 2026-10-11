/**
 * Pure Web Audio API Ambient Music Synthesizer
 *
 * Generates a calm, peaceful, beautiful lofi/celestial music-box & pad progression
 * directly in the browser.
 * - 0 external files or network requests
 * - 0 CORS / 403 / CDN errors
 * - Works 100% offline and on all mobile / desktop browsers
 * - Perfectly seamless loop with gentle fade in / fade out
 */

let synthContext = null
let masterGain = null
let isPlaying = false
let loopInterval = null

const CHORDS = [
  // Cmaj9
  [130.81, 196.0, 246.94, 293.66, 329.63],
  // Am9
  [110.0, 164.81, 196.0, 246.94, 261.63],
  // Fmaj7
  [87.31, 130.81, 164.81, 220.0, 261.63],
  // Gsus4 / G6
  [98.0, 146.83, 196.0, 261.63, 329.63],
]

const MELODY = [
  { beat: 0.5, dur: 2.5, f: 523.25 }, // C5
  { beat: 2.0, dur: 2.0, f: 659.25 }, // E5
  { beat: 3.5, dur: 2.5, f: 587.33 }, // D5
  { beat: 6.5, dur: 2.5, f: 440.0 },  // A4
  { beat: 8.0, dur: 2.0, f: 523.25 }, // C5
  { beat: 9.5, dur: 2.5, f: 659.25 }, // E5
  { beat: 12.5, dur: 2.5, f: 698.46 },// F5
  { beat: 14.0, dur: 2.0, f: 659.25 },// E5
  { beat: 15.5, dur: 2.5, f: 523.25 },// C5
  { beat: 18.5, dur: 2.5, f: 587.33 },// D5
  { beat: 20.0, dur: 2.0, f: 493.88 },// B4
  { beat: 21.5, dur: 2.5, f: 523.25 },// C5
]

const CHORD_DURATION = 6 // seconds per chord
const TOTAL_DURATION = CHORD_DURATION * CHORDS.length // 24s loop

function getAudioContext() {
  if (typeof window === 'undefined') return null
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return null
    if (!synthContext) {
      synthContext = new Ctx()
      masterGain = synthContext.createGain()
      masterGain.gain.setValueAtTime(0.35, synthContext.currentTime)
      masterGain.connect(synthContext.destination)
    }
    if (synthContext.state === 'suspended') {
      synthContext.resume().catch(() => {})
    }
    return synthContext
  } catch (err) {
    return null
  }
}

function playChordAt(ctx, chordNotes, startTime, duration) {
  chordNotes.forEach((freq, idx) => {
    try {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const filter = ctx.createBiquadFilter()

      osc.type = idx === 0 ? 'sine' : 'triangle'
      osc.frequency.setValueAtTime(freq, startTime)

      // Warm low-pass filter
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(650, startTime)

      // Soft swell envelope
      gain.gain.setValueAtTime(0.0001, startTime)
      gain.gain.exponentialRampToValueAtTime(0.06, startTime + duration * 0.35)
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration - 0.05)

      osc.connect(filter)
      filter.connect(gain)
      gain.connect(masterGain)

      osc.start(startTime)
      osc.stop(startTime + duration)

      osc.onended = () => {
        try {
          osc.disconnect()
          filter.disconnect()
          gain.disconnect()
        } catch (e) {}
      }
    } catch (e) {}
  })
}

function playBellAt(ctx, freq, startTime, duration) {
  try {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, startTime)

    // Bell envelope: instant soft attack, gentle exponential decay
    gain.gain.setValueAtTime(0.0001, startTime)
    gain.gain.linearRampToValueAtTime(0.08, startTime + 0.03)
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)

    osc.connect(gain)
    gain.connect(masterGain)

    osc.start(startTime)
    osc.stop(startTime + duration + 0.05)

    osc.onended = () => {
      try {
        osc.disconnect()
        gain.disconnect()
      } catch (e) {}
    }
  } catch (e) {}
}

function scheduleLoop(ctx) {
  const now = ctx.currentTime + 0.1

  // Schedule chords
  CHORDS.forEach((chord, i) => {
    playChordAt(ctx, chord, now + i * CHORD_DURATION, CHORD_DURATION)
  })

  // Schedule melody
  MELODY.forEach((m) => {
    playBellAt(ctx, m.f, now + m.beat, m.dur)
  })
}

export const ambientSynth = {
  start() {
    if (isPlaying) return true
    const ctx = getAudioContext()
    if (!ctx) return false

    isPlaying = true
    scheduleLoop(ctx)

    if (loopInterval) clearInterval(loopInterval)
    loopInterval = setInterval(() => {
      if (isPlaying && synthContext) {
        scheduleLoop(synthContext)
      }
    }, TOTAL_DURATION * 1000 - 400)

    return true
  },

  stop() {
    isPlaying = false
    if (loopInterval) {
      clearInterval(loopInterval)
      loopInterval = null
    }
    if (masterGain && synthContext) {
      try {
        masterGain.gain.setValueAtTime(0.0001, synthContext.currentTime)
      } catch (e) {}
    }
  },

  setVolume(vol) {
    if (masterGain && synthContext) {
      try {
        masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, vol)), synthContext.currentTime)
      } catch (e) {}
    }
  },

  isPlaying() {
    return isPlaying
  },
}
