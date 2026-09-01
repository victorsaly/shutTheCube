/**
 * The game's voice, synthesised. This replaces the three mp3 clicks the 2018
 * build shipped: WebAudio starts in under a millisecond where `new Audio()`
 * had decode-and-seek latency, ships zero bytes of samples, and lets the
 * board be musical — every tile plays its own note.
 *
 * The identity is one instrument: a soft marimba (a triangle fundamental with
 * a fast-decaying octave partial) on the A major pentatonic scale, so any
 * order the tiles are played in still sounds deliberate. Faces 1-9 climb the
 * scale; runs arpeggiate it; the win rolls the whole thing.
 *
 * Every entry point is fail-safe: audio is a nicety and must never break a
 * move. Nothing here retains nodes — each voice builds, plays and is
 * garbage-collected, which keeps the graph empty between sounds.
 */

const MUTE_KEY = 'shutTheCube.muted'

let ctx = null
let master = null

const context = () => {
  if (typeof window === 'undefined' || !(window.AudioContext || window.webkitAudioContext)) {
    return null
  }
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)()
    master = ctx.createGain()
    master.gain.value = 0.5
    master.connect(ctx.destination)
  }
  // Calls arrive inside user gestures (clicks, keys), so resume() is allowed.
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  return ctx
}

let muted = (() => {
  try {
    return localStorage.getItem(MUTE_KEY) === '1'
  } catch {
    return false
  }
})()

export const isMuted = () => muted
export const setMuted = (value) => {
  muted = Boolean(value)
  try {
    localStorage.setItem(MUTE_KEY, muted ? '1' : '0')
  } catch {
    // Not persisting the preference is not worth an error.
  }
}

/* A major pentatonic, faces 1-9: two octaves feels like climbing the board. */
const SEMITONES = [0, 2, 4, 7, 9, 12, 14, 16, 19]
const BASE = 220 // A3
const freqOf = (face) => BASE * 2 ** ((SEMITONES[(face - 1) % 9] ?? 0) / 12)

/** One marimba hit. `when` is absolute context time; 0 means now. */
const hit = (freq, { when = 0, vol = 0.22, decay = 0.28 } = {}) => {
  const c = context()
  if (!c || muted) return
  const t = Math.max(when, c.currentTime)

  const gain = c.createGain()
  gain.gain.setValueAtTime(vol, t)
  gain.gain.exponentialRampToValueAtTime(0.001, t + decay)
  gain.connect(master)

  const osc = c.createOscillator()
  osc.type = 'triangle'
  osc.frequency.value = freq
  osc.connect(gain)
  osc.start(t)
  osc.stop(t + decay)

  // The bright octave partial that says "struck", gone in a tenth of a second.
  const partial = c.createGain()
  partial.gain.setValueAtTime(vol * 0.4, t)
  partial.gain.exponentialRampToValueAtTime(0.001, t + 0.09)
  partial.connect(master)
  const po = c.createOscillator()
  po.type = 'sine'
  po.frequency.value = freq * 2
  po.connect(partial)
  po.start(t)
  po.stop(t + 0.09)
}

/** A short burst of filtered noise: one die tumbling against the felt. */
const rattleTick = (when, vol) => {
  const c = context()
  if (!c || muted) return
  const t = Math.max(when, c.currentTime)
  const length = Math.floor(c.sampleRate * 0.03)
  const buffer = c.createBuffer(1, length, c.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / length)

  const src = c.createBufferSource()
  src.buffer = buffer
  const filter = c.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = 1600 + Math.random() * 1800
  filter.Q.value = 1.4
  const gain = c.createGain()
  gain.gain.value = vol
  src.connect(filter)
  filter.connect(gain)
  gain.connect(master)
  src.start(t)
}

const safely = (fn) => {
  try {
    fn()
  } catch {
    // Audio is a nicety; never let it break a move.
  }
}

export const sound = {
  /** A tile played: its own note on the scale. */
  tap(face) {
    safely(() => hit(freqOf(face)))
  },

  /** A selection undone: the note walks back down. */
  undo() {
    safely(() => {
      const c = context()
      if (!c) return
      hit(freqOf(3), { vol: 0.12, decay: 0.14 })
      hit(freqOf(1), { when: c.currentTime + 0.07, vol: 0.12, decay: 0.18 })
    })
  },

  /** Dice hitting the table: a handful of randomised ticks. */
  roll() {
    safely(() => {
      const c = context()
      if (!c) return
      const t = c.currentTime
      for (let i = 0; i < 6; i += 1) {
        rattleTick(t + i * 0.04 + Math.random() * 0.015, 0.1 - i * 0.012)
      }
    })
  },

  /** A run claimed: arpeggiate as many notes as tiles it took. */
  run(size) {
    safely(() => {
      const c = context()
      if (!c) return
      const t = c.currentTime
      const notes = Math.min(size, 5)
      for (let i = 0; i < notes; i += 1) {
        hit(freqOf(i * 2 + 1), { when: t + i * 0.06, vol: 0.16, decay: 0.22 })
      }
    })
  },

  /** The box shut: roll the whole scale and let the top ring. */
  win() {
    safely(() => {
      const c = context()
      if (!c) return
      const t = c.currentTime
      ;[1, 3, 5, 7, 9].forEach((face, i) => {
        hit(freqOf(face), { when: t + i * 0.09, vol: 0.2, decay: 0.3 })
      })
      hit(freqOf(9) * 2, { when: t + 0.5, vol: 0.14, decay: 0.9 })
    })
  },

  /** No move left: two low notes, closing the lid. */
  over() {
    safely(() => {
      const c = context()
      if (!c) return
      hit(freqOf(3) / 2, { vol: 0.16, decay: 0.35 })
      hit(freqOf(1) / 2, { when: c.currentTime + 0.16, vol: 0.16, decay: 0.55 })
    })
  }
}
