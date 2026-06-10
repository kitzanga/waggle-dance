'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useReducedMotion } from '@/lib/motion/intake'

interface GenerationTransitionProps {
  isActive: boolean
  message?: string
}

const PHRASES = [
  'Mapping the gap…',
  'Finding the tension…',
  'Locating the metaphor…',
  'Building the world…',
  'Writing the story…',
]

export function GenerationTransition({ isActive }: GenerationTransitionProps) {
  const shouldReduceMotion = useReducedMotion()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [bgTransitioned, setBgTransitioned] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Animate background from light to dark
  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => setBgTransitioned(true), 50)
      return () => clearTimeout(timer)
    }
  }, [isActive])

  // Cycle through phrases (no loop)
  useEffect(() => {
    if (!isActive) return

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= PHRASES.length - 1) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          return prev
        }
        return prev + 1
      })
    }, 4500)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isActive])

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
          {PHRASES[currentIndex]}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}
