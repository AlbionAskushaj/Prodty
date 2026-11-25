import art from '../data/art.json'
import { doneCount, visibleTasks } from '../state/store'
import type { AppState } from '../state/types'
import { ANCHORS, SCENE, TASK_SLOTS, TreeItem, TreeSprite, sceneBox, standing } from './TreeSprite'

/** Where trees stand, by how many there are: [foot x, foot y, width] in scene units. */
const SLOTS: Record<number, [number, number, number][]> = {
  1: [[430, 810, 600]],
  2: [[300, 810, 520], [705, 825, 500]],
  3: [[215, 840, 480], [505, 770, 540], [800, 850, 460]],
  4: [[190, 850, 420], [420, 770, 460], [655, 780, 450], [855, 870, 400]],
  5: [[165, 855, 375], [355, 775, 400], [545, 745, 415], [725, 785, 400], [880, 875, 360]],
  6: [[150, 865, 350], [310, 795, 365], [470, 750, 375], [630, 755, 375], [780, 805, 365], [900, 885, 340]],
}

const FLOOR = art['forest-floor']
const FLOOR_TOP = 520

interface ForestProps {
  state: AppState
  speaking: boolean
  onOpenTree: (treeId: string) => void
  onWake: () => void
}

export function Forest({ state, speaking, onOpenTree, onWake }: ForestProps) {
  const trees = state.trees.slice(0, 6)
  const slots = SLOTS[Math.max(trees.length, 1)]
  const asleep = state.phase === 'asleep'
  const taper = speaking ? art['taper-talking'] : art['taper-idle']

  const placed = trees.map((tree, i) => {
    const [footX, footY, baseWidth] = slots[i]
    const tasks = visibleTasks(state, tree.id)
    const open = tasks.filter((t) => t.status === 'open').length
    // A tree grows a little with everything finished on it, and fills out with what is on it now.
    const width = baseWidth * (0.82 + 0.18 * Math.min(doneCount(state, tree.id) / 12, 1))
    const leafCount = Math.min(ANCHORS.length, Math.max(tasks.length, 6 + open * 2))
    return { tree, footX, footY, width, tasks, open, leafCount }
  })

  return (
    <div className="scene">
      <img className="sprite piece" style={sceneBox(0, FLOOR_TOP, 1000, FLOOR.w / FLOOR.h)} src="art/forest-floor.webp" alt="" draggable={false} />

      {trees.length === 0 && <TreeSprite footX={360} footY={800} width={380} />}

      {placed.map(({ tree, footX, footY, width, tasks, open, leafCount }) => (
        <TreeSprite
          key={tree.id}
          footX={footX}
          footY={footY}
          width={width}
          onClick={() => onOpenTree(tree.id)}
          label={`${tree.name} tree, ${open} open`}
        >
          {Array.from({ length: leafCount }, (_, slot) => {
            const task = slot < TASK_SLOTS ? tasks[slot] : undefined
            return <TreeItem key={slot} anchor={slot} size={0.2} kind={task?.status === 'done' ? 'blossom' : 'leaf'} color={tree.color} />
          })}
        </TreeSprite>
      ))}

      {/* Name tags sit above every tree so a neighbour's leaves never cover them. */}
      {placed.map(({ tree, footX, footY, width }) => (
        <button
          key={tree.id}
          type="button"
          className="tree-tag"
          style={{ left: `${(footX / SCENE.w) * 100}%`, top: `${((footY - width * 0.4) / SCENE.h) * 100}%` }}
          onClick={() => onOpenTree(tree.id)}
          tabIndex={-1}
          aria-hidden="true"
        >
          {tree.name}
        </button>
      ))}

      {asleep ? (
        <button
          type="button"
          className="piece lantern"
          style={{ ...standing(art['lantern-unlit'], 640, 990, 170), zIndex: 990 }}
          onClick={onWake}
          aria-label="Pick up the lantern"
        >
          <img className="sprite" src="art/lantern-unlit.webp" alt="" draggable={false} />
        </button>
      ) : (
        <img
          className="sprite piece taper"
          style={{ ...standing(taper, trees.length <= 1 ? 730 : 600, trees.length <= 1 ? 1010 : 1085, speaking ? 242 : 200), zIndex: 1085 }}
          src={speaking ? 'art/taper-talking.webp' : 'art/taper-idle.webp'}
          alt="The wizard"
          draggable={false}
        />
      )}
    </div>
  )
}
