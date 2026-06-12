'use client'

import { motion } from 'framer-motion'
import { useReducedMotion } from '@/lib/motion/intake'
import { CalibrationPrompt } from './CalibrationPrompt'
import { ContinueCTA } from './ContinueCTA'

interface CalibrationStepProps {
  prompt: string
  supportingCopy: string
  children: React.ReactNode
  onContinue: () => void
  canContinue: boolean
}

export function CalibrationStep({
  prompt,
  supportingCopy,
  children,
  onContinue,
  canContinue,
}: CalibrationStepProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }
      }
      style={{ paddingBottom: '24px' }}
    >
      <CalibrationPrompt prompt={prompt} supportingCopy={supportingCopy} />

      <div style={{ marginTop: '16px' }}>
        {children}
      </div>

      <ContinueCTA visible={canContinue} onClick={onContinue} />
    </motion.div>
  )
}
