import type { AppState, Task } from '../state/types'
import type { Action, Brain, BrainReply } from './types'

/**
 * A rule-based stand-in for Taper, used until the real model is wired in.
 * It can hang tasks on trees, take them down, and plant trees. It cannot hold a conversation.
 */

const CATEGORY_WORDS: Record<string, string[]> = {
  School: [
    'class', 'exam', 'homework', 'problem set', 'pset', 'professor', 'prof', 'study', 'lecture',
    'assignment', 'essay', 'lab', 'quiz', 'midterm', 'final', 'course', 'reading', 'chapter',
    'stats', 'math', 'school',
  ],
  Research: [
    'paper', 'dataset', 'experiment', 'research', 'thesis', 'model', 'training', 'results',
    'advisor', 'literature', 'analysis',
  ],
  Work: ['meeting', 'client', 'report', 'boss', 'invoice', 'manager', 'standup', 'work'],
}
const FALLBACK_TREE = 'Personal'

const STOP_WORDS = new Set(['the', 'a', 'an', 'to', 'my', 'for', 'of', 'and', 'on', 'in', 'with', 'that', 'this', 'it'])

const YES = /^(y|yes|yeah|yep|sure|ok|okay|please|do it|go ahead|plant|let it go)\b/i
const DONE = /^(?:i(?:'ve| have)?\s+)?(?:just\s+)?(?:done|did|finished|completed)\b[:,]?\s*(.*)$/i
const DONE_SUFFIX = /^(.*?)\s+(?:is|are|was)\s+(?:done|finished)\.?$/i
const DROP = /^(?:drop|forget|scrap|cancel|never ?mind|let go of|i (?:don'?t|do not|no longer) (?:want|need) to(?: do)?)\b[:,]?\s*(.*)$/i
const PLANT = /^(?:plant|grow|add|make|create)\s+(?:me\s+)?(?:a\s+)?(?:new\s+)?tree\s+(?:for|called|named)\s+(.+)$/i
const GREETING = /^(hi|hello|hey|thanks|thank you|good (morning|afternoon|evening|night))\b/i

function pick(lines: string[]): string {
  return lines[Math.floor(Math.random() * lines.length)]
}

function words(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w && !STOP_WORDS.has(w))
}

function titleCase(text: string): string {
  return text.trim().replace(/\s+/g, ' ').replace(/^./, (c) => c.toUpperCase())
}

function cleanTask(raw: string): string {
  const text = raw
    .trim()
    .replace(/^[-*•\d.)\s]+/, '')
    .replace(/^(?:and\s+)?(?:i\s+)?(?:also\s+)?(?:still\s+)?(?:need to|have to|should|must|gotta|got to|want to|ought to|remember to|todo:?)\s+/i, '')
    .replace(/[.?!\s]+$/, '')
  return titleCase(text).slice(0, 80)
}

export function splitTasks(text: string): string[] {
  return text
    .split(/\n|;|,|\.\s+|\s+and then\s+|\s+then\s+/i)
    .flatMap((part) => part.split(/\s+and\s+(?=(?:i\s+)?(?:need|have|should|must|gotta|want)\b)/i))
    .map(cleanTask)
    .filter((t) => t.length >= 3)
}

/** Find the open task that best matches what the person typed, if any is close enough. */
function findTask(query: string, open: Task[]): Task | null {
  if (open.length === 0) return null
  const wanted = words(query)
  if (wanted.length === 0) return open.length === 1 ? open[0] : null
  let best: Task | null = null
  let bestScore = 0
  for (const task of open) {
    const have = words(task.title)
    const shared = wanted.filter((w) => have.some((h) => h.startsWith(w) || w.startsWith(h))).length
    const score = shared / Math.max(wanted.length, 1)
    if (score > bestScore) {
      best = task
      bestScore = score
    }
  }
  return bestScore >= 0.5 ? best : null
}

/** Decide which tree a task belongs on. May name a tree that does not exist yet. */
function chooseTree(title: string, existing: string[]): string {
  const lower = title.toLowerCase()
  let best = ''
  let bestHits = 0
  const candidates = new Set([...existing, ...Object.keys(CATEGORY_WORDS)])
  for (const name of candidates) {
    const known = Object.keys(CATEGORY_WORDS).find((c) => c.toLowerCase() === name.toLowerCase())
    const keywords = [name.toLowerCase(), ...(known ? CATEGORY_WORDS[known] : [])]
    const hits = keywords.filter((k) => new RegExp(`\\b${k}`).test(lower)).length
    if (hits > bestHits) {
      best = name
      bestHits = hits
    }
  }
  if (best) return best
  return existing.find((n) => n.toLowerCase() === FALLBACK_TREE.toLowerCase()) ?? FALLBACK_TREE
}

function listNames(names: string[]): string {
  if (names.length === 1) return names[0]
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
}

const COUNT_WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten']

function countPhrase(n: number): string {
  const word = COUNT_WORDS[n] ?? String(n)
  return `${word} ${n === 1 ? 'thing' : 'things'}.`
}

function interpretSync(text: string, state: AppState): BrainReply {
  const input = text.trim()
  const open = state.tasks.filter((t) => t.status === 'open')
  const treeNames = state.trees.map((t) => t.name)

  if (state.pending) {
    const yes = YES.test(input)
    if (state.pending.kind === 'plant') {
      const { newTrees, items } = state.pending
      if (yes) {
        const actions: Action[] = [
          ...newTrees.map((name): Action => ({ type: 'plant_tree', name })),
          ...items.map((i): Action => ({ type: 'add_task', title: i.title, treeName: i.treeName })),
        ]
        return { speech: 'Planted. Everything is on its branch now. Tap a tree to see it up close.', actions, pending: null }
      }
      const home = treeNames[0] ?? 'Everything'
      const actions: Action[] = [
        ...(treeNames.length === 0 ? [{ type: 'plant_tree', name: home } as Action] : []),
        ...items.map((i): Action => ({ type: 'add_task', title: i.title, treeName: home })),
      ]
      return { speech: 'Then I will keep them together for now. We can sort them later, or never.', actions, pending: null }
    }
    if (state.pending.kind === 'drop') {
      if (yes) {
        return {
          speech: pick(['Let go. The branch is lighter for it.', 'Gone, and nothing lost by it.']),
          actions: [{ type: 'drop_task', taskId: state.pending.taskId }],
          pending: null,
        }
      }
      return { speech: 'Then it stays where it is. No harm in keeping it.', actions: [], pending: null }
    }
  }

  const plant = input.match(PLANT)
  if (plant) {
    const name = titleCase(plant[1].replace(/[.?!]+$/, '')).slice(0, 24)
    if (treeNames.some((n) => n.toLowerCase() === name.toLowerCase())) {
      return { speech: `There is already a tree for ${name}. It is doing well.`, actions: [] }
    }
    return { speech: `A tree for ${name}. It is in the ground. Give it time.`, actions: [{ type: 'plant_tree', name }] }
  }

  const done = input.match(DONE) ?? input.match(DONE_SUFFIX)
  if (done) {
    const task = findTask(done[1] ?? '', open)
    if (task) {
      return {
        speech: pick([
          'Well done. That one was ready to bloom.',
          'Finished. The tree is glad of it, and so am I.',
          'There it goes. One less thing to carry.',
        ]),
        actions: [{ type: 'complete_task', taskId: task.id }],
      }
    }
    return { speech: 'I could not find that one among your leaves. Tap it on its tree, or tell me a little more.', actions: [] }
  }

  const drop = input.match(DROP)
  if (drop) {
    const task = findTask(drop[1] ?? '', open)
    if (task) {
      return {
        speech: `Let "${task.title}" go? Nothing is lost by it.`,
        actions: [],
        pending: { kind: 'drop', taskId: task.id },
        choices: ['Let it go', 'Keep it'],
      }
    }
    return { speech: 'I am not sure which leaf you mean. Tap it on its tree and you can let it go there.', actions: [] }
  }

  if (GREETING.test(input) && input.length < 40) {
    return { speech: 'It is good to have company. Tell me what is on your mind, in any order.', actions: [] }
  }

  if (input.endsWith('?') && input.length < 120) {
    return {
      speech: 'That is a question for a wiser version of me, and he is on his way. For now I can hang things on trees and take them down.',
      actions: [],
    }
  }

  const titles = splitTasks(input)
  if (titles.length === 0) {
    return { speech: 'I did not catch a task in that. Tell me what needs doing and I will find it a branch.', actions: [] }
  }

  const items = titles.map((title) => ({ title, treeName: chooseTree(title, treeNames) }))
  const newTrees = [...new Set(items.map((i) => i.treeName))].filter(
    (name) => !treeNames.some((n) => n.toLowerCase() === name.toLowerCase()),
  )

  if (newTrees.length > 0) {
    const what = newTrees.length === 1 ? `a tree for ${newTrees[0]}` : `trees for ${listNames(newTrees)}`
    return {
      speech: `${countPhrase(items.length)} I would plant ${what}. Shall I?`,
      actions: [],
      pending: { kind: 'plant', newTrees, items },
      choices: ['Yes, plant', 'Keep them together'],
    }
  }

  return {
    speech:
      items.length === 1
        ? `One thing. It is on the ${items[0].treeName} tree.`
        : `${countPhrase(items.length)} I have hung each one on the right tree.`,
    actions: items.map((i): Action => ({ type: 'add_task', title: i.title, treeName: i.treeName })),
  }
}

export const standInBrain: Brain = {
  async interpret(text, state) {
    // A short pause so replies do not feel instant and mechanical.
    await new Promise((resolve) => setTimeout(resolve, 350))
    return interpretSync(text, state)
  },
}
