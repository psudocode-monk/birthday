import { useCallback, useEffect, useRef, useState } from 'react'
import { safePause, safePlay } from '../utils/assetFallbacks.js'
import { ambientSynth } from '../utils/ambientSynth.js'

const TARGET_VOLUME = 0.5
const FADE_MS = 1000

/**
 * Universal background-music engine.
 *
 * - Automatically attempts playback on mount.
 * - Adds a one-time global user-interaction listener so the very first tap/click anywhere
 *   seamlessly starts the music if autoplay was initially held back by the browser.
 * - Uses local HTML5 Audio (/birthday-music.wav) with seamless fallback to pure Web Audio API ambient synth.
 * - Persistent across all stage transitions.
 * - Includes volume fading, play/pause, and mute controls.
 */
export function useBackgroundMusic(src = './birthday-music.wav') {
  const audioRef = useRef(null)
  const fadeRef = useRef(null)
  const usingSynthRef = useRef(false)
  const startedRef = useRef(false)

  const [state, setState] = useState({
    playing: false,
    muted: false,
    blocked: false,
    failed: false,
    hasTrack: true,
  })

  const fadeTo = useCallback((audio, target, onDone) => {
    if (fadeRef.current) {
      window.clearInterval(fadeRef.current)
      fadeRef.current = null
    }
    if (!audio) {
      if (usingSynthRef.current) ambientSynth.setVolume(target)
      if (onDone) onDone()
      return
    }
    const start = audio.volume
    const steps = 15
    const stepTime = FADE_MS / steps
    let i = 0
    fadeRef.current = window.setInterval(() => {
      i += 1
      const t = i / steps
      const currentVol = Math.min(1, Math.max(0, start + (target - start) * t))
      audio.volume = currentVol
      if (usingSynthRef.current) ambientSynth.setVolume(currentVol)
      if (i >= steps) {
        window.clearInterval(fadeRef.current)
        fadeRef.current = null
        audio.volume = target
        if (usingSynthRef.current) ambientSynth.setVolume(target)
        if (onDone) onDone()
      }
    }, stepTime)
  }, [])

  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      try {
        const audio = new Audio()
        audio.src = src || './birthday-music.wav'
        audio.loop = true
        audio.preload = 'auto'
        audio.volume = TARGET_VOLUME

        audio.addEventListener('error', () => {
          // If HTML5 audio source errors, switch seamlessly to Web Audio ambient synth
          usingSynthRef.current = true
          ambientSynth.start()
          ambientSynth.setVolume(state.muted ? 0 : TARGET_VOLUME)
          setState((s) => ({ ...s, playing: true, failed: false }))
        })

        audio.addEventListener('pause', () => {
          if (!usingSynthRef.current) {
            setState((s) => (s.playing ? { ...s, playing: false } : s))
          }
        })

        audio.addEventListener('play', () => {
          setState((s) => ({ ...s, playing: true, blocked: false }))
        })

        audioRef.current = audio
      } catch (err) {
        usingSynthRef.current = true
        return null
      }
    }
    return audioRef.current
  }, [src, state.muted])

  /** Starts music playback (tries HTML5 Audio, falls back to ambient synth) */
  const begin = useCallback(async () => {
    const audio = getAudio()
    let started = false

    if (audio && !usingSynthRef.current) {
      audio.volume = state.muted ? 0 : TARGET_VOLUME
      started = await safePlay(audio)
    }

    if (!started) {
      // Start pure Web Audio API ambient music synth
      const synthOk = ambientSynth.start()
      if (synthOk) {
        usingSynthRef.current = true
        ambientSynth.setVolume(state.muted ? 0 : TARGET_VOLUME)
        started = true
      }
    }

    if (started) {
      startedRef.current = true
      setState((s) => ({ ...s, playing: true, blocked: false }))
    } else {
      setState((s) => ({ ...s, blocked: true, playing: false }))
    }
    return started
  }, [getAudio, state.muted])

  const pause = useCallback(() => {
    const audio = audioRef.current
    if (usingSynthRef.current) {
      ambientSynth.stop()
    } else if (audio) {
      safePause(audio)
    }
    setState((s) => ({ ...s, playing: false }))
  }, [])

  const resume = useCallback(async () => {
    if (usingSynthRef.current) {
      ambientSynth.start()
      ambientSynth.setVolume(state.muted ? 0 : TARGET_VOLUME)
      setState((s) => ({ ...s, playing: true, blocked: false }))
      return
    }
    const audio = getAudio()
    if (!audio) return
    audio.volume = state.muted ? 0 : TARGET_VOLUME
    const ok = await safePlay(audio)
    if (ok) {
      setState((s) => ({ ...s, playing: true, blocked: false }))
    } else {
      ambientSynth.start()
      usingSynthRef.current = true
      setState((s) => ({ ...s, playing: true, blocked: false }))
    }
  }, [getAudio, state.muted])

  const toggle = useCallback(() => {
    if (state.playing) pause()
    else resume()
  }, [state.playing, pause, resume])

  const toggleMute = useCallback(() => {
    setState((s) => {
      const nextMuted = !s.muted
      const nextVol = nextMuted ? 0 : TARGET_VOLUME
      if (audioRef.current) audioRef.current.volume = nextVol
      if (usingSynthRef.current) ambientSynth.setVolume(nextVol)
      return { ...s, muted: nextMuted }
    })
  }, [])

  // Music stays off by default on start/refresh until user turns it on

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (fadeRef.current) window.clearInterval(fadeRef.current)
      ambientSynth.stop()
      const audio = audioRef.current
      if (audio) {
        try {
          audio.pause()
          audio.src = ''
        } catch (err) {}
        audioRef.current = null
      }
    }
  }, [])

  return {
    ...state,
    begin,
    toggle,
    toggleMute,
  }
}
