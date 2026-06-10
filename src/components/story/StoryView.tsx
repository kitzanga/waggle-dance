'use client'

import { useState } from 'react'
import type { Story, VisualStyle } from '@/types/story'
import { useChapterRefinement } from '@/hooks/useChapterRefinement'
import { ChapterCard } from './ChapterCard'
import { StyleSelector } from './StyleSelector'
import { Button } from '@/components/ui/Button'

interface StoryViewProps {
  story: Story
  onRegenerate: () => void
  onStyleChange: (style: VisualStyle) => void
  onToggleVisuals: (enabled: boolean) => void
  onToggleShare: (active: boolean) => void
}

export function StoryView({
  story,
  onRegenerate,
  onStyleChange,
  onToggleVisuals,
  onToggleShare,
}: StoryViewProps) {
  const [refiningIndex, setRefiningIndex] = useState<number | null>(null)
  const { isRefining, refine } = useChapterRefinement({ storyId: story.id })

  async function handleRefineChapter(chapterIndex: number, direction: string) {
    setRefiningIndex(chapterIndex)
    await refine(chapterIndex, direction, story.storyContent)
    setRefiningIndex(null)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Story header */}
      <header className="mb-8">
        <h1
          className="mb-2"
          style={{ fontFamily: 'var(--font-reading)', fontSize: 'var(--text-2xl)', color: 'var(--text-primary)' }}
        >
          {story.title || 'Untitled Story'}
        </h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
          {story.storyContent.length} chapters · About {story.topic}
        </p>
      </header>

      {/* Chapters */}
      <div className="space-y-4 mb-8">
        {story.storyContent.map((chapter, i) => (
          <ChapterCard
            key={i}
            chapter={chapter}
            index={i}
            onRefine={(direction) => handleRefineChapter(i, direction)}
            isRefining={isRefining && refiningIndex === i}
          />
        ))}
      </div>

      {/* Controls panel */}
      <aside className="pt-6 space-y-6" style={{ borderTop: '1px solid var(--border-default)' }}>
        {/* Regenerate */}
        <div>
          <Button variant="secondary" onClick={onRegenerate} className="w-full">
            Regenerate Entire Story
          </Button>
          <p className="mt-1 text-center" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            Uses the same intake signals. Previous version will be saved.
          </p>
        </div>

        {/* Visual style */}
        <StyleSelector
          currentStyle={story.visualStyle}
          onChange={onStyleChange}
        />

        {/* Visuals toggle */}
        <div className="flex items-center justify-between">
          <span id="visuals-toggle-label" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            Include visuals when sharing
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={story.visualsEnabled}
            aria-labelledby="visuals-toggle-label"
            onClick={() => onToggleVisuals(!story.visualsEnabled)}
            className="relative inline-flex h-7 w-12 items-center rounded-full transition-colors min-w-[48px] min-h-[44px]"
            style={{ background: story.visualsEnabled ? 'var(--accent)' : 'var(--border-default)' }}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${story.visualsEnabled ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </button>
        </div>

        {/* Share toggle */}
        <div className="flex items-center justify-between">
          <span id="share-toggle-label" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            Share link active
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={story.shareActive}
            aria-labelledby="share-toggle-label"
            onClick={() => onToggleShare(!story.shareActive)}
            className="relative inline-flex h-7 w-12 items-center rounded-full transition-colors min-w-[48px] min-h-[44px]"
            style={{ background: story.shareActive ? 'var(--accent)' : 'var(--border-default)' }}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${story.shareActive ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </button>
        </div>

        {story.shareActive && (
          <div
            className="rounded-lg p-3"
            style={{ background: 'var(--surface-card)', border: '0.5px solid var(--border-default)' }}
          >
            <p className="mb-1" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Share link</p>
            <code className="break-all" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              {typeof window !== 'undefined'
                ? `${window.location.origin}/read/${story.shareToken}`
                : `/read/${story.shareToken}`}
            </code>
          </div>
        )}
      </aside>
    </div>
  )
}
