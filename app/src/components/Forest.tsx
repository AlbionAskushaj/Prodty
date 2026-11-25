import art from '../data/art.json'
import { doneCount, visibleTasks } from '../state/store'
import type { AppState } from '../state/types'
import { ANCHORS, SCENE, TASK_ANCHORS, TreeItem, TreeSprite, sceneBox, standing } from './TreeSprite'

/** Where trees stand, by how many there are: [foot x, foot y, width] in scene units. */
const SLOTS: Record<number, [number, number, number][]> = {
  1: [[410, 820, 620]],
  2: [[290, 815, 540], [700, 835, 520]],
  3: [[210, 845, 500], [500, 775, 560], [800, 855, 480]],
  4: [[185, 855, 440], [415, 775, 480], [650, 785, 470], [855, 875, 420]],
  5: [[160, 860, 390], [350, 780, 415], [545, 750, 430], [725, 790, 415], [880, 880, 375]],
  6: [[150, 870, 365], [310, 800, 380], [470, 755, 390], [630, 760, 390], [780, 810, 380], [900, 890, 355]],
}

const FLOOR = art['forest-floor']
const FLOOR_TOP = 520

function isNew(iso: string): boolean {
  return Date.now() - Date.parse(iso) < 2500
}

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
  const alone = trees.length <= 1

  const placed = trees.map((tree, i) => {
    const [footX, footY, baseWidth] = slots[i]
    const tasks = visibleTasks(state, tree.id)
    const open = tasks.filter((t) => t.status === 'open').length
    // A tree grows a little with everything finished on it.
    const width = baseWidth * (0.85 + 0.15 * Math.min(doneCount(state, tree.id) / 12, 1))
    return { tree, footX, footY, width, tasks, open }
  })

  return (
    <div className="scene">
      <img className="sprite piece" style={sceneBox(0, FLOOR_TOP, 1000, FLOOR.w / FLOOR.h)} src="art/forest-floor.webp" alt="" draggable={false} />

      {trees.length === 0 && <TreeSprite footX={350} footY={805} width={400} />}

      {placed.map(({ tree, footX, footY, width, tasks, open }) => (
        <TreeSprite
          key={tree.id}
          className={isNew(tree.createdAt) ? 'sprout' : ''}
          footX={footX}
          footY={footY}
          width={width}
          onClick={() => onOpenTree(tree.id)}
          label={`${tree.name} tree, ${open} open`}
        >
          {ANCHORS.map((_, slot) => {
            const task = tasks[TASK_ANCHORS.indexOf(slot)]
            return <TreeItem key={slot} anchor={slot} size={0.21} kind={task?.status === 'done' ? 'blossom' : 'leaf'} color={tree.color} />
          })}
        </TreeSprite>
      ))}

      {/* Name tags sit above every tree so a neighbour's leaves never cover them. */}
      {placed.map(({ tree, footX, footY, width, open }) => (
        <button
          key={tree.id}
          type="button"
          className="tree-tag"
          style={{ left: `${(footX / SCENE.w) * 100}%`, top: `${((footY - width * 0.36) / SCENE.h) * 100}%` }}
          onClick={() => onOpenTree(tree.id)}
          tabIndex={-1}
          aria-hidden="true"
        >
          {tree.name}
          {open > 0 && <span className="count">{open}</span>}
        </button>
      ))}

      {asleep ? (
        <button
          type="button"
          className="piece lantern"
          style={{ ...standing(art['lantern-unlit'], 650, 995, 190), zIndex: 990 }}
          onClick={onWake}
          aria-label="Pick up the lantern"
        >
          <img className="sprite" src="art/lantern-unlit.webp" alt="" draggable={false} />
        </button>
      ) : (
        <div
          className="piece taper"
          style={{ ...standing(taper, alone ? 745 : 610, alone ? 1030 : 1100, speaking ? 285 : 235), zIndex: 1100 }}
        >
          <img className="sprite" src={speaking ? 'art/taper-talking.webp' : 'art/taper-idle.webp'} alt="The wizard" draggable={false} />
        </div>
      )}

      {/* A few loose leaves drifting across, so the forest is never perfectly still. */}
      {!asleep && [0, 1].map((i) => <img key={i} className={`drift drift-${i}`} src="art/leaf-fallen.webp" alt="" draggable={false} />)}
    </div>
  )
}
