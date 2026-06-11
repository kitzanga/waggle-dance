'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useReducedMotion } from '@/lib/motion/intake'
import type { PipelineEvent } from '@/types/pipeline'

interface GenerationTransitionProps {
  isActive: boolean
  pipelineEvent?: PipelineEvent | null
}

/**
 * Maps pipeline events to display phrases.
 * Each phrase holds for a minimum of 4.5 seconds before advancing.
 */
const PHRASE_SEQUENCE = [
  'Mapping the gap…',
  'Finding the tension…',
  'Locating the metaphor…',
  'Building the world…',
  'Writing the story…',
  'Reading it back…',
  'Sharpening the edges…',
]

/** Maps pipeline events to the phrase index they should advance to. */
function getPhraseIndexForEvent(event: PipelineEvent): number | null {
  switch (event.type) {
    case 'stage_change':
      switch (event.stage) {
        case 'brief':
          return 0 // "Mapping the gap…"
        case 'writing':
          return 3 // "Building the world…"
        case 'editorial':
          return 5 // "Reading it back…"
        case 'revising':
          return 6 // "Sharpening the edges…"
      }
      break
    case 'brief_complete':
      return 1 // "Finding the tension…" → then "Locating the metaphor…"
    case 'chapter_start':
      if (event.chapterIndex === 0) return 4 // "Writing the story…"
      break
    case 'editorial_revise':
      return 6 // "Sharpening the edges…"
    case 'pipeline_complete':
      return null // triggers fade-out
  }
  return null
}

const MIN_PHRASE_DURATION = 4500 // ms

export function GenerationTransition({ isActive, pipelineEvent }: GenerationTransitionProps) {
  const shouldReduceMotion = useReducedMotion()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [bgTransitioned, setBgTransitioned] = useState(false)
  const lastAdvanceTime = useRef(Date.now())
  const pendingIndex = useRef<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Animate background from light to dark
  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => setBgTransitioned(true), 50)
      return () => clearTimeout(timer)
    }
  }, [isActive])

  // Advance to a target index, respecting minimum display time
  const advanceTo = useCallback((targetIndex: number) => {
    const elapsed = Date.now() - lastAdvanceTime.current
    const remaining = MIN_PHRASE_DURATION - elapsed

    if (remaining <= 0) {
      // Can advance immediately
      setCurrentIndex(targetIndex)
      lastAdvanceTime.current = Date.now()
      pendingIndex.current = null
    } else {
      // Queue the advance for after the minimum duration
      pendingIndex.current = targetIndex
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        if (pendingIndex.current !== null) {
          setCurrentIndex(pendingIndex.current)
          lastAdvanceTime.current = Date.now()
          pendingIndex.current = null
        }
      }, remaining)
    }
  }, [])

  // Auto-advance through phrases when no pipeline events drive it
  useEffect(() => {
    if (!isActive) return

    const interval = setInterval(() => {
      if (pendingIndex.current !== null) return // event-driven advance pending
      setCurrentIndex((prev) => {
        if (prev >= PHRASE_SEQUENCE.length - 1) return prev
        lastAdvanceTime.current = Date.now()
        return prev + 1
      })
    }, MIN_PHRASE_DURATION)

    return () => clearInterval(interval)
  }, [isActive])

  // React to pipeline events
  useEffect(() => {
    if (!pipelineEvent) return
    const targetIndex = getPhraseIndexForEvent(pipelineEvent)
    if (targetIndex !== null && targetIndex > currentIndex) {
      advanceTo(targetIndex)
    }
  }, [pipelineEvent, currentIndex, advanceTo])

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  if (!isActive) return null

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        backgroundColor: bgTransitioned ? '#000000' : '#f7f6f2',
        transition: shouldReduceMotion ? 'none' : 'background-color 600ms ease',
      }}
      role="status"
      aria-live="polite"
      aria-label="Generating your story"
    >
      <AnimatePresence mode="wait">
        <motion.p
          key={currentIndex}
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.8, ease: 'easeInOut' }}
          className="text-center px-6"
          style={{
            fontFamily: 'var(--font-reading)',
            fontSize: 'var(--text-xl)',
            color: '#ffffff',
            fontWeight: 400,
            fontStyle: 'italic',
          }}
        >
          {PHRASE_SEQUENCE[currentIndex]}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}
