'use client'

import type { IntakeMessage as IntakeMessageType } from '@/types/intake'

interface IntakeMessageProps {
  message: IntakeMessageType
}

export function IntakeMessage({ message }: IntakeMessageProps) {
  const isAssistant = message.role === 'assistant'

  return (
    <div
      className={`flex ${isAssistant ? 'justify-start' : 'justify-end'} mb-4`}
    >
      <div
        className={`
          max-w-[85%] rounded-2xl px-4 py-3 text-base leading-relaxed
          ${
            isAssistant
              ? 'bg-[var(--color-surface-raised)] text-[var(--color-text-primary)] rounded-bl-sm'
              : 'bg-[var(--color-accent-muted)] text-[var(--color-text-primary)] rounded-br-sm'
          }
        `}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  )
}
