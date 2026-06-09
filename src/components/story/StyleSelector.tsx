'use client'

import type { VisualStyle } from '@/types/story'

interface StyleSelectorProps {
  currentStyle: VisualStyle
  onChange: (style: VisualStyle) => void
  disabled?: boolean
}

const STYLES: { value: VisualStyle; label: string; description: string }[] = [
  { value: 'watercolor', label: 'Watercolor', description: 'Warm light, soft edges, emotional' },
  { value: 'manga', label: 'Manga', description: 'Bold lines, high contrast, graphic' },
  { value: 'flat', label: 'Flat', description: 'Clean, modern, geometric warmth' },
  { value: 'ink_sketch', label: 'Ink Sketch', description: 'Loose, gestural, hand-drawn' },
]

export function StyleSelector({ currentStyle, onChange, disabled }: StyleSelectorProps) {
  return (
    <fieldset className="space-y-2" disabled={disabled}>
      <legend className="text-sm text-[var(--color-text-secondary)] mb-2">
        Visual Style
      </legend>
      <div className="grid grid-cols-2 gap-2">
        {STYLES.map((style) => (
          <button
            key={style.value}
            type="button"
            onClick={() => onChange(style.value)}
            className={`
              flex flex-col items-start p-3 rounded-lg border transition-all duration-150
              min-h-[44px]
              ${
                currentStyle === style.value
                  ? 'border-[var(--color-accent)] bg-[var(--color-surface-overlay)]'
                  : 'border-[var(--color-border-subtle)] bg-[var(--color-surface-raised)] hover:border-[var(--color-border)]'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            aria-pressed={currentStyle === style.value}
          >
            <span className="text-sm font-medium text-[var(--color-text-primary)]">
              {style.label}
            </span>
            <span className="text-xs text-[var(--color-text-muted)] mt-0.5">
              {style.description}
            </span>
          </button>
        ))}
      </div>
    </fieldset>
  )
}
