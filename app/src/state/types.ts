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
}

/** Something Taper has asked and is waiting on a yes or no for. */
export type Pending =
  | { kind: 'plant'; newTrees: string[]; items: { title: string; treeName: string }[] }
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
