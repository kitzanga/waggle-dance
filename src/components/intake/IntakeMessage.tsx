'use client'

import type { IntakeMessage as IntakeMessageType } from '@/types/intake'

interface IntakeMessageProps {
  message: IntakeMessageType
}

export function IntakeMessage({ message }: IntakeMessageProps) {
  const isAssistant = message.role === 'assistant'

  return (
    <div className="py-4 border-b border-[var(--color-separator)] last:border-b-0">
      <div className={`max-w-[var(--content-max-width)] mx-auto px-6 ${isAssistant ? '' : 'pl-14 opacity-70'}`}>
        {message.content ? (
          <p className={`
            text-[15px] leading-[1.6] whitespace-pre-wrap
            ${isAssistant ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'}
          `}>
            {message.content}
          </p>
        ) : isAssistant ? (
          <div className="flex gap-1.5 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-tertiary)] animate-pulse" />
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-tertiary)] animate-pulse [animation-delay:150ms]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-tertiary)] animate-pulse [animation-delay:300ms]" />
          </div>
        ) : null}
      </div>
    </div>
  )
}
