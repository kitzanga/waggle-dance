'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { StoryView } from '@/components/story/StoryView'
import type { Story, VisualStyle } from '@/types/story'

interface StoryDetailClientProps {
  story: Story
}

export function StoryDetailClient({ story }: StoryDetailClientProps) {
  const router = useRouter()
  const supabase = createClient()

  async function handleRegenerate() {
    // Push current content to previous_versions, then redirect to regenerate
    await supabase
      .from('stories')
      .update({
        previous_versions: [...story.previousVersions, story.storyContent],
        status: 'generating',
      })
      .eq('id', story.id)

    // For now, redirect back to re-trigger generation
    // In a full implementation, this would call the generate API directly
    router.refresh()
  }

  async function handleStyleChange(style: VisualStyle) {
    await supabase
      .from('stories')
      .update({ visual_style: style })
      .eq('id', story.id)

    router.refresh()
  }

  async function handleToggleVisuals(enabled: boolean) {
    await supabase
      .from('stories')
      .update({ visuals_enabled: enabled })
      .eq('id', story.id)

    router.refresh()
  }

  async function handleToggleShare(active: boolean) {
    await supabase
      .from('stories')
      .update({ share_active: active })
      .eq('id', story.id)

    router.refresh()
  }

  if (story.status !== 'complete') {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center">
          <p className="text-[var(--color-text-secondary)]">
            {story.status === 'intake'
              ? 'This story is still in the intake phase.'
              : story.status === 'generating'
                ? 'This story is being generated...'
                : 'Something went wrong with this story.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <header className="px-4 py-3 border-b border-[var(--color-border-subtle)] flex items-center justify-between">
        <button
          onClick={() => router.push('/dashboard')}
          className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors min-h-[44px] flex items-center"
        >
          ← Dashboard
        </button>
      </header>
      <StoryView
        story={story}
        onRegenerate={handleRegenerate}
        onStyleChange={handleStyleChange}
        onToggleVisuals={handleToggleVisuals}
        onToggleShare={handleToggleShare}
      />
    </div>
  )
}
