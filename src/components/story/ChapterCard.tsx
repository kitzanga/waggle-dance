'use client'

import { useState } from 'react'
import type { Chapter } from '@/types/story'
import { Button } from '@/components/ui/Button'

interface ChapterCardProps {
  chapter: Chapter
  index: number
  onRefine: (direction: string) => void
  isRefining?: boolean
}

export function ChapterCard({ chapter, index, onRefine, isRefining }: ChapterCardProps) {
  const [showRefine, setShowRefine] = useState(false)
  const [direction, setDirection] = useState('')

  function handleSubmitRefinement(e: React.FormEvent) {
    e.preventDefault()
    if (!direction.trim()) return
    onRefine(direction.trim())
    setDirection('')
    setShowRefine(false)
  }

  return (
    <article
      className="rounded-xl p-6"
      style={{
        background: 'var(--surface-card)',
        border: '0.5px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      <header className="flex items-start justify-between mb-4">
        <div>
          <span className="uppercase tracking-wide" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            Chapter {index + 1}
          </span>
          <h3 className="mt-1" style={{ fontFamily: 'var(--font-reading)', fontSize: 'var(--text-lg)', color: 'var(--text-primary)' }}>
            {chapter.title}
          </h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowRefine(!showRefine)}
          aria-expanded={showRefine}
        >
          Refine
        </Button>
      </header>

      <div className="leading-relaxed" style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)' }}>
        <p className="whitespace-pre-wrap">{chapter.body}</p>
      </div>

      {showRefine && (
        <form
          onSubmit={handleSubmitRefinement}
          className="mt-4 pt-4"
          style={{ borderTop: '1px solid var(--border-default)' }}
        >
          <label
            htmlFor={`refine-${index}`}
            className="block mb-2"
            style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}
          >
            What would you like to change about this chapter?
          </label>
          <textarea
            id={`refine-${index}`}
            value={direction}
            onChange={(e) => setDirection(e.target.value.slice(0, 500))}
            placeholder="e.g., Make the stakes feel more urgent..."
            maxLength={500}
            rows={2}
            className="w-full resize-none rounded-lg px-4 py-3 text-sm"
            style={{
              background: 'var(--surface-input)',
              color: 'var(--text-primary)',
              border: '0.5px solid var(--border-input)',
              outline: 'none',
            }}
          />
          <div className="flex items-center justify-between mt-2">
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              {direction.length}/500
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowRefine(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={!direction.trim() || isRefining}
                loading={isRefining}
              >
                Apply
              </Button>
            </div>
          </div>
        </form>
      )}
    </article>
  )
}
