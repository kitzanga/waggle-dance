'use client'

import { ReaderExperience } from '@/components/reader/ReaderExperience'
import type { Story } from '@/types/story'

interface ReaderExperienceWrapperProps {
  story: Story
}

export function ReaderExperienceWrapper({ story }: ReaderExperienceWrapperProps) {
  return (
    <div
      data-mode="dark"
      className="min-h-screen"
      style={{
        backgroundColor: 'var(--surface-page)',
        color: 'var(--text-primary)',
      }}
    >
      <ReaderExperience story={story} />
    </div>
  )
}
