/**
 * Persistent journey progress.
 *
 * Stored in sessionStorage (never localStorage) so a refresh mid-way
 * keeps her place, and nothing lingers on the device afterwards.
 * Storage is entirely optional: if it is blocked or full, the app
 * simply starts from the beginning.
 */

const KEY = 'little-universe-journey-v1'

export const emptyProgress = {
  stage: 1,
  maxStage: 1,
  wishes: [false, false, false],
  memories: [false, false, false, false, false],
  gameCompleted: false,
  gameScore: 0,
  letterRevealed: false,
}

function sanitize(raw) {
  if (!raw || typeof raw !== 'object') return null

  const boolArray = (value, length, fallback) =>
    Array.isArray(value)
      ? Array.from({ length }, (_, i) => Boolean(value[i]))
      : fallback

  const stage = Number.isInteger(raw.stage) ? Math.min(Math.max(raw.stage, 1), 5) : 1
  const maxStage = Number.isInteger(raw.maxStage)
    ? Math.min(Math.max(raw.maxStage, stage), 5)
    : stage

  return {
    stage,
    maxStage,
    wishes: boolArray(raw.wishes, 3, emptyProgress.wishes),
    memories: boolArray(raw.memories, 5, emptyProgress.memories),
    gameCompleted: Boolean(raw.gameCompleted),
    gameScore: Number.isFinite(raw.gameScore) ? Math.max(0, Math.floor(raw.gameScore)) : 0,
    letterRevealed: Boolean(raw.letterRevealed),
  }
}

export function loadProgress() {
  try {
    const stored = window.sessionStorage.getItem(KEY)
    if (!stored) return { ...emptyProgress }
    return sanitize(JSON.parse(stored)) || { ...emptyProgress }
  } catch (err) {
    return { ...emptyProgress }
  }
}

export function saveProgress(progress) {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(progress))
  } catch (err) {
    /* storage unavailable — the experience still works */
  }
}

export function clearProgress() {
  try {
    window.sessionStorage.removeItem(KEY)
  } catch (err) {
    /* ignore */
  }
}
