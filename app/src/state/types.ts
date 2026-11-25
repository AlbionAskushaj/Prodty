export type TreeColor = 'rust' | 'moss' | 'gold' | 'teal' | 'rose' | 'violet'

export interface Tree {
  id: string
  name: string
  color: TreeColor
  createdAt: string
}

export interface Task {
  id: string
  treeId: string
  title: string
  createdAt: string
  status: 'open' | 'done' | 'dropped'
  closedAt?: string
  /** Everything else that was said about it: specifics, names, amounts, why it matters. */
  note?: string
  /** When it is needed by, in the person's own words ("Friday", "March 14"). */
  due?: string
  /** The message it came from, word for word, so nothing typed is ever lost. */
  said?: string
}

/** A task as first described, before it has a tree to hang on. */
export interface NewTask {
  title: string
  treeName: string
  note?: string
  due?: string
  said?: string
}

/** Something Taper has asked and is waiting on a yes or no for. */
export type Pending =
  | { kind: 'plant'; newTrees: string[]; items: NewTask[] }
  | { kind: 'drop'; taskId: string }

export type Phase = 'asleep' | 'naming' | 'ready'

export interface AppState {
  phase: Phase
  wizardName: string | null
  embers: number
  trees: Tree[]
  tasks: Task[]
  pending: Pending | null
  soundOn: boolean
}

/** One line of the append-only history. This is the training data for Taper's instinct. */
export interface LogEvent {
  at: string
  type: string
  [key: string]: unknown
}
