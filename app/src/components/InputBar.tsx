import { useRef, useState } from 'react'
import { PasteIcon, SendIcon } from './Icons'

interface InputBarProps {
  placeholder: string
  disabled: boolean
  onSend: (text: string) => void
}

/** The one place anything goes in: a task, a thought, or a pasted block. */
export function InputBar({ placeholder, disabled, onSend }: InputBarProps) {
  const [text, setText] = useState('')
  const field = useRef<HTMLTextAreaElement>(null)
  const [canPaste, setCanPaste] = useState(() => typeof navigator.clipboard?.readText === 'function')

  function resize() {
    const el = field.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 132)}px`
  }

  function send() {
    const value = text.trim()
    if (!value || disabled) return
    onSend(value)
    setText('')
    requestAnimationFrame(resize)
  }

  async function paste() {
    try {
      const clip = await navigator.clipboard.readText()
      if (clip) {
        setText((current) => (current ? `${current}\n${clip}` : clip))
        requestAnimationFrame(resize)
        field.current?.focus()
      }
    } catch {
      // Reading the clipboard is refused here, so stop offering it. Pasting with the keyboard still works.
      setCanPaste(false)
    }
  }

  return (
    <form
      className="input-bar"
      onSubmit={(event) => {
        event.preventDefault()
        send()
      }}
    >
      {canPaste && (
        <button type="button" className="icon-button" onClick={paste} aria-label="Paste">
          <PasteIcon />
        </button>
      )}
      <textarea
        ref={field}
        rows={1}
        value={text}
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(event) => {
          setText(event.target.value)
          resize()
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            send()
          }
        }}
      />
      <button type="submit" className="send" disabled={disabled || !text.trim()} aria-label="Send">
        <SendIcon />
      </button>
    </form>
  )
}
