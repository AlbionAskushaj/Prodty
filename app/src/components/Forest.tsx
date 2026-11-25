import { useEffect, useState } from 'react'
import art from '../data/art.json'
import { doneCount, lingeringCount, visibleTasks } from '../state/store'
import type { AppState } from '../state/types'
import { Flame, Sparks } from './Night'
import { ANCHORS, SCENE, TASK_ANCHORS, TreeItem, TreeSprite, standing } from './TreeSprite'

/**
 * The camp: the last lit place. Taper sits by a small fire with the ember in his lantern,
 * and the light it casts is the only colour in a world that has been dark a long time.
 * Trees grow where that light reaches, and it reaches further with everything finished.
 */

/** Where the light is centred, in scene units. */
export const LIGHT = { x: 520, y: 935 }

/** How far the light reaches for a given number of embers: quick to grow at first, slower later. */
export function lightReach(embers: number): { rx: number; ry: number } {
  const rx = 470 + 22 * Math.sqrt(Math.max(embers, 0))
  // A low pool on the ground while small; it opens into a full circle as it grows.
  const ry = rx * (0.55 + 0.45 * Math.min((rx - 470) / 900, 1))
  return { rx, ry }
}

function isLit(x: number, y: number, embers: number): boolean {
  const { rx, ry } = lightReach(embers)
  return ((x - LIGHT.x) / rx) ** 2 + ((y - LIGHT.y) / ry) ** 2 <= 1.12
}

/** Where trees stand behind the camp, by how many there are: [foot x, foot y, width]. */
const SLOTS: Record<number, [number, number, number][]> = {
  1: [[540, 760, 430]],
  2: [[300, 785, 390], [745, 775, 390]],
  3: [[215, 805, 350], [520, 735, 390], [820, 795, 350]],
  4: [[165, 825, 310], [390, 740, 340], [645, 735, 340], [860, 815, 310]],
  5: [[130, 840, 280], [320, 760, 300], [520, 725, 320], [715, 755, 300], [890, 835, 280]],
  6: [[115, 850, 265], [280, 775, 280], [445, 730, 295], [610, 730, 295], [770, 770, 280], [915, 845, 265]],
}

/**
 * Travellers drawn back by the light. Each arrives once enough embers have been earned,
 * and pitches up at the far edge of the clearing, small with distance.
 */
const SETTLERS: { art: keyof typeof art; at: number; x: number; y: number; width: number }[] = [
  { art: 'tent-cream', at: 40, x: 905, y: 715, width: 150 },
  { art: 'travellers', at: 100, x: 95, y: 730, width: 105 },
  { art: 'tent-rust', at: 200, x: 185, y: 700, width: 150 },
  { art: 'bunting', at: 350, x: 655, y: 690, width: 120 },
  { art: 'stall', at: 550, x: 410, y: 690, width: 135 },
  { art: 'cart', at: 800, x: 790, y: 700, width: 135 },
]

/** How many travellers have arrived for a given number of embers. */
export function settlerCount(embers: number): number {
  return SETTLERS.filter((s) => embers >= s.at).length
}

const SITTING = art['taper-sitting']
const CAMPFIRE = art.campfire
const CAMP = { taperX: 370, taperY: 1040, taperWidth: 600, fireX: 760, fireY: 1065, fireWidth: 215 }

type Pose = 'resting' | 'sipping' | 'speaking'
const POSES: Record<Pose, string> = {
  resting: 'art/taper-sitting.webp',
  sipping: 'art/taper-sipping.webp',
  speaking: 'art/taper-speaking.webp',
}

function isNew(iso: string): boolean {
  return Date.now() - Date.parse(iso) < 2500
}

interface ForestProps {
  state: AppState
  /** The embers the camp is showing. This lags the real count while an ember is still in flight. */
  embers: number
  speaking: boolean
  /** True when nothing has been finished for a few days: the flame burns low, but the light never shrinks. */
  low: boolean
  onOpenTree: (treeId: string) => void
  onWake: () => void
}

