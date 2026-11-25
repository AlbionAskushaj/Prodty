import { useCallback, useEffect, useRef, useState } from 'react'
import { brain } from './brain'
import { Dialogue } from './components/Dialogue'
import { Forest } from './components/Forest'
import { EmberIcon, SoundIcon } from './components/Icons'
import { InputBar } from './components/InputBar'
import { TreeView } from './components/TreeView'
import { chime, setSoundEnabled, startMusic } from './lib/sound'
import { applyActions, loadState, logEvent, resetAll, saveState, visibleTasks } from './state/store'
import type { AppState } from './state/types'

interface Speech {
  text: string
  turn: number
  choices?: string[]
}

function pick(lines: string[]): string {
  return lines[Math.floor(Math.random() * lines.length)]
}

function greeting(state: AppState): string {
  if (state.phase === 'asleep') return ''
  if (state.phase === 'naming') return 'Oh. Hello. It has been dark here a long while. What shall I answer to?'
  const open = state.tasks.filter((t) => t.status === 'open').length
  if (state.trees.length === 0) return 'Now then. What is on your mind? Tell me all of it, in any order.'
  if (open === 0) return 'The forest is quiet today. Tell me what is on your mind, or simply sit a while.'
  return open === 1
    ? 'Welcome back. One leaf is waiting, and it is in no hurry.'
    : `Welcome back. ${open} leaves are waiting, and none of them are in a hurry.`
}

// Opening the app with ?reset or #reset starts over from the unlit lantern.
if (new URLSearchParams(location.search).has('reset') || location.hash === '#reset') {
  resetAll()
  history.replaceState(null, '', location.pathname)
}

export default function App() {
  const [state, setState] = useState<AppState>(loadState)
  const [speech, setSpeech] = useState<Speech>(() => ({ text: greeting(loadState()), turn: 0 }))
  const [openTree, setOpenTree] = useState<string | null>(null)
  const [thinking, setThinking] = useState(false)
  const [typing, setTyping] = useState(false)
  const stateRef = useRef(state)
  stateRef.current = state

  useEffect(() => saveState(state), [state])
  useEffect(() => setSoundEnabled(state.soundOn), [state.soundOn])
  useEffect(() => logEvent('app_opened'), [])

  const say = useCallback((text: string, choices?: string[]) => {
    setSpeech((previous) => ({ text, choices, turn: previous.turn + 1 }))
  }, [])

  function wake() {
    startMusic()
    setState((s) => ({ ...s, phase: 'naming' }))
    say('Oh. Hello. It has been dark here a long while. What shall I answer to?')
    logEvent('wizard_woken')
  }

  async function send(text: string) {
    startMusic()
    const current = stateRef.current

    if (current.phase === 'naming') {
      const name = text.replace(/[.!?]+$/, '').trim().slice(0, 24)
      setState((s) => ({ ...s, phase: 'ready', wizardName: name }))
      say(`${name}. A fine name. I have been called worse, and once, much grander. Now, what is on your mind? Tell me all of it, in any order.`)
      logEvent('wizard_named')
      return
    }

    setThinking(true)
    logEvent('message', { length: text.length })
    try {
      const reply = await brain.interpret(text, current)
      const applied = applyActions(stateRef.current, reply.actions)
      setState({ ...applied.state, pending: reply.pending === undefined ? applied.state.pending : reply.pending })
      if (applied.embersGained > 0) chime()
      // New things land in the forest, so step back out of a tree to show them arriving.
      if (reply.actions.some((a) => a.type === 'plant_tree' || a.type === 'add_task')) setOpenTree(null)
      say(reply.speech, reply.choices)
    } catch {
      say('Something slipped away from me just then. Tell me again, if you would.')
    } finally {
      setThinking(false)
    }
  }

  // Tapping a leaf is plain code: no thinking needed, and it works offline.
  function finishTask(taskId: string, done: boolean) {
    const applied = applyActions(stateRef.current, [{ type: done ? 'complete_task' : 'drop_task', taskId }])
    setState({ ...applied.state, pending: null })
    if (done) {
      chime()
      say(pick(['Well done. That one was ready to bloom.', 'There it goes. One less thing to carry.', 'Finished. The tree is glad of it, and so am I.']))
    } else {
      say(pick(['Let go. The branch is lighter for it.', 'Gone, and nothing lost by it.']))
    }
  }

  const tree = state.trees.find((t) => t.id === openTree)
  const asleep = state.phase === 'asleep'

  return (
    <main className="app" onPointerDown={startMusic}>
      <div className="frame" aria-hidden="true" />

      <div className="hud">
        <span className="embers" aria-label={`${state.embers} embers`}>
          <EmberIcon size={26} />
          <span key={state.embers} className="ember-count">
            {state.embers}
          </span>
        </span>
        {!tree && <span className="wordmark">Prodty</span>}
        <button
          type="button"
          className="icon-button"
          onClick={() => setState((s) => ({ ...s, soundOn: !s.soundOn }))}
          aria-label={state.soundOn ? 'Turn sound off' : 'Turn sound on'}
        >
          <SoundIcon on={state.soundOn} />
        </button>
      </div>

      <div className="stage" key={tree ? tree.id : 'forest'}>
        {tree ? (
          <TreeView
            tree={tree}
            tasks={visibleTasks(state, tree.id)}
            onBack={() => setOpenTree(null)}
            onDone={(id) => finishTask(id, true)}
            onDrop={(id) => finishTask(id, false)}
          />
        ) : (
          <div className="scene-fit">
            <Forest state={state} speaking={typing || thinking} onOpenTree={setOpenTree} onWake={wake} />
          </div>
        )}
      </div>

      {asleep ? (
        <p className="hint wake-hint">An old lantern lies in the grass. Tap it.</p>
      ) : (
        <>
          <Dialogue
            name={state.wizardName}
            text={speech.text}
            turn={speech.turn}
            thinking={thinking}
            choices={speech.choices}
            onChoice={send}
            onTyping={setTyping}
          />
          <InputBar
            placeholder={state.phase === 'naming' ? 'Give him a name…' : `Tell ${state.wizardName ?? 'the wizard'}…`}
            disabled={thinking}
            onSend={send}
          />
        </>
      )}
    </main>
  )
}
