import { useState } from 'react'
import art from '../data/art.json'
import { FLAT_EMBERS } from '../state/store'
import type { Task, Tree } from '../state/types'
import { EmberIcon } from './Icons'
import { ANCHORS, TASK_ANCHORS, TASK_SLOTS, TreeItem, TreeSprite, standing } from './TreeSprite'

interface TreeViewProps {
  tree: Tree
  /** Open tasks and those finished today, oldest first. */
  tasks: Task[]
  onBack: () => void
  onDone: (taskId: string) => void
  onDrop: (taskId: string) => void
}

function isFresh(iso: string | undefined): boolean {
  return !!iso && Date.now() - Date.parse(iso) < 2500
}

export function TreeView({ tree, tasks, onBack, onDone, onDrop }: TreeViewProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const onTree = tasks.slice(0, TASK_SLOTS)
  const overflow = tasks.slice(TASK_SLOTS).filter((t) => t.status === 'open')
  const chosen = tasks.find((t) => t.id === selected && t.status === 'open')

  return (
    <div className="tree-view">
      <header className="tree-header">
        <button type="button" className="icon-button" onClick={onBack} aria-label="Back to the forest">
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 12H5M11 6l-6 6 6 6" />
          </svg>
        </button>
        <h1>{tree.name}</h1>
        <div className="rule" aria-hidden="true">
          <i />
        </div>
      </header>

      <div className="scene-fit">
        <div className="scene">
          <TreeSprite footX={525} footY={1140} width={790}>
            {ANCHORS.map((_, slot) => {
              const task = onTree[TASK_ANCHORS.indexOf(slot)]
              if (!task) return <TreeItem key={slot} anchor={slot} size={0.15} kind="leaf" color={tree.color} />
              const done = task.status === 'done'
              return (
                <TreeItem
                  key={task.id}
                  taskId={task.id}
                  anchor={slot}
                  size={0.2}
                  exact
                  kind={done ? 'blossom' : 'leaf'}
                  color={tree.color}
                  fresh={done ? isFresh(task.closedAt) : isFresh(task.createdAt)}
                >
                  {done ? (
                    isFresh(task.closedAt) && (
                      <span className="ember-rise">
                        <EmberIcon size={18} /> +{FLAT_EMBERS}
                      </span>
                    )
                  ) : (
                    <button
                      type="button"
                      className={`leaf-tag ${selected === task.id ? 'selected' : ''}`}
                      onClick={() => setSelected(selected === task.id ? null : task.id)}
                    >
                      {task.title}
                      {task.due && <span className="tag-due">{task.due}</span>}
                    </button>
                  )}
                </TreeItem>
              )
            })}
          </TreeSprite>
          <div className="piece taper" style={{ ...standing(art['taper-idle'], 140, 1168, 200), zIndex: 2000 }}>
            <img className="sprite" src="art/taper-idle.webp" alt="" draggable={false} />
            {/* Where a flying ember lands: the flame in his lantern. */}
            <span className="lantern-target" style={{ left: '60%', top: '17%' }} />
          </div>
        </div>
      </div>

      {overflow.length > 0 && (
        <div className="overflow">
          <p>{overflow.length} more on this tree</p>
          {overflow.map((task) => (
            <button key={task.id} type="button" className={`leaf-tag ${selected === task.id ? 'selected' : ''}`} onClick={() => setSelected(task.id)}>
              {task.title}
            </button>
          ))}
        </div>
      )}

      {tasks.length === 0 && <p className="hint">Nothing on this tree yet. Tell the wizard what belongs here.</p>}

      {chosen && (
        <div className="sheet" role="dialog" aria-label={chosen.title}>
          <p className="sheet-title">{chosen.title}</p>
          {chosen.due && <p className="sheet-due">By {chosen.due}</p>}
          {chosen.note && <p className="sheet-note">{chosen.note}</p>}
          {chosen.said && chosen.said !== chosen.title && (
            <details className="sheet-said">
              <summary>What you said</summary>
              <p>{chosen.said}</p>
            </details>
          )}
          <div className="sheet-actions">
            <button
              type="button"
              className="pill solid"
              onClick={() => {
                onDone(chosen.id)
                setSelected(null)
              }}
            >
              Done
            </button>
            <button
              type="button"
              className="pill"
              onClick={() => {
                onDrop(chosen.id)
                setSelected(null)
              }}
            >
              Let it go
            </button>
            <button type="button" className="pill ghost" onClick={() => setSelected(null)}>
              Not yet
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
