'use client'

import { useRef, useEffect } from 'react'
import { HeroExchange } from './HeroExchange'
import { PastExchange } from './PastExchange'

interface Exchange {
  question: string
  answer: string | null
}

interface ExchangeListProps {
  exchanges: Exchange[]
  isStreaming: boolean
}

export function ExchangeList({ exchanges, isStreaming }: ExchangeListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [exchanges])

  if (exchanges.length === 0) return null

  // The hero exchange is the last one (most recent AI question)
  const heroIndex = exchanges.length - 1
  const hero = exchanges[heroIndex]
  const past = exchanges.slice(0, heroIndex)

  return (
    <div
      className="flex flex-col-reverse flex-1 overflow-y-auto px-6"
      style={{ maxWidth: 'var(--content-max)', margin: '0 auto', width: '100%' }}
    >
      {/* Scroll anchor */}
      <div ref={bottomRef} />

      {/* Hero exchange (newest, at the bottom visually) */}
      <div style={{ paddingBottom: '24px' }}>
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
                fontSize: 'var(--text-sm)',
                color: 'var(--text-secondary)',
                lineHeight: 1.65,
              }}
            >
              {hero.answer}
            </p>
          </>
        )}
      </div>

      {/* Past exchanges (rendered in reverse for flex-col-reverse) */}
      {[...past].reverse().map((exchange, i) => (
        <div key={i} style={{ paddingBottom: '24px' }}>
          <PastExchange
            question={exchange.question}
            answer={exchange.answer || ''}
            isCollapsing={i === 0 && past.length === heroIndex}
          />
        </div>
      ))}
    </div>
  )
}
