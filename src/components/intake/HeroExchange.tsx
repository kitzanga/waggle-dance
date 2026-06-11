'use client'

interface HeroExchangeProps {
  question: string
  isNew: boolean
}

export function HeroExchange({ question }: HeroExchangeProps) {
  return (
    <div>
      <p
        style={{
          fontSize: 'var(--text-lg)',
          fontWeight: 400,
          lineHeight: 1.45,
          letterSpacing: '-0.015em',
          color: 'var(--text-primary)',
        }}
      >
        {question}
      </p>
    </div>
  )
}
