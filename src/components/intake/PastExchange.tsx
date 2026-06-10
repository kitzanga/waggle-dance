'use client'

import { motion } from 'framer-motion'
import { useReducedMotion } from '@/lib/motion/intake'

interface PastExchangeProps {
  question: string
  answer: string
  isCollapsing: boolean
}

export function PastExchange({ question, answer, isCollapsing }: PastExchangeProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div>
      {/* Creator answer */}
      <p
        style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--text-secondary)',
          lineHeight: 1.65,
        }}
      >
        {answer}
      </p>

      {/* Hairline divider */}
      <div
        style={{
          height: '1px',
          background: 'var(--border-default)',
          margin: '8px 0',
        }}
      />

      {/* AI question (receded) */}
      <motion.p
        initial={
          isCollapsing && !shouldReduceMotion
            ? { fontSize: '20px', color: 'var(--text-primary)' }
            : false
        }
        animate={{ fontSize: '13px', color: 'var(--text-muted)' }}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }
        }
        style={{ lineHeight: 1.45 }}
      >
        {question}
      </motion.p>
    </div>
  )
}
