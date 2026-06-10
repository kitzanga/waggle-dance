'use client'

import { motion } from 'framer-motion'
import { useReducedMotion } from '@/lib/motion/intake'

interface HeroExchangeProps {
  question: string
  isNew: boolean
}

export function HeroExchange({ question, isNew }: HeroExchangeProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={isNew && !shouldReduceMotion ? { opacity: 0, y: 12 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : { duration: 0.35, ease: [0.25, 0.1, 0.25, 1], delay: 0.05 }
      }
    >
      <p
        style={{
          fontSize: 'var(--text-question)',
          fontWeight: 'var(--text-question-weight)' as unknown as number,
          lineHeight: 'var(--text-question-leading)',
          letterSpacing: 'var(--text-question-tracking)',
          color: 'var(--text-primary)',
        }}
      >
        {question}
      </p>
    </motion.div>
  )
}
