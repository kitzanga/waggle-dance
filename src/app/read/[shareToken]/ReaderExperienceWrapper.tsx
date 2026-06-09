'use client'

import { ReaderExperience } from '@/components/reader/ReaderExperience'
import type { Story } from '@/types/story'

interface ReaderExperienceWrapperProps {
  story: Story
}

export function ReaderExperienceWrapper({ story }: ReaderExperienceWrapperProps) {
  return <ReaderExperience story={story} />
}
