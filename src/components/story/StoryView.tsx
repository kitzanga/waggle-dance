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
    // The parent should re-fetch the story after refinement
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Story header */}
      <header className="mb-8">
        <h1 className="font-serif text-3xl text-[var(--color-text-primary)] mb-2">
          {story.title || 'Untitled Story'}
        </h1>
        <p className="text-sm text-[var(--color-text-muted)]">
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
      <aside className="border-t border-[var(--color-border)] pt-6 space-y-6">
        {/* Regenerate */}
        <div>
          <Button variant="secondary" onClick={onRegenerate} className="w-full">
            Regenerate Entire Story
          </Button>
          <p className="text-xs text-[var(--color-text-muted)] mt-1 text-center">
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
          <span className="text-sm text-[var(--color-text-secondary)]">
            Include visuals when sharing
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={story.visualsEnabled}
            onClick={() => onToggleVisuals(!story.visualsEnabled)}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors
              ${story.visualsEnabled ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'}
            `}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${story.visualsEnabled ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
        </div>

        {/* Share toggle */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--color-text-secondary)]">
            Share link active
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={story.shareActive}
            onClick={() => onToggleShare(!story.shareActive)}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors
              ${story.shareActive ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'}
            `}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${story.shareActive ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
        </div>

        {story.shareActive && (
          <div className="bg-[var(--color-surface-raised)] rounded-lg p-3">
            <p className="text-xs text-[var(--color-text-muted)] mb-1">Share link</p>
            <code className="text-sm text-[var(--color-text-secondary)] break-all">
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
