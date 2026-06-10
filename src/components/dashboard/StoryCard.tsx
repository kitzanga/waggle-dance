'use client'

import Link from 'next/link'

interface StoryCardProps {
  id: string
  title: string | null
  topic: string
  status: string
  shareActive: boolean
  createdAt?: string
  updatedAt: string
  onDelete: (id: string) => void
}

export function StoryCard({
  id,
  title,
  topic,
  status,
  shareActive,
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
    <div
      className="group relative p-5 transition-all duration-200 hover:scale-[1.01]"
      style={{
        background: 'var(--surface-card)',
        border: '0.5px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      <Link
        href={`/stories/${id}`}
        className="block"
        aria-label={`Open story: ${displayTitle}`}
      >
        <h3
          className="mb-1 line-clamp-2"
          style={{ fontFamily: 'var(--font-reading)', fontSize: 'var(--text-lg)', color: 'var(--text-primary)' }}
        >
          {displayTitle}
        </h3>
        {title && topic && (
          <p className="mb-3 line-clamp-1" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
            {topic}
          </p>
        )}
        <div className="flex items-center gap-3" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
          <span>{formattedDate}</span>
          <span
            className="px-1.5 py-0.5 rounded"
            style={{
              background: status === 'complete' ? 'rgba(48, 209, 88, 0.1)' : 'var(--accent-bg)',
              color: status === 'complete' ? '#30d158' : status === 'error' ? '#ff453a' : 'var(--accent)',
            }}
          >
            {status}
          </span>
          {shareActive && (
            <span style={{ color: 'var(--accent)' }}>shared</span>
          )}
        </div>
      </Link>

      <button
        onClick={(e) => {
          e.preventDefault()
          onDelete(id)
        }}
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-2 rounded-lg transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
        style={{ color: 'var(--text-muted)' }}
        aria-label={`Delete story: ${displayTitle}`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  )
}
