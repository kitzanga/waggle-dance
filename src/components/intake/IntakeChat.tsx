'use client'

import { useState, useRef, useCallback } from 'react'
import { useIntake } from '@/hooks/useIntake'
import { OpeningState } from './OpeningState'
import { ExchangeList } from './ExchangeList'
import { ProgressIndicator } from './ProgressIndicator'
import { InputBar } from './InputBar'
import type { IntakeSignals } from '@/types/story'

interface Exchange {
  question: string
  answer: string | null
}

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
  const [documentContext, setDocumentContext] = useState<string | null>(null)
  const [attachError, setAttachError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  // Convert flat messages into exchange pairs.
  // Each exchange = one AI question + the user's answer to it.
  // The user's first message is the answer to the opening "What's the idea?" prompt
  // shown in the OpeningState. We need to pair it correctly.
  const exchanges: Exchange[] = []

  // Find the first user message index and first assistant message index
  const firstUserIdx = messages.findIndex((m) => m.role === 'user')
  const firstAssistantIdx = messages.findIndex((m) => m.role === 'assistant')

  if (firstUserIdx === 0 && firstAssistantIdx >= 1) {
    // User message came first (typed into OpeningState).
    // Pair it with "What's the idea?" as a completed exchange.
    exchanges.push({
      question: "What's the idea?",
      answer: messages[0].content,
    })
    // Process remaining assistant messages starting from the first one,
    // but skip if it's just repeating "What's the idea?"
    for (let i = firstAssistantIdx; i < messages.length; i++) {
      const msg = messages[i]
      if (msg.role === 'assistant' && msg.content) {
        // Skip duplicate "What's the idea?" from AI (already shown as synthetic exchange)
        const normalized = msg.content.trim().toLowerCase().replace(/[?'"']/g, '')
        if (i === firstAssistantIdx && normalized.includes('whats the idea')) {
          continue
        }
        const nextMsg = messages[i + 1]
        exchanges.push({
          question: msg.content,
          answer: nextMsg?.role === 'user' ? nextMsg.content : null,
        })
      }
    }
  } else {
    // Standard case: messages start with assistant (e.g., loaded from transcript)
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i]
      if (msg.role === 'assistant' && msg.content) {
        const nextMsg = messages[i + 1]
        exchanges.push({
          question: msg.content,
          answer: nextMsg?.role === 'user' ? nextMsg.content : null,
        })
      }
    }
  }

  const hasStarted = messages.length > 0
  const showOpening = !hasStarted

  // Calculate progress from signals
  const completedSteps = [
    signals.topic,
    signals.desiredShift,
    signals.audiencePortrait,
    signals.resistancePattern,
  ].filter(Boolean).length

  function handleSubmit(text: string) {
    sendMessage(text)
  }

  const handleAttach = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ]
    if (!validTypes.includes(file.type)) {
      setAttachError('Only PDF, PPTX, and DOCX files are supported')
      setTimeout(() => setAttachError(null), 5000)
      e.target.value = ''
      return
    }

    // Validate file size (20MB)
    if (file.size > 20 * 1024 * 1024) {
      setAttachError('File must be under 20 MB')
      setTimeout(() => setAttachError(null), 5000)
      e.target.value = ''
      return
    }

    // Upload the file
    uploadFile(file)
    e.target.value = ''
  }

  async function uploadFile(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('storyId', storyId)

    try {
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      })
      if (response.ok) {
        const result = await response.json()
        setDocumentContext(result.extractedText)
      } else {
        setAttachError('Could not read document. Try a different file.')
        setTimeout(() => setAttachError(null), 5000)
      }
    } catch {
      setAttachError('Upload failed. Please try again.')
      setTimeout(() => setAttachError(null), 5000)
    }
  }

  // When ready to generate, auto-complete
  if (readyToGenerate) {
    const finalSignals: IntakeSignals = {
      topic: signals.topic || '',
      tension: signals.tension || null,
      audiencePortrait: signals.audiencePortrait || null,
      resistancePattern: signals.resistancePattern || null,
      stakes: signals.stakes || null,
      desiredShift: signals.desiredShift || null,
    }
    // Use a timeout to avoid calling during render
    setTimeout(() => onComplete(finalSignals), 0)
  }

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 'calc(100vh - 48px)' }}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.pptx"
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
      />

      {/* Conversation area — bottom-anchored, content grows upward */}
      <div className="flex-1 flex flex-col justify-end overflow-hidden">
        {showOpening ? (
          <OpeningState visible={true} />
        ) : (
          <ExchangeList exchanges={exchanges} isStreaming={isStreaming} />
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="px-6 py-2">
          <p
            className="text-center"
            style={{ fontSize: 'var(--text-xs)', color: '#ff453a' }}
          >
            {error}
          </p>
        </div>
      )}

      {/* Progress indicator */}
      <ProgressIndicator
        currentStep={completedSteps}
        completedSteps={completedSteps}
        visible={hasStarted}
      />

      {/* Input bar */}
      <InputBar
        onSubmit={handleSubmit}
        onAttach={handleAttach}
        isDisabled={isStreaming}
        attachError={attachError}
      />
    </div>
  )
}
