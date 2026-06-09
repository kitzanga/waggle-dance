'use client'

import { useState, useCallback } from 'react'
import { readStream } from '@/lib/ai/stream'
import type { Chapter } from '@/types/story'
import type { RefinementStreamEvent } from '@/types/api'

interface UseChapterRefinementOptions {
  storyId: string
}

export function useChapterRefinement({ storyId }: UseChapterRefinementOptions) {
  const [isRefining, setIsRefining] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [revisedChapter, setRevisedChapter] = useState<Chapter | null>(null)
  const [error, setError] = useState<string | null>(null)

  const refine = useCallback(
    async (chapterIndex: number, direction: string, fullStory: Chapter[]) => {
      setError(null)
      setIsRefining(true)
      setStreamingContent('')
      setRevisedChapter(null)

      try {
        const response = await fetch('/api/stories/refine', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ storyId, chapterIndex, direction, fullStory }),
        })

        if (!response.ok) {
          throw new Error('Refinement request failed')
        }

        for await (const event of readStream<RefinementStreamEvent>(response)) {
          switch (event.type) {
            case 'token':
              setStreamingContent((prev) => prev + event.content)
              break

            case 'chapter_complete':
              setRevisedChapter(event.chapter)
              break

            case 'error':
              setError(event.message)
              break
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Refinement failed')
      } finally {
        setIsRefining(false)
      }
    },
    [storyId]
  )

  const reset = useCallback(() => {
    setStreamingContent('')
    setRevisedChapter(null)
    setError(null)
  }, [])

  return {
    isRefining,
    streamingContent,
    revisedChapter,
    error,
    refine,
    reset,
  }
}
