'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

interface StoryRow {
  id: string
  title: string | null
  topic: string
  status: string
  share_active: boolean
  created_at: string
  updated_at: string
}

interface DashboardClientProps {
  stories: StoryRow[]
}

export function DashboardClient({ stories }: DashboardClientProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)

    const supabase = createClient()
    await supabase.from('stories').delete().eq('id', deleteId)

    setDeleteId(null)
    setDeleting(false)
    router.refresh()
  }

  if (stories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4" style={{ minHeight: 'calc(100vh - 48px)' }}>
        <div className="text-center max-w-sm">
          <h2
            className="mb-2 tracking-tight"
            style={{
              fontSize: 'var(--text-xl)',
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}
          >
            Your Library
          </h2>
          <p
            className="mb-8 leading-relaxed"
            style={{
              fontSize: 'var(--text-base)',
              color: 'var(--text-secondary)',
            }}
          >
            Stories you create will appear here. Start with the idea you need to
            communicate.
          </p>
          <Link
            href="/stories/new"
            className="inline-flex items-center justify-center font-medium transition-all duration-150"
            style={{
              background: 'var(--accent)',
              color: '#ffffff',
              borderRadius: '9999px',
              padding: '10px 24px',
              fontSize: 'var(--text-base)',
              minHeight: '44px',
            }}
          >
            Create Story
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 48px)' }}>
      {/* Header */}
      <header className="px-6 py-5">
        <h1
          className="tracking-tight"
          style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 600,
            color: 'var(--text-primary)',
          }}
        >
          Library
        </h1>
      </header>

      {/* Story grid */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stories.map((story) => {
            const displayTitle = story.title || story.topic || 'Untitled'
            const date = new Date(story.updated_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })

            return (
              <Link
                key={story.id}
                href={`/stories/${story.id}`}
                className="group block"
                aria-label={`Open story: ${displayTitle}`}
              >
                <div
                  className="p-5 transition-all duration-200 hover:scale-[1.01]"
                  style={{
                    background: 'var(--surface-card)',
                    border: '0.5px solid var(--border-default)',
                    borderRadius: 'var(--radius-lg)',
                  }}
                >
                  <h3
                    className="mb-1 line-clamp-2"
                    style={{
                      fontSize: 'var(--text-base)',
                      fontWeight: 500,
                      color: 'var(--text-primary)',
                    }}
                  >
                    {displayTitle}
                  </h3>
                  {story.title && story.topic && (
                    <p
                      className="mb-3 line-clamp-1"
                      style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {story.topic}
                    </p>
                  )}
                  <div
                    className="flex items-center gap-2"
                    style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <span>{date}</span>
                    {story.status === 'complete' && (
                      <span style={{ color: '#30d158' }}>●</span>
                    )}
                    {story.share_active && (
                      <span style={{ color: 'var(--accent)' }}>shared</span>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Story"
      >
        <p
          className="mb-6"
          style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)' }}
        >
          This will permanently delete this story and its share link.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" size="sm" onClick={() => setDeleteId(null)}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={handleDelete} loading={deleting}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  )
}
