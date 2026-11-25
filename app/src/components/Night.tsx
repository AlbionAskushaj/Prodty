import type { CSSProperties } from 'react'
import art from '../data/art.json'

/** A repeatable stand-in for randomness, so the sky looks the same every time the app opens. */
function seeded(index: number, salt: number): number {
  const x = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453
  return x - Math.floor(x)
}

/** The stars: one handful to begin with, and more for every day anything was finished. */
export function Stars({ count }: { count: number }) {
  return (
    <div className="stars" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => {
        const size = 5 + seeded(i, 3) * 7
        const style: CSSProperties = {
          left: `${4 + seeded(i, 1) * 92}%`,
          top: `${3 + seeded(i, 2) * 92}%`,
          width: size,
          height: size,
          animationDuration: `${2.6 + seeded(i, 4) * 4}s`,
          animationDelay: `${-seeded(i, 5) * 6}s`,
        }
        return <i key={i} style={style} />
      })}
    </div>
  )
}

/** Fireflies wandering in the dark. They sit behind the light, so they only show beyond its edge. */
export function Fireflies() {
  return (
    <div className="fireflies" aria-hidden="true">
      {Array.from({ length: 9 }, (_, i) => (
        <i
          key={i}
          style={{
            left: `${6 + seeded(i, 11) * 88}%`,
            top: `${30 + seeded(i, 12) * 62}%`,
            animationDuration: `${7 + seeded(i, 13) * 8}s, ${1.8 + seeded(i, 14) * 2.4}s`,
            animationDelay: `${-seeded(i, 15) * 12}s, ${-seeded(i, 16) * 3}s`,
          }}
        />
      ))}
    </div>
  )
}

const FLAMES = art.flames

interface FlameProps {
  /** Where the base of the flame sits, as a share of the parent's width and height. */
  x: number
  y: number
  /** Height as a share of the parent's height. */
  height: number
  className?: string
}

/** A living flame: three drawn frames taking turns, with a slow sway over the top. */
export function Flame({ x, y, height, className = '' }: FlameProps) {
  return (
    <div className={`flame ${className}`} style={{ left: `${x * 100}%`, top: `${(y - height) * 100}%`, height: `${height * 100}%` }}>
      {FLAMES.map((frame, i) => (
        <img
          key={i}
          src={`art/flame-${i}.webp`}
          alt=""
          draggable={false}
          style={{ aspectRatio: `${frame.w} / ${frame.h}`, translate: `${-frame.baseX * 100}% 0`, animationDelay: `${-i * 0.26}s` }}
        />
      ))}
    </div>
  )
}

/** Sparks lifting off a fire and winking out. */
export function Sparks({ x, y, count = 7 }: { x: number; y: number; count?: number }) {
  return (
    <div className="sparks" style={{ left: `${x * 100}%`, top: `${y * 100}%` }} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <i
          key={i}
          style={
            {
              '--drift': (seeded(i, 21) - 0.5) * 2,
              animationDuration: `${2.4 + seeded(i, 22) * 2.6}s`,
              animationDelay: `${-seeded(i, 23) * 5}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}
