import type { AppState, Pending } from '../state/types'

/** A change to the forest. The brain proposes these; the app's own code applies them. */
export type Action =
  | { type: 'plant_tree'; name: string }
  | { type: 'add_task'; title: string; treeName: string }
  | { type: 'complete_task'; taskId: string }
  | { type: 'drop_task'; taskId: string }

export interface BrainReply {
  /** What Taper says. */
  speech: string
  actions: Action[]
  /** A question he is now waiting on, or null to clear one. Omit to leave it unchanged. */
  pending?: Pending | null
  /** Quick answers to offer as buttons. */
  choices?: string[]
}

/**
 * The shell around whatever does Taper's thinking. The app only ever talks to this,
 * so the stand-in, Claude, or a self-hosted model can be swapped without touching the app.
 */
export interface Brain {
  interpret(text: string, state: AppState): Promise<BrainReply>
}
