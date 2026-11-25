import { standInBrain } from './standin'
import type { Brain } from './types'

/** The one place that decides what does Taper's thinking. Swap the stand-in for the real model here. */
export const brain: Brain = standInBrain
