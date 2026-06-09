'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { StoryCard } from '@/components/dashboard/StoryCard'
import { EmptyState } from '@/components/dashboard/EmptyState'
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

  return (
    <div className="min-h-screen">
      <header className="px-4 py-4 border-b border-[var(--color-border-subtle)] flex items-center justify-between">
        <h1 className="font-serif text-xl text-[var(--color-text-primary)]">
          Your Stories
        </h1>
        <Link href="/stories/new">
          <Button size="sm">New Story</Button>
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {stories.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-4">
            {stories.map((story) => (
              <StoryCard
                key={story.id}
                id={story.id}
                title={story.title}
                topic={story.topic}
                status={story.status}
                shareActive={story.share_active}
                createdAt={story.created_at}
                updatedAt={story.updated_at}
                onDelete={setDeleteId}
              />
            ))}
          </div>
        )}
      </main>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Story"
      >
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">
          This will permanently delete this story and its share link.
          This cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setDeleteId(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} loading={deleting}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  )
}
