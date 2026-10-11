import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'

import AnimatedBackground from './components/AnimatedBackground.jsx'
import ProgressIndicator from './components/ProgressIndicator.jsx'
import AudioControls from './components/AudioControls.jsx'
import TransitionWrapper from './components/TransitionWrapper.jsx'

import InvitationStage from './stages/InvitationStage.jsx'
import WishesStage from './stages/WishesStage.jsx'
import MemoryGardenStage from './stages/MemoryGardenStage.jsx'
import BirthdayGameStage from './stages/BirthdayGameStage.jsx'
import FinalRevealStage from './stages/FinalRevealStage.jsx'

import SoundPromptOverlay from './components/SoundPromptOverlay.jsx'
import { birthdayConfig } from './config/birthdayConfig.js'
import { useBackgroundMusic } from './hooks/useBackgroundMusic.js'
import useReducedMotion from './hooks/useReducedMotion.js'
import { clearProgress, emptyProgress, loadProgress, saveProgress } from './utils/progress.js'
import { sfx } from './utils/sfx.js'
import styles from './App.module.css'

export default function App() {
  const reduced = useReducedMotion()
  const [progress, setProgress] = useState(() => loadProgress())
  const [showSoundPrompt, setShowSoundPrompt] = useState(true)

  const music = useBackgroundMusic(birthdayConfig.music.url)
  const sfxEnabled = Boolean(birthdayConfig.music.sfx) && !music.muted

  useEffect(() => {
    sfx.setEnabled(sfxEnabled)
  }, [sfxEnabled])

  useEffect(() => {
    saveProgress(progress)
  }, [progress])

  // Apply the optional theme overrides from the config.
  useEffect(() => {
    const theme = birthdayConfig.theme
    if (!theme) return
    const root = document.documentElement
    const map = {
      '--theme-midnight': theme.midnight,
      '--theme-plum': theme.plum,
      '--theme-champagne': theme.champagne,
      '--theme-blush': theme.blush,
      '--theme-rose': theme.rose,
      '--theme-cream': theme.cream,
    }
    Object.entries(map).forEach(([key, value]) => {
      if (value) root.style.setProperty(key, value)
    })
    if (theme.midnight) root.setAttribute('data-theme', 'custom')
  }, [])

  /* ── Journey controls ─────────────────────────────────────── */

  const goToStage = useCallback((n) => {
    setProgress((p) => ({
      ...p,
      stage: n,
      maxStage: Math.max(p.maxStage, n),
    }))
  }, [])

  const beginExperience = useCallback(() => {
    music.begin() // first user gesture — the correct place to start audio
    sfx.open()
  }, [music])

  const collectWish = useCallback((index) => {
    setProgress((p) => {
      if (p.wishes[index]) return p
      const wishes = p.wishes.slice()
      wishes[index] = true
      return { ...p, wishes }
    })
  }, [])

  const discoverMemory = useCallback((index) => {
    setProgress((p) => {
      if (p.memories[index]) return p
      const memories = p.memories.slice()
      memories[index] = true
      return { ...p, memories }
    })
  }, [])

  const finishGame = useCallback((score) => {
    setProgress((p) => ({
      ...p,
      gameCompleted: true,
      gameScore: Math.max(p.gameScore, score),
    }))
  }, [])

  const toggleLetter = useCallback(() => {
    setProgress((p) => ({ ...p, letterRevealed: !p.letterRevealed }))
  }, [])

  const restart = useCallback(() => {
    clearProgress()
    setProgress({ ...emptyProgress })
    // Music keeps playing gently — the journey simply begins again.
  }, [])

  /**
   * Goes back one stage and resets that stage's data so the task begins fresh.
   * Stage 2 → back → wishes reset, Stage 3 → memories reset, etc.
   */
  const goBack = useCallback(() => {
    setProgress((p) => {
      const prevStage = Math.max(1, p.stage - 1)
      if (prevStage === p.stage) return p
      const reset = {}
      if (p.stage === 2) reset.wishes = [false, false, false]
      if (p.stage === 3) reset.memories = [false, false, false, false, false]
      if (p.stage === 4) { reset.gameCompleted = false; reset.gameScore = 0 }
      if (p.stage === 5) { reset.letterRevealed = false; reset.gameCompleted = false; reset.gameScore = 0 }
      return { ...p, ...reset, stage: prevStage, maxStage: prevStage }
    })
  }, [])

  const handleTurnOnSound = useCallback(() => {
    music.begin()
    sfx.sparkle()
    setShowSoundPrompt(false)
  }, [music])

  const handleDismissSound = useCallback(() => {
    setShowSoundPrompt(false)
  }, [])

  const handleMusicToggle = useCallback(() => {
    if (showSoundPrompt) setShowSoundPrompt(false)
    music.toggle()
  }, [showSoundPrompt, music])

  /* ── Render ───────────────────────────────────────────────── */

  const stage = progress.stage

  const stageNode = useMemo(() => {
    switch (stage) {
      case 1:
        return (
          <InvitationStage
            config={birthdayConfig}
            onBegin={beginExperience}
            onAdvance={() => goToStage(2)}
            revisited={progress.maxStage > 1}
          />
        )
      case 2:
        return (
          <WishesStage
            config={birthdayConfig}
            collected={progress.wishes}
            onCollect={collectWish}
            onContinue={() => goToStage(3)}
          />
        )
      case 3:
        return (
          <MemoryGardenStage
            config={birthdayConfig}
            found={progress.memories}
            onDiscover={discoverMemory}
            onContinue={() => goToStage(4)}
          />
        )
      case 4:
        return (
          <BirthdayGameStage
            config={birthdayConfig}
            completed={progress.gameCompleted}
            bestScore={progress.gameScore}
            onFinish={finishGame}
            onContinue={() => goToStage(5)}
          />
        )
      case 5:
        return (
          <FinalRevealStage
            config={birthdayConfig}
            reduced={reduced}
            letterOpen={progress.letterRevealed}
            onToggleLetter={toggleLetter}
            onRestart={restart}
          />
        )
      default:
        return null
    }
  }, [
    stage,
    progress.maxStage,
    progress.wishes,
    progress.memories,
    progress.gameCompleted,
    progress.gameScore,
    progress.letterRevealed,
    beginExperience,
    goToStage,
    collectWish,
    discoverMemory,
    finishGame,
    toggleLetter,
    restart,
    reduced,
  ])

  return (
    <div className={styles.app}>
      <AnimatedBackground stage={stage} />

      <div className={styles.content}>
        <ProgressIndicator
          stage={stage}
          maxStage={progress.maxStage}
          onJump={goToStage}
          onBack={goBack}
        />

        <main className={styles.main} id="main">
          <AnimatePresence mode="wait" initial={false}>
            <TransitionWrapper key={stage} reduced={reduced}>
              {stageNode}
            </TransitionWrapper>
          </AnimatePresence>
        </main>
      </div>

      <AudioControls
        hasTrack={music.hasTrack}
        playing={music.playing}
        muted={music.muted}
        blocked={music.blocked}
        failed={music.failed}
        onToggle={handleMusicToggle}
        onToggleMute={music.toggleMute}
        highlighted={showSoundPrompt}
      />

      <AnimatePresence>
        {showSoundPrompt && (
          <SoundPromptOverlay
            onTurnOn={handleTurnOnSound}
            onDismiss={handleDismissSound}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