export function Forest({ state, embers, speaking, low, onOpenTree, onWake }: ForestProps) {
  const trees = state.trees.slice(0, 6)
  const slots = SLOTS[Math.max(trees.length, 1)]
  const asleep = state.phase === 'asleep'
  const { rx, ry } = lightReach(embers)
  const eyes = asleep ? 0 : Math.min(lingeringCount(state), 5)

  // Left to himself he takes a sip of tea every so often.
  const [sipping, setSipping] = useState(false)
  useEffect(() => {
    if (asleep) return
    let lower: ReturnType<typeof setTimeout>
    let next: ReturnType<typeof setTimeout>
    const schedule = () => {
      next = setTimeout(
        () => {
          setSipping(true)
          lower = setTimeout(() => setSipping(false), 1900)
          schedule()
        },
        9000 + Math.random() * 8000,
      )
    }
    schedule()
    return () => {
      clearTimeout(next)
      clearTimeout(lower)
    }
  }, [asleep])
  const pose: Pose = speaking ? 'speaking' : sipping ? 'sipping' : 'resting'

  const placed = trees.map((tree, i) => {
    const [footX, footY, baseWidth] = slots[i]
    const tasks = visibleTasks(state, tree.id)
    const open = tasks.filter((t) => t.status === 'open').length
    // A tree grows a little with everything finished on it.
    const width = baseWidth * (0.85 + 0.15 * Math.min(doneCount(state, tree.id) / 12, 1))
    return { tree, footX, footY, width, tasks, open, lit: isLit(footX, footY, embers) }
  })

  return (
    <div className={`scene camp ${speaking ? 'speaking' : ''} ${low ? 'low' : ''}`}>
      {!asleep &&
        SETTLERS.filter((s) => embers >= s.at).map((s) => (
          <img
            key={s.art}
            className="sprite piece settler"
            style={{ ...standing(art[s.art] as { w: number; h: number }, s.x, s.y, s.width), zIndex: Math.round(s.y) - 200 }}
            src={`art/${s.art}.webp`}
            alt=""
            draggable={false}
          />
        ))}

      {placed.map(({ tree, footX, footY, width, tasks, open, lit }) => (
        <TreeSprite
          key={tree.id}
          className={`${isNew(tree.createdAt) ? 'sprout' : ''} ${lit ? '' : 'unlit'}`}
          footX={footX}
          footY={footY}
          width={width}
          onClick={() => onOpenTree(tree.id)}
          label={`${tree.name} tree, ${open} open`}
        >
          {ANCHORS.slice(0, 34).map((point, slot) => {
            const task = tasks[TASK_ANCHORS.indexOf(slot)]
            return (
              <TreeItem
                key={slot}
                anchor={slot}
                size={0.22}
                kind={task?.status === 'done' ? 'blossom' : 'leaf'}
                color={tree.color}
                taskId={task?.id}
                // Leaves stir in order from one side to the other, like a breeze passing through.
                delay={-(1 - point.x) * 2.4 - (slot % 3) * 0.3}
              />
            )
          })}
        </TreeSprite>
      ))}

      {/* Name tags sit above every tree so a neighbour's leaves never cover them. */}
      {placed.map(({ tree, footX, footY, width, open }) => (
        <button
          key={tree.id}
          type="button"
          className="tree-tag"
          style={{ left: `${(footX / SCENE.w) * 100}%`, top: `${((footY - width * 1.3) / SCENE.h) * 100}%` }}
          onClick={() => onOpenTree(tree.id)}
          tabIndex={-1}
          aria-hidden="true"
        >
          {tree.name}
          {open > 0 && <span className="count">{open}</span>}
        </button>
      ))}

      {/* Things left a while wait at the edge of the light. */}
      {Array.from({ length: eyes }, (_, i) => {
        const angle = Math.PI * (0.92 + i * 0.29)
        return (
          <span
            key={i}
            className="eyes"
            style={{
              left: `${((LIGHT.x + Math.cos(angle) * (rx + 70)) / SCENE.w) * 100}%`,
              top: `${((LIGHT.y + Math.sin(angle) * (ry + 55)) / SCENE.h) * 100}%`,
              animationDelay: `${-i * 1.7}s`,
            }}
          />
        )
      })}

      {asleep ? (
        <button
          type="button"
          className="piece lantern"
          style={{ ...standing(art['lantern-unlit'], 520, 1000, 190), zIndex: 990 }}
          onClick={onWake}
          aria-label="Pick up the lantern"
        >
          <img className="sprite" src="art/lantern-unlit.webp" alt="" draggable={false} />
        </button>
      ) : (
        <>
          <div className="piece campfire" style={{ ...standing(CAMPFIRE, CAMP.fireX, CAMP.fireY, CAMP.fireWidth), zIndex: CAMP.fireY }}>
            <img className="sprite" src="art/campfire.webp" alt="" draggable={false} />
            <Flame x={0.5} y={0.9} height={0.3} className="fire" />
            <Sparks x={0.5} y={0.62} />
            <span className="steam" />
            <span className="steam late" />
          </div>
          <div
            className={`piece taper sitting pose-${pose}`}
            style={{ ...standing(SITTING, CAMP.taperX, CAMP.taperY, CAMP.taperWidth), zIndex: CAMP.taperY }}
            role="img"
            aria-label="The wizard, sitting on a log with a cup of tea"
          >
            {/* All three poses are stacked and cross-fade, so he never blinks out between them. */}
            {(Object.keys(POSES) as Pose[]).map((name) => (
              <img key={name} className={`sprite pose ${name === pose ? 'shown' : ''}`} src={POSES[name]} alt="" draggable={false} />
            ))}
            <Flame x={0.432} y={0.262} height={0.17} className="ember" />
            <span className="lantern-target" style={{ left: '43.2%', top: '19%' }} />
            <Sparks x={0.432} y={0.1} count={4} />
          </div>
        </>
      )}
    </div>
  )
}
