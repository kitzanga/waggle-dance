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
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!isStreaming) textareaRef.current?.focus()
  }, [isStreaming])

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 160) + 'px'
    }
  }, [input])

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
    <div className="flex flex-col h-full">
      {/* Conversation area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 && (
          <div className="flex items-center justify-center min-h-[60vh] px-4">
            <div className="text-center max-w-md">
              <h2 className="text-[20px] font-medium text-[var(--color-text-primary)] mb-2">
                What idea do you need to communicate?
              </h2>
              <p className="text-[13px] text-[var(--color-text-tertiary)]">
                Describe the topic and who needs to hear it. I&apos;ll help you find the story.
              </p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <IntakeMessage key={i} message={msg} />
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Generate button */}
      {readyToGenerate && (
        <div className="px-6 py-3 border-t border-[var(--color-separator)]">
          <div className="max-w-[640px] mx-auto">
            <Button onClick={handleGenerate} className="w-full" size="lg">
              Generate Story
            </Button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="px-6 py-2">
          <p className="text-[13px] text-[var(--color-error)] text-center">{error}</p>
        </div>
      )}

      {/* Input area */}
      <div className="border-t border-[var(--color-separator)] px-6 py-4">
        <div className="max-w-[640px] mx-auto">
          <form onSubmit={handleSubmit} className="flex items-end gap-3">
            <DocumentUpload
              storyId={storyId}
              onUploadComplete={(result) => setDocumentContext(result.extractedText)}
              onUploadError={(err) => console.error('Upload error:', err)}
            />

            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your response..."
                disabled={isStreaming}
                rows={1}
                className="
                  w-full resize-none rounded-[var(--radius-md)] px-4 py-3
                  bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)]
                  placeholder:text-[var(--color-text-tertiary)]
                  focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]/30
                  transition-all duration-150
                  text-[15px] leading-[1.47]
                  min-h-[44px] max-h-[160px]
                  disabled:opacity-40
                "
                aria-label="Your response"
              />
            </div>

            <Button
              type="submit"
              disabled={!input.trim() || isStreaming}
              size="md"
              aria-label="Send"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
              </svg>
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
