/** Sounds made in code (his voice blips, the bloom chime, the swell) and the three looping recordings. */

let context: AudioContext | null = null
let enabled = true

function audio(): AudioContext | null {
  if (!enabled) return null
  if (!context) {
    try {
      context = new AudioContext()
    } catch {
      return null
    }
  }
  if (context.state === 'suspended') void context.resume()
  return context
}

function tone(frequency: number, seconds: number, volume: number, type: OscillatorType = 'triangle') {
  const ctx = audio()
  if (!ctx) return
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()
  oscillator.type = type
  oscillator.frequency.value = frequency
  gain.gain.setValueAtTime(volume, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + seconds)
  oscillator.connect(gain).connect(ctx.destination)
  oscillator.start()
  oscillator.stop(ctx.currentTime + seconds)
}

/** One letter of his speech. */
export function blip() {
  tone(196 + Math.random() * 46, 0.07, 0.05)
}

/** A leaf blooming. */
export function chime() {
  ;[523, 659, 784].forEach((frequency, i) => setTimeout(() => tone(frequency, 0.5, 0.06, 'sine'), i * 90))
}

/** The ember landing in the lantern. */
export function swell() {
  const ctx = audio()
  if (!ctx) return
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()
  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(110, ctx.currentTime)
  oscillator.frequency.exponentialRampToValueAtTime(196, ctx.currentTime + 0.5)
  gain.gain.setValueAtTime(0.0001, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.09, ctx.currentTime + 0.15)
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.9)
  oscillator.connect(gain).connect(ctx.destination)
  oscillator.start()
  oscillator.stop(ctx.currentTime + 0.95)
}

const LOOPS = [
  { src: 'audio/forest-theme.mp3', volume: 0.3 },
  { src: 'audio/campfire.mp3', volume: 0.2 },
  { src: 'audio/crickets.mp3', volume: 0.1 },
]

let loops: HTMLAudioElement[] | null = null

export function setSoundEnabled(on: boolean) {
  enabled = on
  if (on) startMusic()
  else loops?.forEach((loop) => loop.pause())
}

/** Browsers only allow sound after a tap, so this is called on every one and does nothing once playing. */
export function startMusic() {
  if (!enabled) return
  loops ||= LOOPS.map(({ src, volume }) => {
    const loop = new Audio(src)
    loop.loop = true
    loop.volume = volume
    return loop
  })
  for (const loop of loops) if (loop.paused) loop.play().catch(() => {})
}
