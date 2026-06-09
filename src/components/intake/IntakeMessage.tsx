'use client'

import type { IntakeMessage as IntakeMessageType } from '@/types/intake'

interface IntakeMessageProps {
  message: IntakeMessageType
}

export function IntakeMessage({ message }: IntakeMessageProps) {
  const isAssistant = message.role === 'assistant'

  return (
    <div className="py-4 border-b border-[var(--color-separator)]">
      <div className={`max-w-[var(--content-max-width)] mx-auto ${isAssistant ? '' : 'pl-8 opacity-70'}`}>
        <p className={`
          text-[15px] leading-[1.6] whitespace-pre-wrap
          ${isAssistant ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'}
        `}>
          {message.content}
        </p>
      </div>
    </div>
  )
}
