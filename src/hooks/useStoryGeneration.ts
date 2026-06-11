'use client'

import { useState, useCallback, useRef } from 'react'
import { readStream } from '@/lib/ai/stream'
import type { IntakeSignals, VisualStyle, Chapter } from '@/types/story'
import type { PipelineEvent } from '@/types/pipeline'

type GenerationPhase = 'idle' | 'transition' | 'streaming' | 'complete' | 'error'

interface UseStoryGenerationOptions {
  storyId: string
}

export function useStoryGeneration({ storyId }: UseStoryGenerationOptions) {
  const [phase, setPhase] = useState<GenerationPhase>('idle')
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [title, setTitle] = useState<string | null>(null)
  const [streamingContent, setStreamingContent] = useState('')
  const [pipelineEvent, setPipelineEvent] = useState<PipelineEvent | null>(null)
  const [error, setError] = useState<string | null>(null)

  const generate = useCallback(
    async (signals: IntakeSignals, visualStyle: VisualStyle) => {
      setError(null)
      setPhase('transition')
      setStreamingContent('')
      setChapters([])

      try {
        // Call the pipeline endpoint which orchestrates all three stages
        const response = await fetch('/api/stories/pipeline', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ storyId, intakeSignals: signals, visualStyle }),
        })

        if (!response.ok) {
          throw new Error('Pipeline request failed')
        }

        for await (const event of readStream<PipelineEvent>(response)) {
          setPipelineEvent(event)

          switch (event.type) {
            case 'stage_change':
              if (event.stage === 'writing') {
                setPhase('streaming')
              }
              break

            case 'token':
              setStreamingContent((prev) => prev + event.token)
              break

            case 'story_complete':
              break

            case 'pipeline_complete':
              setPhase('complete')
              break

            case 'pipeline_error':
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
    pipelineEvent,
    error,
    generate,
  }
}
