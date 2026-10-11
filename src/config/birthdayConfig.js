/**
 * ─────────────────────────────────────────────────────────────
 *  EVERYTHING PERSONAL LIVES IN THIS FILE.
 * ─────────────────────────────────────────────────────────────
 *  Edit the values below to personalize the whole experience.
 *  You never need to touch a component to change words,
 *  colors, wishes, memories, the letter, or the music.
 *
 *  Empty strings are safe — the site never renders "undefined".
 */

export const birthdayConfig = {
  /* ── People ─────────────────────────────────────────────── */
  // e.g. 'Amara'. Leave '' and the copy gracefully skips the name.
  recipientName: '',
  // e.g. 'Your favourite person'. Used to sign the final letter.
  senderName: '',

  /* ── Stage 1 · The Secret Invitation ────────────────────── */
  invitation: {
    greeting: 'Hey, birthday girl...',
    lines: [
      'I made a little universe just for you.',
      'It is small, and warm, and full of quiet light.',
    ],
    prompt: "Ready to see what's inside?",
    button: 'Open your little surprise ✨',
    continueButton: 'Continue where we left off ✨',
    envelopeNote: 'sealed with way too much love',
  },

  /* ── Stage 2 · The Birthday Wish Factory ────────────────── */
  wishes: {
    title: 'The Wish Factory',
    subtitle: 'Three little stars are waiting to be caught.',
    instruction: 'Tap each glowing star to collect your birthday wishes.',
    collectedLabel: (n) => `${n} of 3 wishes gathered`,
    completeMessage: 'All three wishes are yours now. 🌙',
    continueButton: 'There is more to see',
    messages: [
      'May your smile find a thousand new reasons to shine.',
      'May this year bring you adventures that make your heart happy.',
      'And may you always remember how wonderfully special you are.',
    ],
  },

  /* ── Stage 3 · Our Little Memory Garden ─────────────────── */
  memory: {
    title: 'Our Little Memory Garden',
    subtitle: 'Five night-blooming flowers, five little truths.',
    instruction: 'Touch a flower to read what it is hiding.',
    allFoundMessage: 'Every little moment has a place in my heart. 💗',
    continueButton: 'One last thing to play',
    cardTitle: 'A little note for you',
    messages: [
      'One of my favorite things is the way you make ordinary moments feel special.',
      'You have a way of making even the smallest things worth remembering.',
      'If happiness had a familiar feeling, I think it would feel a little like being with you.',
      'Some moments are small when they happen and precious when we look back.',
      "There's always another reason to appreciate you.",
    ],
  },

  /* ── Stage 4 · The Cute Birthday Challenge ──────────────── */
  game: {
    title: 'Catch the Falling Stars',
    instruction:
      'Twelve seconds. Stars fall from the little sky — tap them before they drift away. No pressure, only sparkle.',
    startButton: 'Start the stargazing',
    scoreLabel: 'Stars caught',
    timeLabel: 'seconds left',
    pauseLabel: 'Paused — tap to keep going',
    replayButton: 'One more round?',
    continueButton: 'See your birthday surprise 🎂✨',
    durationSeconds: 12,
    results: [
      {
        min: 9,
        title: 'Achievement unlocked',
        message: 'Official Birthday Princess 👑 The whole sky was yours up there.',
      },
      {
        min: 4,
        title: 'Beautifully done',
        message:
          'You gathered a handful of stars — and honestly, you were the brightest one in the sky. ✨',
      },
      {
        min: 0,
        title: 'Gentle stargazer',
        message:
          "The stars slipped by, but that's alright — you were always the brightest one here anyway. 💗",
      },
    ],
  },

  /* ── Stage 5 · The Grand Birthday Reveal ────────────────── */
  final: {
    eyebrow: 'and now, the whole point of tonight',
    headline: 'Happy Birthday, My Favorite Person 💗',
    description:
      'Today is all about celebrating you — your beautiful heart, your smile, your little quirks, and all the things that make you uniquely you.',
    closing:
      'I hope this new chapter brings you the kind of happiness that stays, the kind of love that feels safe, and a thousand little reasons to smile.',
    letterButton: 'One last little surprise 💌',
    letterButtonOpen: 'Fold the letter away 💌',
    letterTitle: 'A letter, just for you',
    // Multiple paragraphs are fine — line breaks are preserved.
    letter: `I am not great with big speeches, so I kept this one simple.

You make soft things out of ordinary days. You make laughter out of nothing. Somehow, being around you makes the world feel a little kinder, a little lighter, a little more worth paying attention to.

So here is my wish for you today: may you be as loved as you make everyone else feel, may your year be gentle with you, and may you never forget how deeply cherished you are — by me, especially.

Happy birthday, my love. This little universe is yours forever.`,
    signOff: 'Yours, always',
    restartButton: 'Live it again from the start ✨',
  },

  /* ── Music ──────────────────────────────────────────────── */
  music: {
    // Soothing ambient lofi music loop (served locally by Vite from public/)
    url: './birthday-music.wav',
    title: 'Peaceful Birthday Ambient Lullaby',
    artist: 'Antigravity Studio',
    source: 'Local asset',
    license: 'Personal use',
    sfx: true,
  },

  /* ── Optional visual customization ──────────────────────── */
  // These become CSS custom properties on the app root.
  theme: {
    midnight: '#07061a',
    plum: '#241a41',
    champagne: '#f2d8a7',
    blush: '#f3b6c7',
    rose: '#d98aa0',
    cream: '#fdf6ec',
  },
}

/** Graceful name helpers — never produce "undefined". */
export function recipientName() {
  return typeof birthdayConfig.recipientName === 'string'
    ? birthdayConfig.recipientName.trim()
    : ''
}

export function senderName() {
  return typeof birthdayConfig.senderName === 'string'
    ? birthdayConfig.senderName.trim()
    : ''
}

/** e.g. 'Happy Birthday, Amara 💗' or the configured headline. */
export function finalHeadline() {
  const name = recipientName()
  if (!name) return birthdayConfig.final.headline
  return `Happy Birthday, ${name} 💗`
}

/** Returns a safe result message for any score. */
export function gameResultFor(score) {
  const list = birthdayConfig.game.results
  const match = list.find((r) => score >= r.min) || list[list.length - 1]
  return match || { title: 'Well played', message: 'You shone up there. ✨' }
}
