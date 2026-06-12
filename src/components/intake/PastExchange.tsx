'use client'

import { motion } from 'framer-motion'
import { useReducedMotion } from '@/lib/motion/intake'

interface PastExchangeProps {
  question: string
  answer: string
  isReceding: boolean
}

const easeDefault: [number, number, number, number] = [0.25, 0.1, 0.25, 1]

export function PastExchange({ question, answer, isReceding }: PastExchangeProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      animate={{ opacity: 1 }}
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : { duration: 0.3, ease: easeDefault }
      }
    >
      {/* AI question (receded) */}
      <p
        style={{
          fontSize: 'var(--text-base)',
          color: 'var(--text-muted)',
          lineHeight: 1.5,
        }}
      >
        {question}
      </p>

      {/* Hairline divider */}
      <div
        style={{
          height: '1px',
          background: 'var(--border-default)',
          margin: '8px 0',
        }}
      />

      {/* Creator answer */}
      <p
        style={{
          fontSize: 'var(--text-base)',
          color: 'var(--text-secondary)',
          lineHeight: 1.65,
        }}
      >
        {answer}
      </p>
    </motion.div>
  )
}
