import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { brain } from './brain'
import art from './data/art.json'
import { Dialogue } from './components/Dialogue'
import { Forest, LIGHT, lightReach } from './components/Forest'
import { EmberIcon, SoundIcon } from './components/Icons'
import { InputBar } from './components/InputBar'
import { Fireflies, Stars } from './components/Night'
import { SCENE } from './components/TreeSprite'
import { TreeView } from './components/TreeView'
import { chime, setSoundEnabled, startMusic } from './lib/sound'
import { applyActions, daysLit, daysQuiet, loadState, logEvent, resetAll, saveState, visibleTasks } from './state/store'
import type { AppState } from './state/types'

interface Speech {
  text: string
  turn: number
  choices?: string[]
}

/** Where the light falls on the screen, in pixels: its centre and how far it reaches. */
interface LightBox {
  x: number
  y: number
  rx: number
  ry: number
}

const QUIET_DAYS = 3

const CLEARING = art.clearing
/** How far down the painted clearing its grass begins, and where that line should sit in the scene. */
const GROUND_LINE = 0.5
const GROUND_LINE_Y = 640

function pick(lines: string[]): string {
  return lines[Math.floor(Math.random() * lines.length)]
}

function greeting(state: AppState): string {
  if (state.phase === 'asleep') return ''
  if (state.phase === 'naming') return 'Oh. Hello. It has been dark here a long while. What shall I answer to?'
  const open = state.tasks.filter((t) => t.status === 'open').length
  if (state.trees.length === 0) return 'Now then. What is on your mind? Tell me all of it, in any order.'
  if (open > 0 && daysQuiet() >= QUIET_DAYS) return 'The ember has not been fed in a while. No matter. One small thing would warm it.'
  if (open === 0) return 'The camp is quiet tonight. Tell me what is on your mind, or simply sit a while.'
  return open === 1 ? 'Welcome back. Sit. One leaf is waiting, and it is in no hurry.' : `Welcome back. Sit. ${open} leaves are waiting, and none of them are in a hurry.`
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
  const [light, setLight] = useState<LightBox | null>(null)
  const [scenery, setScenery] = useState<{ x: number; y: number; width: number } | null>(null)
  const stateRef = useRef(state)
  stateRef.current = state
  const appRef = useRef<HTMLElement>(null)

  useEffect(() => saveState(state), [state])
  useEffect(() => setSoundEnabled(state.soundOn), [state.soundOn])
  useEffect(() => logEvent('app_opened'), [])

  const tree = state.trees.find((t) => t.id === openTree)
  const asleep = state.phase === 'asleep'
  // Counted once per visit and again whenever something is finished.
  const stars = useMemo(() => Math.min(14 + daysLit() * 4, 90), [state.embers])
  const low = useMemo(() => daysQuiet() >= QUIET_DAYS, [state.embers])

  // The light is drawn across the whole screen but centred on the camp, so find where the camp sits.
  useLayoutEffect(() => {
    const app = appRef.current
    if (!app) return
    const measure = () => {
      const scene = app.querySelector<HTMLElement>('.scene.camp')
      const backdrop = app.querySelector<HTMLElement>('.backdrop')
      if (!scene || !backdrop) return
      const s = scene.getBoundingClientRect()
      const b = backdrop.getBoundingClientRect()
      const unit = s.width / SCENE.w
      const reach = asleep ? { rx: 0, ry: 0 } : lightReach(state.embers)
      setLight({ x: s.left - b.left + LIGHT.x * unit, y: s.top - b.top + LIGHT.y * unit, rx: reach.rx * unit, ry: reach.ry * unit })

      // Pin the painted clearing to the camp, so the edge of its grass always sits just behind the
      // trees whatever the shape of the screen, and scale it up until it covers the frame below that.
      const groundY = s.top - b.top + GROUND_LINE_Y * unit
      const aspect = CLEARING.w / CLEARING.h
      const width = Math.max(b.width, ((b.height - groundY) / (1 - GROUND_LINE)) * aspect)
      setScenery({ x: (b.width - width) / 2, y: groundY - GROUND_LINE * (width / aspect), width })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(app)
    return () => observer.disconnect()
  }, [state.embers, asleep, openTree, speech.choices, thinking])

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
      // New things land in the camp, so step back out of a tree to show them arriving.
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
      say(pick(['Well done. The ember liked that one.', 'There it goes. One less thing to carry, and a little more light.', 'Finished. The tree is glad of it, and so am I.']))
    } else {
      say(pick(['Let go. The branch is lighter for it.', 'Gone, and nothing lost by it.']))
    }
  }

  const lightVars = {
    ...(light ? { '--lx': `${light.x}px`, '--ly': `${light.y}px`, '--lrx': `${light.rx}px`, '--lry': `${light.ry}px` } : {}),
    ...(scenery ? { '--bx': `${scenery.x}px`, '--by': `${scenery.y}px`, '--bw': `${scenery.width}px` } : {}),
  } as CSSProperties

  return (
    <main ref={appRef} className={`app ${tree ? 'in-tree' : 'in-camp'}`} style={lightVars} onPointerDown={startMusic}>
      <div className="backdrop" aria-hidden="true">
        {!tree && <img className="night" src="art/clearing-night.webp" alt="" draggable={false} />}
        <Stars count={stars} />
        {!tree && <Fireflies />}
        {!tree && (
          <>
            {/* The light itself: a faint outer band, then the full colour of everything it reaches. */}
            <div className="glow">
              <img src="art/clearing.webp" alt="" draggable={false} />
            </div>
            <div className="lit">
              <img src="art/clearing.webp" alt="" draggable={false} />
            </div>
          </>
        )}
      </div>
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

      <div className="stage" key={tree ? tree.id : 'camp'}>
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
            <Forest state={state} speaking={typing || thinking} low={low} onOpenTree={setOpenTree} onWake={wake} />
          </div>
        )}
      </div>

      {asleep ? (
        <p className="hint wake-hint">Something lies in the dark grass. Tap it.</p>
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
