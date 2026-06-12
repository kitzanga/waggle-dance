'use client'

import { useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { HeroExchange } from './HeroExchange'
import { PastExchange } from './PastExchange'
import { useReducedMotion } from '@/lib/motion/intake'

interface Exchange {
  question: string
  answer: string | null
}

interface ExchangeListProps {
  exchanges: Exchange[]
  isStreaming: boolean
}

const easeDefault: [number, number, number, number] = [0.25, 0.1, 0.25, 1]

export function ExchangeList({ exchanges, isStreaming }: ExchangeListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [exchanges.length])

  if (exchanges.length === 0) return null

  // The hero exchange is the last one (most recent AI question)
  const heroIndex = exchanges.length - 1
  const hero = exchanges[heroIndex]
  const past = exchanges.slice(0, heroIndex)

  return (
    <>
      {/* Past exchanges — opacity recedes, no position animation */}
      {past.map((exchange, i) => (
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
            isReceding={i === past.length - 1}
          />
        </motion.div>
      ))}

      {/* Hero exchange (newest) — fades and slides up */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`hero-${heroIndex}`}
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : {
                  duration: 0.4,
                  delay: 0.08,
                  ease: [0.16, 1, 0.3, 1], // ease-out-expo — very smooth deceleration
                }
          }
          style={{ paddingBottom: '24px', willChange: 'opacity, transform' }}
        >
          <HeroExchange
            question={hero.question}
            isNew={!isStreaming}
          />
          {hero.answer && (
            <>
              <div
                style={{
                  height: '1px',
                  background: 'var(--border-default)',
                  margin: '8px 0',
                }}
              />
              <p
                style={{
                  fontSize: 'var(--text-base)',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.65,
                }}
              >
                {hero.answer}
              </p>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Scroll anchor */}
      <div ref={bottomRef} />
    </>
  )
}
