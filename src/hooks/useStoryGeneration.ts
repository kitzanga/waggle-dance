'use client'

import { useState, useCallback } from 'react'
import { readStream } from '@/lib/ai/stream'
import type { IntakeSignals, VisualStyle, Chapter } from '@/types/story'
import type { GenerationStreamEvent } from '@/types/api'

type GenerationPhase = 'idle' | 'transition' | 'streaming' | 'complete' | 'error'

interface UseStoryGenerationOptions {
  storyId: string
}

export function useStoryGeneration({ storyId }: UseStoryGenerationOptions) {
  const [phase, setPhase] = useState<GenerationPhase>('idle')
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [title, setTitle] = useState<string | null>(null)
  const [streamingContent, setStreamingContent] = useState('')
  const [transitionMessage, setTransitionMessage] = useState('')
  const [error, setError] = useState<string | null>(null)

  const generate = useCallback(
    async (signals: IntakeSignals, visualStyle: VisualStyle) => {
      setError(null)
      setPhase('transition')
      setStreamingContent('')
      setChapters([])

      try {
        const response = await fetch('/api/stories/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ storyId, signals, visualStyle }),
        })

        if (!response.ok) {
          throw new Error('Generation request failed')
        }

        for await (const event of readStream<GenerationStreamEvent>(response)) {
          switch (event.type) {
            case 'transition':
              setTransitionMessage(event.message)
              // Hold transition state for at least 2 seconds
              await new Promise((resolve) => setTimeout(resolve, 2000))
              setPhase('streaming')
              break

            case 'token':
              setStreamingContent((prev) => prev + event.content)
              break

            case 'chapter_start':
              // A chapter is starting — could update UI
              break

            case 'chapter_complete':
              break

            case 'story_complete':
              setTitle(event.title)
              setPhase('complete')
              break

            case 'error':
              setError(event.message)
              setPhase('error')
              break
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Generation failed')
        setPhase('error')
      }
    },
    [storyId]
  )

  return {
    phase,
    chapters,
    title,
    streamingContent,
    transitionMessage,
    error,
    generate,
  }
}
