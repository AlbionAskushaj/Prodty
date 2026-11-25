import art from '../data/art.json'
import { doneCount, lingeringCount, visibleTasks } from '../state/store'
import type { AppState } from '../state/types'
import { Flame, Sparks } from './Night'
import { ANCHORS, SCENE, TASK_ANCHORS, TreeItem, TreeSprite, sceneBox, standing } from './TreeSprite'

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

const SITTING = art['taper-sitting']
const CAMPFIRE = art.campfire
const CAMP = { taperX: 370, taperY: 1040, taperWidth: 600, fireX: 760, fireY: 1065, fireWidth: 215 }

function isNew(iso: string): boolean {
  return Date.now() - Date.parse(iso) < 2500
}

interface ForestProps {
  state: AppState
  speaking: boolean
  /** True when nothing has been finished for a few days: the flame burns low, but the light never shrinks. */
  low: boolean
  onOpenTree: (treeId: string) => void
  onWake: () => void
}

export function Forest({ state, speaking, low, onOpenTree, onWake }: ForestProps) {
  const trees = state.trees.slice(0, 6)
  const slots = SLOTS[Math.max(trees.length, 1)]
  const asleep = state.phase === 'asleep'
  const { rx, ry } = lightReach(state.embers)
  const eyes = asleep ? 0 : Math.min(lingeringCount(state), 5)

  const placed = trees.map((tree, i) => {
    const [footX, footY, baseWidth] = slots[i]
    const tasks = visibleTasks(state, tree.id)
    const open = tasks.filter((t) => t.status === 'open').length
    // A tree grows a little with everything finished on it.
    const width = baseWidth * (0.85 + 0.15 * Math.min(doneCount(state, tree.id) / 12, 1))
    return { tree, footX, footY, width, tasks, open, lit: isLit(footX, footY, state.embers) }
  })

  return (
    <div className={`scene camp ${speaking ? 'speaking' : ''} ${low ? 'low' : ''}`}>
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
          <div className="piece taper sitting" style={{ ...standing(SITTING, CAMP.taperX, CAMP.taperY, CAMP.taperWidth), zIndex: CAMP.taperY }}>
            <img className="sprite" src="art/taper-sitting.webp" alt="The wizard, sitting on a log with a cup of tea" draggable={false} />
            <Flame x={0.432} y={0.262} height={0.17} className="ember" />
            <Sparks x={0.432} y={0.1} count={4} />
          </div>
        </>
      )}
    </div>
  )
}

/** Kept for layouts that still place things by scene box. */
export { sceneBox }
