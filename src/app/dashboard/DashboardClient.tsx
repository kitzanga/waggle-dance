'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { StoryCard } from '@/components/dashboard/StoryCard'
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

  const storyToDelete = deleteId
    ? stories.find((s) => s.id === deleteId)
    : null
  const deleteTitle = storyToDelete?.title || storyToDelete?.topic || 'Untitled'

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
          {stories.map((story) => (
            <StoryCard
              key={story.id}
              id={story.id}
              title={story.title}
              topic={story.topic}
              status={story.status}
              shareActive={story.share_active}
              updatedAt={story.updated_at}
              onDelete={setDeleteId}
            />
          ))}
        </div>
      </div>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Story"
      >
        <p
          className="mb-1"
          style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)' }}
        >
          Are you sure you want to delete{' '}
          <strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
            {deleteTitle}
          </strong>
          ?
        </p>
        <p
          className="mb-6"
          style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}
        >
          This can&apos;t be undone. The story and its share link will be permanently removed.
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
