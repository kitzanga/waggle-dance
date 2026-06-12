'use client'

import type { CalibrationOption } from '@/types/intake-payload'

interface SingleSelectCardProps {
  options: CalibrationOption[]
  selectedValue: string | null
  onSelect: (value: string) => void
}

export function SingleSelectCard({ options, selectedValue, onSelect }: SingleSelectCardProps) {
  return (
    <div
      role="radiogroup"
      className="flex flex-col"
      style={{ gap: '8px' }}
    >
      {options.map((option) => {
        const isSelected = selectedValue === option.value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onSelect(option.value)}
            className="text-left w-full"
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              border: `0.5px solid ${isSelected ? 'var(--accent-border)' : 'var(--border-default)'}`,
              background: isSelected ? 'var(--accent-bg)' : 'var(--surface-card)',
              cursor: 'pointer',
              transition: 'background-color 150ms, border-color 150ms',
              outline: 'none',
            }}
          >
            <span
              style={{
                display: 'block',
                fontSize: 'var(--text-base)',
                fontWeight: 500,
                color: 'var(--text-primary)',
                lineHeight: 1.4,
              }}
            >
              {option.label}
            </span>
            <span
              style={{
                display: 'block',
                fontSize: 'var(--text-sm)',
                color: 'var(--text-secondary)',
                lineHeight: 1.4,
                marginTop: '2px',
              }}
            >
              {option.description}
            </span>
          </button>
        )
      })}
    </div>
  )
}
