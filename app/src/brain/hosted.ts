import type { AppState, Pending } from '../state/types'
import { characterBible } from './bible'
import type { Action, Brain, BrainReply } from './types'

/**
 * Taper's real voice for the hosted preview: the page asks Claude directly, on the viewer's own
 * account, so no API key is needed. The app's own server will replace this with the same bible
 * and the same checks.
 */

type Turn = { role: 'user' | 'assistant'; content: string }
type Sample = {
  json<T>(input: Turn[], options?: Record<string, unknown>): Promise<T>
}

declare global {
  interface Window {
    claude?: { use(name: string): Promise<unknown> }
  }
}

const MODEL = 'claude-sonnet-5-5'
const KEPT_TURNS = 6
const QUICK_ANSWER = /^(yes, plant|keep them together|let it go|keep it|y|yes|yeah|yep|sure|ok|okay|no|nope|nah)[.!]?$/i

interface ModelReply {
  speech?: unknown
  plant?: unknown
  add?: unknown
  complete?: unknown
  drop?: unknown
  ask_plant?: unknown
  ask_drop?: unknown
}

let samplePromise: Promise<Sample | null> | null = null
let unavailable = false
const history: Turn[] = []

function getSample(): Promise<Sample | null> {
  if (!samplePromise) {
    samplePromise = window.claude ? (window.claude.use('sample') as Promise<Sample | null>).catch(() => null) : Promise.resolve(null)
  }
  return samplePromise
}

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string' && v.trim().length > 0) : []
}

function cleanName(name: string): string {
  return name.trim().replace(/\s+/g, ' ').slice(0, 24)
}

function sameName(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase()
}

/** What the model is shown of the forest. Tasks get short ids so the model cannot mangle real ones. */
function describe(state: AppState, ids: Map<string, string>): string {
  const trees = state.trees.map((tree) => ({
    name: tree.name,
    open: state.tasks
      .filter((t) => t.treeId === tree.id && t.status === 'open')
      .map((t) => {
        const short = `t${ids.size + 1}`
        ids.set(short, t.id)
        return { id: short, title: t.title }
      }),
  }))
  let waitingOn: unknown = null
  if (state.pending?.kind === 'plant') {
    waitingOn = { question: 'whether to plant these trees', trees: state.pending.newTrees, heldTasks: state.pending.items }
  } else if (state.pending?.kind === 'drop') {
    const short = [...ids].find(([, real]) => real === (state.pending as { taskId: string }).taskId)?.[0]
    waitingOn = { question: 'whether to let this task go', task: short }
  }
  return JSON.stringify({ trees, waitingOn })
}

/** Check everything the model proposed against the real forest before any of it is applied. */
function toReply(raw: ModelReply, state: AppState, ids: Map<string, string>): BrainReply {
  const speech = typeof raw.speech === 'string' && raw.speech.trim() ? raw.speech.trim().slice(0, 400) : 'Mm. Say that once more for me.'
  const existing = state.trees.map((t) => t.name)
  const known = (name: string) => existing.some((n) => sameName(n, name))

  const plant = strings(raw.plant).map(cleanName)
  const askPlant = strings(raw.ask_plant).map(cleanName).filter((n) => !known(n) && !plant.some((p) => sameName(p, n)))
  const adds = (Array.isArray(raw.add) ? raw.add : [])
    .map((item) => item as { title?: unknown; tree?: unknown })
    .filter((item) => typeof item.title === 'string' && item.title.trim())
    .map((item) => ({
      title: (item.title as string).trim().slice(0, 80),
      treeName: typeof item.tree === 'string' && item.tree.trim() ? cleanName(item.tree) : (existing[0] ?? 'Personal'),
    }))

  const actions: Action[] = plant.filter((n) => !known(n)).map((name) => ({ type: 'plant_tree', name }))
  const held: { title: string; treeName: string }[] = []
  for (const add of adds) {
    if (askPlant.some((n) => sameName(n, add.treeName))) held.push(add)
    else if (known(add.treeName) || plant.some((p) => sameName(p, add.treeName))) actions.push({ type: 'add_task', ...add })
    else {
      // A tree he named but neither planted nor asked about: ask, rather than plant unasked.
      askPlant.push(add.treeName)
      held.push(add)
    }
  }
  for (const short of strings(raw.complete)) {
    const taskId = ids.get(short)
    if (taskId) actions.push({ type: 'complete_task', taskId })
  }
  for (const short of strings(raw.drop)) {
    const taskId = ids.get(short)
    if (taskId) actions.push({ type: 'drop_task', taskId })
  }

  let pending: Pending | null = null
  let choices: string[] | undefined
  const uniqueAsk = [...new Set(askPlant)]
  const askDrop = typeof raw.ask_drop === 'string' ? ids.get(raw.ask_drop) : undefined
  if (uniqueAsk.length > 0) {
    pending = { kind: 'plant', newTrees: uniqueAsk, items: held }
    choices = ['Yes, plant', 'Keep them together']
  } else if (askDrop) {
    pending = { kind: 'drop', taskId: askDrop }
    choices = ['Let it go', 'Keep it']
  }
  return { speech, actions, pending, choices }
}

export function createHostedBrain(fallback: Brain): Brain {
  return {
    async interpret(text, state) {
      // A plain yes or no to a question he asked needs no thinking: answer at once.
      if (state.pending && QUICK_ANSWER.test(text.trim())) return fallback.interpret(text, state)

      const sample = unavailable ? null : await getSample()
      if (!sample) return fallback.interpret(text, state)

      const ids = new Map<string, string>()
      const message = `Forest now:\n${describe(state, ids)}\n\nThe person says:\n${text}`
      const turns: Turn[] = [
        { role: 'user', content: characterBible(state.wizardName ?? 'the wizard') },
        ...history.slice(-KEPT_TURNS),
        { role: 'user', content: message },
      ]
      try {
        const raw = await sample.json<ModelReply>(turns, { model: MODEL, effort: 'low', cache: false })
        const reply = toReply(raw ?? {}, state, ids)
        history.push({ role: 'user', content: `The person says:\n${text}` }, { role: 'assistant', content: JSON.stringify({ speech: reply.speech }) })
        return reply
      } catch (error) {
        const code = (error as { code?: string } | null)?.code
        // The viewer declined, or Claude is not available here: stop asking for the rest of this visit.
        if (code && ['not_granted', 'sampling_disabled', 'not_declared', 'capability_disabled', 'capability_removed'].includes(code)) {
          unavailable = true
        }
        return fallback.interpret(text, state)
      }
    },
  }
}
