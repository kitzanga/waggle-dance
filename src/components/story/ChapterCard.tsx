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
    <article className="border border-[var(--color-border-subtle)] rounded-xl p-6 bg-[var(--color-surface-raised)]">
      <header className="flex items-start justify-between mb-4">
        <div>
          <span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wide">
            Chapter {index + 1}
          </span>
          <h3 className="font-serif text-lg text-[var(--color-text-primary)] mt-1">
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

      <div className="prose-reading text-base leading-relaxed text-[var(--color-text-secondary)]">
        <p className="whitespace-pre-wrap">{chapter.body}</p>
      </div>

      {showRefine && (
        <form onSubmit={handleSubmitRefinement} className="mt-4 pt-4 border-t border-[var(--color-border-subtle)]">
          <label htmlFor={`refine-${index}`} className="text-sm text-[var(--color-text-muted)] block mb-2">
            What would you like to change about this chapter?
          </label>
          <textarea
            id={`refine-${index}`}
            value={direction}
            onChange={(e) => setDirection(e.target.value.slice(0, 500))}
            placeholder="e.g., Make the stakes feel more urgent..."
            maxLength={500}
            rows={2}
            className="
              w-full resize-none rounded-lg px-4 py-3
              bg-[var(--color-surface)] text-[var(--color-text-primary)]
              border border-[var(--color-border)]
              placeholder:text-[var(--color-text-muted)]
              focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]
              text-sm
            "
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-[var(--color-text-muted)]">
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
