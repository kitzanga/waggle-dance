'use client'

import { motion } from 'framer-motion'
import { useReducedMotion } from '@/lib/motion/intake'

type SegmentState = 'done' | 'active' | 'empty'

interface ProgressIndicatorProps {
  currentStep: number // 0-3
  completedSteps: number // 0-4
  visible: boolean
}

function getSegmentState(index: number, completedSteps: number): SegmentState {
  if (index < completedSteps) return 'done'
  if (index === completedSteps) return 'active'
  return 'empty'
}

function getSegmentColor(state: SegmentState): string {
  switch (state) {
    case 'done':
      return 'var(--progress-done)'
    case 'active':
      return 'var(--progress-active)'
    case 'empty':
      return 'var(--progress-empty)'
  }
}

export function ProgressIndicator({ completedSteps, visible }: ProgressIndicatorProps) {
  const shouldReduceMotion = useReducedMotion()

  if (!visible) return null

  return (
    <div
      className="flex items-center px-6"
      style={{
        height: '24px',
        maxWidth: 'var(--content-max)',
        margin: '0 auto',
        width: '100%',
        gap: '4px',
      }}
      role="progressbar"
      aria-valuenow={completedSteps}
      aria-valuemin={0}
      aria-valuemax={4}
      aria-label={`Intake progress: ${completedSteps} of 4 questions answered`}
    >
      {[0, 1, 2, 3].map((index) => {
        const state = getSegmentState(index, completedSteps)
        return (
          <motion.div
            key={index}
            className="flex-1"
            style={{
              height: '2px',
              borderRadius: '2px',
            }}
            animate={{ backgroundColor: getSegmentColor(state) }}
            transition={
              shouldReduceMotion ? { duration: 0 } : { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
            }
          />
        )
      })}
    </div>
  )
}
