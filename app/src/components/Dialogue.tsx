import { useEffect, useRef, useState } from 'react'
import { blip } from '../lib/sound'

interface DialogueProps {
  name: string | null
  text: string
  /** Changes whenever a new line starts, so the same words can be spoken twice. */
  turn: number
  thinking: boolean
  choices?: string[]
  onChoice: (choice: string) => void
  onTyping: (typing: boolean) => void
}

const MS_PER_LETTER = 26

/** Taper's speech box: letters appear one at a time with a blip, as in an old game. Tap to finish at once. */
export function Dialogue({ name, text, turn, thinking, choices, onChoice, onTyping }: DialogueProps) {
  const [shown, setShown] = useState(0)
  const skip = useRef(false)

  useEffect(() => {
    setShown(0)
    skip.current = false
    if (!text) return
    onTyping(true)
    let count = 0
    const timer = setInterval(() => {
      count = skip.current ? text.length : count + 1
      setShown(count)
      if (!skip.current && count % 2 === 0 && /\w/.test(text[count - 1] ?? '')) blip()
      if (count >= text.length) {
        clearInterval(timer)
        onTyping(false)
      }
    }, MS_PER_LETTER)
    return () => {
      clearInterval(timer)
      onTyping(false)
    }
    // onTyping is stable for the life of the app.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, turn])

  const finished = shown >= text.length

  return (
    <div className="dialogue-wrap">
      <div className="dialogue" onClick={() => {
          skip.current = true
        }} role="status" aria-live="polite">
        {name && <span className="nameplate">{name}</span>}
        <p>
          {thinking ? <span className="thinking">. . .</span> : text.slice(0, shown)}
          {/* The unseen remainder keeps the box from changing height as letters arrive. */}
          {!thinking && <span className="unseen">{text.slice(shown)}</span>}
        </p>
        {finished && !thinking && <span className="more" aria-hidden="true" />}
      </div>
      {finished && !thinking && choices && choices.length > 0 && (
        <div className="choices">
          {choices.map((choice, i) => (
            <button key={choice} type="button" className={`pill ${i === 0 ? 'solid' : ''}`} onClick={() => onChoice(choice)}>
              {choice}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
