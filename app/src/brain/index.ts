import { createHostedBrain } from './hosted'
import { standInBrain } from './standin'
import type { Brain } from './types'

/**
 * The one place that decides what does Taper's thinking.
 *
 * On the hosted preview this is Claude. Anywhere Claude cannot be reached (local runs, or a viewer
 * who declines), it falls back to the rule-based stand-in so nothing typed is ever lost.
 */
export const brain: Brain = createHostedBrain(standInBrain)
