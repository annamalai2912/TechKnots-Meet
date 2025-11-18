import { useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'

import { useMeetingStore } from '../store/meetingStore'

interface ChatPanelProps {
  onSendMessage: (text: string) => Promise<void>
}

export function ChatPanel({ onSendMessage }: ChatPanelProps) {
  const { messages } = useMeetingStore()
  const [text, setText] = useState('')
  const listRef = useRef<HTMLDivElement | null>(null)

  const sortedMessages = useMemo(
    () => [...messages].sort((a, b) => a.timestamp - b.timestamp),
    [messages]
  )

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!text.trim()) return
    await onSendMessage(text.trim())
    setText('')
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }

  return (
    <aside
      className="glass"
      style={{
        minWidth: 320,
        maxWidth: 360,
        display: 'flex',
        flexDirection: 'column',
        height: '70vh',
        maxHeight: '70vh'
      }}
    >
      <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(4, 120, 87, 0.12)' }}>
        <h3 style={{ margin: 0 }}>Live chat</h3>
        <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem' }}>Share quick notes with the team.</p>
      </div>

      <div
        ref={listRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          minHeight: 0
        }}
      >
        {sortedMessages.map((message) => (
          <div
            key={message.id}
            style={{
              padding: '0.85rem 1rem',
              borderRadius: 16,
              background: 'rgba(4, 120, 87, 0.08)'
            }}
          >
            <strong style={{ display: 'block', fontSize: '0.9rem' }}>{message.sender.name}</strong>
            <p style={{ margin: '0.25rem 0 0', color: '#0f172a' }}>{message.text}</p>
            <small style={{ color: '#475569' }}>
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </small>
          </div>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        style={{ padding: '1.25rem', borderTop: '1px solid rgba(4, 120, 87, 0.12)', display: 'flex', gap: '0.75rem' }}
      >
        <input
          className="input"
          placeholder="Say something thoughtful…"
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
        <button className="btn" type="submit" style={{ paddingInline: '1.5rem' }}>
          Send
        </button>
      </form>
    </aside>
  )
}

