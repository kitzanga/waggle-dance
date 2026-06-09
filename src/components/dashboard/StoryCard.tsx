'use client'

import Link from 'next/link'

interface StoryCardProps {
  id: string
  title: string | null
  topic: string
  status: string
  shareActive: boolean
  createdAt: string
  updatedAt: string
  onDelete: (id: string) => void
}

export function StoryCard({
  id,
  title,
  topic,
  status,
  shareActive,
  createdAt,
  updatedAt,
  onDelete,
}: StoryCardProps) {
  const displayTitle = title || topic || 'Untitled'
  const formattedDate = new Date(updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="group relative border border-[var(--color-border-subtle)] rounded-xl p-5 bg-[var(--color-surface-raised)] hover:border-[var(--color-border)] transition-colors">
      <Link
        href={`/stories/${id}`}
        className="block"
        aria-label={`Open story: ${displayTitle}`}
      >
        <h3 className="font-serif text-lg text-[var(--color-text-primary)] mb-1 line-clamp-2">
          {displayTitle}
        </h3>
        {title && topic && (
          <p className="text-sm text-[var(--color-text-muted)] mb-3 line-clamp-1">
            {topic}
          </p>
        )}
        <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)]">
          <span>{formattedDate}</span>
          <span
            className={`
              px-1.5 py-0.5 rounded
              ${status === 'complete' ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]' : ''}
              ${status === 'intake' ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]' : ''}
              ${status === 'error' ? 'bg-[var(--color-error)]/10 text-[var(--color-error)]' : ''}
              ${status === 'generating' ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]' : ''}
            `}
          >
            {status}
          </span>
          {shareActive && (
            <span className="text-[var(--color-accent)]">shared</span>
          )}
        </div>
      </Link>

      <button
        onClick={(e) => {
          e.preventDefault()
          onDelete(id)
        }}
        className="
          absolute top-3 right-3 opacity-0 group-hover:opacity-100
          p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-error)]
          hover:bg-[var(--color-surface-overlay)] transition-all
          min-h-[44px] min-w-[44px] flex items-center justify-center
        "
        aria-label={`Delete story: ${displayTitle}`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  )
}
