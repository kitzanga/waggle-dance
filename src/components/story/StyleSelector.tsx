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
      <legend className="mb-2" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
        Visual Style
      </legend>
      <div className="grid grid-cols-2 gap-2">
        {STYLES.map((style) => (
          <button
            key={style.value}
            type="button"
            onClick={() => onChange(style.value)}
            className="flex flex-col items-start p-3 rounded-lg transition-all duration-150 min-h-[44px]"
            style={{
              border: currentStyle === style.value
                ? '1px solid var(--accent)'
                : '0.5px solid var(--border-default)',
              background: currentStyle === style.value
                ? 'var(--accent-bg)'
                : 'var(--surface-card)',
              opacity: disabled ? 0.5 : 1,
              cursor: disabled ? 'not-allowed' : 'pointer',
            }}
            aria-pressed={currentStyle === style.value}
          >
            <span className="font-medium" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
              {style.label}
            </span>
            <span className="mt-0.5" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              {style.description}
            </span>
          </button>
        ))}
      </div>
    </fieldset>
  )
}
