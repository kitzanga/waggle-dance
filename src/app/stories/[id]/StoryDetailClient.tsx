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
    await supabase
      .from('stories')
      .update({
        previous_versions: [...story.previousVersions, story.storyContent],
        status: 'generating',
      })
      .eq('id', story.id)

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
      <div className="flex items-center justify-center px-4" style={{ minHeight: 'calc(100vh - 48px)' }}>
        <div className="text-center">
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-base)' }}>
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
    <div style={{ minHeight: 'calc(100vh - 48px)' }}>
      <header
        className="px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--border-default)' }}
      >
        <button
          onClick={() => router.push('/dashboard')}
          className="transition-colors min-h-[44px] flex items-center"
          style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}
          aria-label="Back to Dashboard"
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
