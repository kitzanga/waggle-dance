'use client'

import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PastExchange } from './PastExchange'
import { useReducedMotion } from '@/lib/motion/intake'

interface Exchange {
  question: string
  answer: string | null
}

interface ExchangeListProps {
  exchanges: Exchange[]
  isStreaming: boolean
  /** When true, all exchanges render as past (no hero). Used when conversation is complete. */
  hideHero?: boolean
}

const easeDefault: [number, number, number, number] = [0.25, 0.1, 0.25, 1]

export function ExchangeList({ exchanges, isStreaming, hideHero = false }: ExchangeListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [exchanges.length])

  if (exchanges.length === 0) return null

  // All exchanges render as past (completed) items
  const items = exchanges.filter((e) => e.answer !== null)

  return (
    <>
      {items.map((exchange, i) => (
        <motion.div
          key={`exchange-${i}`}
          initial={shouldReduceMotion ? false : { opacity: 0.7 }}
          animate={{ opacity: 1 }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { duration: 0.3, ease: easeDefault }
          }
          style={{ paddingBottom: '24px', willChange: 'opacity' }}
        >
          <PastExchange
            question={exchange.question}
            answer={exchange.answer || ''}
            isReceding={false}
          />
        </motion.div>
      ))}

      {/* Scroll anchor */}
      <div ref={bottomRef} />
    </>
  )
}
