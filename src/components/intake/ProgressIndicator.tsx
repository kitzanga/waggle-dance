'use client'

import { motion } from 'framer-motion'
import { useReducedMotion } from '@/lib/motion/intake'

interface ProgressIndicatorProps {
  /** Number of conversational questions completed (0–4) */
  conversationProgress: number
  /** Number of calibration steps completed (0–6, for Q5–Q10) */
  calibrationProgress: number
  visible: boolean
}

export function ProgressIndicator({
  conversationProgress,
  calibrationProgress,
  visible,
}: ProgressIndicatorProps) {
  const shouldReduceMotion = useReducedMotion()

  if (!visible) return null

  const conversationFill = Math.min(conversationProgress / 4, 1) * 100
  const calibrationFill = Math.min(calibrationProgress / 6, 1) * 100

  return (
    <div
      className="flex items-center px-6"
      style={{
        height: '24px',
        maxWidth: 'var(--content-max)',
        margin: '0 auto',
        width: '100%',
        gap: '8px',
      }}
      role="progressbar"
      aria-valuenow={conversationProgress + calibrationProgress}
      aria-valuemin={0}
      aria-valuemax={10}
      aria-label={`Intake progress: ${conversationProgress + calibrationProgress} of 10 steps`}
    >
      {/* Conversation segment */}
      <div
        className="flex-1"
        style={{
          height: '2px',
          borderRadius: '2px',
          background: 'var(--progress-empty)',
          overflow: 'hidden',
        }}
      >
        <motion.div
          style={{
            height: '100%',
            borderRadius: '2px',
            background: conversationProgress >= 4
              ? 'var(--progress-done)'
              : 'var(--progress-active)',
          }}
          animate={{ width: `${conversationFill}%` }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
          }
        />
      </div>

      {/* Calibration segment */}
      <div
        className="flex-1"
        style={{
          height: '2px',
          borderRadius: '2px',
          background: 'var(--progress-empty)',
          overflow: 'hidden',
        }}
      >
        <motion.div
          style={{
            height: '100%',
            borderRadius: '2px',
            background: calibrationProgress >= 6
              ? 'var(--progress-done)'
              : 'var(--progress-active)',
          }}
          animate={{ width: `${calibrationFill}%` }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
          }
        />
      </div>
    </div>
  )
}
