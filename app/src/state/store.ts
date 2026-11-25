import type { Action } from '../brain/types'
import type { AppState, LogEvent, Task, Tree, TreeColor } from './types'

const STATE_KEY = 'prodty.state.v1'
const LOG_KEY = 'prodty.log.v1'

export const TREE_COLORS: TreeColor[] = ['rust', 'moss', 'gold', 'teal', 'rose', 'violet']

/** Embers paid for any finished task until Taper can rate effort, dread and stakes. */
export const FLAT_EMBERS = 10

export function initialState(): AppState {
  return { phase: 'asleep', wizardName: null, embers: 0, trees: [], tasks: [], pending: null, soundOn: true }
}

function newId(): string {
  return typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STATE_KEY)
    if (raw) return { ...initialState(), ...(JSON.parse(raw) as Partial<AppState>) }
  } catch {
    // Storage can be unavailable (private windows). Start fresh; the app still works for the session.
  }
  return initialState()
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state))
  } catch {
    // See loadState.
  }
}

export function resetAll(): void {
  try {
    localStorage.removeItem(STATE_KEY)
    localStorage.removeItem(LOG_KEY)
  } catch {
    // See loadState.
  }
}

/** Append one line to the history. Kept from day one so Taper's instinct has something to learn from. */
export function logEvent(type: string, data: Record<string, unknown> = {}): void {
  try {
    const log = JSON.parse(localStorage.getItem(LOG_KEY) ?? '[]') as LogEvent[]
    log.push({ at: new Date().toISOString(), type, ...data })
    localStorage.setItem(LOG_KEY, JSON.stringify(log))
  } catch {
    // See loadState.
  }
}

export function isToday(iso: string | undefined): boolean {
  return !!iso && new Date(iso).toDateString() === new Date().toDateString()
}

/** Tasks to draw on a tree: open ones, plus those finished today, which show as blossoms. */
export function visibleTasks(state: AppState, treeId: string): Task[] {
  return state.tasks
    .filter((t) => t.treeId === treeId && (t.status === 'open' || (t.status === 'done' && isToday(t.closedAt))))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

export function doneCount(state: AppState, treeId: string): number {
  return state.tasks.filter((t) => t.treeId === treeId && t.status === 'done').length
}

function findTree(trees: Tree[], name: string): Tree | undefined {
  return trees.find((t) => t.name.toLowerCase() === name.toLowerCase())
}

export interface Applied {
  state: AppState
  embersGained: number
}

/** Apply the brain's proposed changes. All rules about what a change is worth live here, not in the brain. */
export function applyActions(state: AppState, actions: Action[]): Applied {
  const now = new Date().toISOString()
  let trees = state.trees
  let tasks = state.tasks
  let embersGained = 0

  for (const action of actions) {
    if (action.type === 'plant_tree') {
      if (findTree(trees, action.name)) continue
      const tree: Tree = { id: newId(), name: action.name, color: TREE_COLORS[trees.length % TREE_COLORS.length], createdAt: now }
      trees = [...trees, tree]
      logEvent('tree_planted', { treeId: tree.id, name: tree.name })
    } else if (action.type === 'add_task') {
      const tree = findTree(trees, action.treeName) ?? trees[0]
      if (!tree) continue
      const task: Task = {
        id: newId(),
        treeId: tree.id,
        title: action.title,
        createdAt: now,
        status: 'open',
        ...(action.note ? { note: action.note } : {}),
        ...(action.due ? { due: action.due } : {}),
        ...(action.said ? { said: action.said } : {}),
      }
      tasks = [...tasks, task]
      logEvent('task_added', { taskId: task.id, treeId: tree.id, tree: tree.name, title: task.title, hasNote: !!task.note, due: task.due ?? null })
    } else {
      const task = tasks.find((t) => t.id === action.taskId)
      if (!task || task.status !== 'open') continue
      const done = action.type === 'complete_task'
      tasks = tasks.map((t) => (t.id === task.id ? { ...t, status: done ? 'done' : 'dropped', closedAt: now } : t))
      if (done) embersGained += FLAT_EMBERS
      logEvent(done ? 'task_done' : 'task_dropped', {
        taskId: task.id,
        treeId: task.treeId,
        title: task.title,
        ageMinutes: Math.round((Date.parse(now) - Date.parse(task.createdAt)) / 60000),
        ...(done ? { embers: FLAT_EMBERS } : {}),
      })
    }
  }

  return { state: { ...state, trees, tasks, embers: state.embers + embersGained }, embersGained }
}

function readLog(): LogEvent[] {
  try {
    return JSON.parse(localStorage.getItem(LOG_KEY) ?? '[]') as LogEvent[]
  } catch {
    return []
  }
}

/** How many different days anything was finished. It only ever goes up, and each one is a star. */
export function daysLit(): number {
  const days = new Set(readLog().filter((e) => e.type === 'task_done').map((e) => new Date(e.at).toDateString()))
  return days.size
}

/** Whole days since the ember was last fed, or since the wizard was woken if nothing is finished yet. */
export function daysQuiet(): number {
  const log = readLog().filter((e) => e.type === 'task_done' || e.type === 'wizard_woken')
  const last = log[log.length - 1]
  return last ? Math.floor((Date.now() - Date.parse(last.at)) / 86_400_000) : 0
}

/** Open tasks that have sat for two days or more. Each one is a pair of eyes at the edge of the light. */
export function lingeringCount(state: AppState): number {
  const cutoff = Date.now() - 2 * 86_400_000
  return state.tasks.filter((t) => t.status === 'open' && Date.parse(t.createdAt) < cutoff).length
}
