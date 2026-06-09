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
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-center max-w-sm">
          <h2 className="text-[24px] font-semibold text-[var(--color-text-primary)] mb-2 tracking-tight">
            Your Library
          </h2>
          <p className="text-[15px] text-[var(--color-text-secondary)] mb-8 leading-relaxed">
            Stories you create will appear here. Start with the idea you need to
            communicate.
          </p>
          <Link href="/stories/new">
            <Button size="lg">Create Story</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-[var(--color-bg-primary)]/80 border-b border-[var(--color-separator)] px-6 py-4">
        <h1 className="text-[20px] font-semibold tracking-tight">Library</h1>
      </header>

      {/* Story grid */}
      <div className="px-6 py-6">
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
              >
                <div className="bg-[var(--color-bg-tertiary)] rounded-[var(--radius-lg)] p-5 transition-all duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)] hover:bg-[var(--color-bg-elevated)] hover:scale-[1.01]">
                  <h3 className="text-[15px] font-medium text-[var(--color-text-primary)] mb-1 line-clamp-2">
                    {displayTitle}
                  </h3>
                  {story.title && story.topic && (
                    <p className="text-[13px] text-[var(--color-text-tertiary)] mb-3 line-clamp-1">
                      {story.topic}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-[11px] text-[var(--color-text-quaternary)]">
                    <span>{date}</span>
                    {story.status === 'complete' && (
                      <span className="text-[var(--color-success)]">●</span>
                    )}
                    {story.share_active && (
                      <span className="text-[var(--color-accent)]">shared</span>
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
        <p className="text-[15px] text-[var(--color-text-secondary)] mb-6">
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
