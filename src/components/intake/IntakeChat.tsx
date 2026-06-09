'use client'

import { useState, useRef, useEffect } from 'react'
import { useIntake } from '@/hooks/useIntake'
import { IntakeMessage } from './IntakeMessage'
import { DocumentUpload } from './DocumentUpload'
import { Button } from '@/components/ui/Button'
import type { IntakeSignals } from '@/types/story'

interface IntakeChatProps {
  storyId: string
  initialMessages?: import('@/types/intake').IntakeMessage[]
  initialSignals?: Partial<IntakeSignals>
  onComplete: (signals: IntakeSignals) => void
}

export function IntakeChat({
  storyId,
  initialMessages,
  initialSignals,
  onComplete,
}: IntakeChatProps) {
  const [input, setInput] = useState('')
  const [documentContext, setDocumentContext] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const {
    messages,
    signals,
    isStreaming,
    readyToGenerate,
    error,
    sendMessage,
  } = useIntake({
    storyId,
    initialMessages,
    initialSignals,
    documentContext,
  })

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-focus input
  useEffect(() => {
    inputRef.current?.focus()
  }, [isStreaming])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || isStreaming) return
    sendMessage(input.trim())
    setInput('')
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  function handleGenerate() {
    const finalSignals: IntakeSignals = {
      topic: signals.topic || '',
      tension: signals.tension || null,
      audiencePortrait: signals.audiencePortrait || null,
      resistancePattern: signals.resistancePattern || null,
      stakes: signals.stakes || null,
      desiredShift: signals.desiredShift || null,
    }
    onComplete(finalSignals)
  }

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
        {messages.length === 0 && (
          <div className="text-center text-[var(--color-text-muted)] py-12">
            <p className="text-lg font-serif">
              Tell me about the idea you need to communicate.
            </p>
            <p className="text-sm mt-2">
              What&apos;s the topic, and who needs to hear it?
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <IntakeMessage key={i} message={msg} />
        ))}

        {isStreaming && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="flex justify-start mb-4">
            <div className="bg-[var(--color-surface-raised)] rounded-2xl rounded-bl-sm px-4 py-3">
              <span className="inline-flex gap-1">
                <span className="w-2 h-2 rounded-full bg-[var(--color-text-muted)] animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-[var(--color-text-muted)] animate-bounce [animation-delay:0.15s]" />
                <span className="w-2 h-2 rounded-full bg-[var(--color-text-muted)] animate-bounce [animation-delay:0.3s]" />
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Generate button */}
      {readyToGenerate && (
        <div className="px-4 pb-3">
          <Button onClick={handleGenerate} className="w-full" size="lg">
            Generate Story
          </Button>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="px-4 pb-2">
          <p className="text-sm text-[var(--color-error)] text-center">
            {error}
          </p>
        </div>
      )}

      {/* Input area */}
      <div className="border-t border-[var(--color-border-subtle)] px-4 py-3">
        <div className="flex items-end gap-2">
          <DocumentUpload
            storyId={storyId}
            onUploadComplete={(result) => {
              setDocumentContext(result.extractedText)
            }}
            onUploadError={(err) => {
              // Could surface this error, for now just log
              console.error('Upload error:', err)
            }}
          />

          <form onSubmit={handleSubmit} className="flex-1 flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your response..."
              disabled={isStreaming}
              rows={1}
              className="
                flex-1 resize-none rounded-xl px-4 py-3
                bg-[var(--color-surface-raised)] text-[var(--color-text-primary)]
                border border-[var(--color-border)]
                placeholder:text-[var(--color-text-muted)]
                focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]
                transition-colors duration-150
                min-h-[44px] max-h-[120px]
                disabled:opacity-50
              "
              aria-label="Your response"
            />
            <Button
              type="submit"
              disabled={!input.trim() || isStreaming}
              size="md"
              aria-label="Send message"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19V5m0 0l-7 7m7-7l7 7"
                />
              </svg>
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
