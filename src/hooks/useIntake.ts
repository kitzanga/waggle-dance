'use client'

import { useState, useCallback } from 'react'
import { readStream } from '@/lib/ai/stream'
import type { IntakeSignals } from '@/types/story'
import type { IntakeMessage } from '@/types/intake'
import type { IntakeStreamEvent } from '@/types/api'

interface UseIntakeOptions {
  storyId: string
  initialMessages?: IntakeMessage[]
  initialSignals?: Partial<IntakeSignals>
  documentContext?: string | null
}

export function useIntake({
  storyId,
  initialMessages = [],
  initialSignals = {},
  documentContext = null,
}: UseIntakeOptions) {
  const [messages, setMessages] = useState<IntakeMessage[]>(initialMessages)
  const [signals, setSignals] = useState<Partial<IntakeSignals>>(initialSignals)
  const [isStreaming, setIsStreaming] = useState(false)
  const [readyToGenerate, setReadyToGenerate] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(
    async (content: string) => {
      setError(null)
      setIsStreaming(true)

      const userMessage: IntakeMessage = {
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
      }

      const updatedMessages = [...messages, userMessage]
      setMessages(updatedMessages)

      try {
        const response = await fetch('/api/intake/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            storyId,
            message: content,
            signals,
            messages: updatedMessages,
            documentContext,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => null)
          throw new Error(errorData?.error || `Request failed: ${response.status}`)
        }

        let assistantContent = ''
        const assistantMessage: IntakeMessage = {
          role: 'assistant',
          content: '',
          timestamp: new Date().toISOString(),
        }

        setMessages((prev) => [...prev, assistantMessage])

        for await (const event of readStream<IntakeStreamEvent>(response)) {
          switch (event.type) {
            case 'token':
              assistantContent += event.content
              setMessages((prev) => {
                const updated = [...prev]
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  content: assistantContent,
                }
                return updated
              })
              break

            case 'signal_update':
              setSignals((prev) => ({
                ...prev,
                [event.signal]: event.value,
              }))
              break

            case 'ready_to_generate':
              setReadyToGenerate(true)
              setSignals(event.signals)
              break

            case 'done':
              break
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setIsStreaming(false)
      }
    },
    [storyId, messages, signals, documentContext]
  )

  return {
    messages,
    signals,
    isStreaming,
    readyToGenerate,
    error,
    sendMessage,
    setReadyToGenerate,
  }
}
