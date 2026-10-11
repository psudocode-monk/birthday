/**
 * Tiny helpers for playing audio safely and for optional remote assets.
 * Everything degrades gracefully — a failed asset never breaks the page.
 */

/**
 * Calls audio.play() and swallows the (common) autoplay rejections.
 * @returns {Promise<boolean>} true when playback actually started.
 */
export function safePlay(audio) {
  if (!audio) return Promise.resolve(false)
  try {
    const result = audio.play()
    if (result && typeof result.then === 'function') {
      return result.then(
        () => true,
        () => false,
      )
    }
    return Promise.resolve(true)
  } catch (err) {
    return Promise.resolve(false)
  }
}

/** Pauses audio without ever throwing. */
export function safePause(audio) {
  if (!audio) return
  try {
    audio.pause()
  } catch (err) {
    /* ignore */
  }
}

/**
 * Preloads an optional remote image (e.g. a configured keepsake photo).
 * Resolves false on any failure so callers can simply skip it.
 */
export function preloadImage(url) {
  if (!url || typeof window === 'undefined') return Promise.resolve(false)
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = url
  })
}

/** Standard handler for <img> error events: hide the broken image quietly. */
export function hideBrokenImage(event) {
  const el = event && event.currentTarget
  if (el) el.style.display = 'none'
}
