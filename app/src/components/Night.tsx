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

/** Seven stars each, drawn in order. One star is earned for every day anything is finished. */
const CONSTELLATIONS: { name: string; at: [number, number]; closed: boolean; points: [number, number][] }[] = [
  { name: 'The Lantern', at: [20, 17], closed: true, points: [[0, -7], [-4, -3], [-5, 3], [-2, 6], [2, 6], [5, 3], [4, -3]] },
  { name: 'The Key', at: [52, 11], closed: false, points: [[-9, -1], [-6, -5], [-2, -2], [-5, 2], [2, 0], [6, 3], [9, -1]] },
  { name: 'The Kettle', at: [82, 18], closed: false, points: [[-6, -4], [-8, 2], [-3, 6], [4, 6], [8, 1], [5, -4], [10, -6]] },
  { name: 'The Leaf', at: [35, 37], closed: false, points: [[0, 7], [-6, 3], [-5, -2], [0, -7], [5, -2], [6, 3], [0, 1]] },
  { name: 'The Cup', at: [67, 36], closed: false, points: [[-7, -4], [-5, 4], [0, 6], [5, 4], [7, -4], [10, -1], [7, 2]] },
]
const STARS_EACH = 7

const STAR_PATH = 'M0 -1.5 L0.36 -0.36 L1.5 0 L0.36 0.36 L0 1.5 L-0.36 0.36 L-1.5 0 L-0.36 -0.36 Z'

/**
 * The sky filling back in. Every day anything is finished adds one bright star, joined to the last,
 * and seven of them make a constellation. The next few stars still to come show as faint points.
 */
export function Constellations({ days }: { days: number }) {
  return (
    <svg className="constellations" viewBox="0 0 100 50" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      {CONSTELLATIONS.map((shape, k) => {
        const earned = Math.max(0, Math.min(days - k * STARS_EACH, STARS_EACH))
        const started = earned > 0 || days >= k * STARS_EACH
        if (!started) return null
        const place = ([x, y]: [number, number]) => [shape.at[0] + x, shape.at[1] + y] as const
        const lit = shape.points.slice(0, earned).map(place)
        const segments = lit.slice(1).map((to, i) => [lit[i], to] as const)
        if (shape.closed && earned === STARS_EACH) segments.push([lit[lit.length - 1], lit[0]])
        return (
          <g key={shape.name}>
            {segments.map(([from, to], i) => (
              <line key={i} x1={from[0]} y1={from[1]} x2={to[0]} y2={to[1]} pathLength={1} />
            ))}
            {shape.points.slice(earned).map((point, i) => {
              const [x, y] = place(point)
              return <circle key={i} cx={x} cy={y} r={0.28} />
            })}
            {lit.map(([x, y], i) => (
              <path key={i} d={STAR_PATH} transform={`translate(${x} ${y})`} style={{ animationDelay: `${-(i * 0.9 + k)}s` }} />
            ))}
          </g>
        )
      })}
    </svg>
  )
}

/**
 * A beacon tower far off beyond the trees. It stands dark until the keeper who guards it is freed,
 * which belongs to a later part of the story.
 */
export function Beacon({ lit = false }: { lit?: boolean }) {
  return (
    <svg className={`beacon ${lit ? 'lit' : ''}`} viewBox="0 0 20 44" aria-hidden="true">
      <path className="tower" d="M7 44 L8.2 16 L11.8 16 L13 44 Z" />
      <path className="tower" d="M6.4 16 L13.6 16 L13.6 14 L6.4 14 Z" />
      <path className="lamp" d="M7.6 14 L7.6 9 L12.4 9 L12.4 14 Z" />
      <path className="tower" d="M6.6 9 L10 4.5 L13.4 9 Z" />
      <path className="tower" d="M10 4.5 L10 1.5" />
    </svg>
  )
}
