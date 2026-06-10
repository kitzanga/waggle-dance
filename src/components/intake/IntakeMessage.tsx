'use client'

import type { IntakeMessage as IntakeMessageType } from '@/types/intake'

interface IntakeMessageProps {
  message: IntakeMessageType
}

export function IntakeMessage({ message }: IntakeMessageProps) {
  const isAssistant = message.role === 'assistant'

  return (
    <div className="py-4 last:border-b-0" style={{ borderBottom: '1px solid var(--border-default)' }}>
      <div
        className={`mx-auto px-6 ${isAssistant ? '' : 'pl-14 opacity-70'}`}
        style={{ maxWidth: 'var(--content-max)' }}
      >
        {message.content ? (
          <p
            className="whitespace-pre-wrap"
            style={{
              fontSize: 'var(--text-base)',
              lineHeight: 1.6,
              color: isAssistant ? 'var(--text-primary)' : 'var(--text-secondary)',
            }}
          >
            {message.content}
          </p>
        ) : isAssistant ? (
          <div className="flex gap-1.5 py-1" role="status" aria-label="Loading response">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--text-muted)' }} aria-hidden="true" />
            <span className="w-1.5 h-1.5 rounded-full animate-pulse [animation-delay:150ms]" style={{ background: 'var(--text-muted)' }} aria-hidden="true" />
            <span className="w-1.5 h-1.5 rounded-full animate-pulse [animation-delay:300ms]" style={{ background: 'var(--text-muted)' }} aria-hidden="true" />
          </div>
        ) : null}
      </div>
    </div>
  )
}
