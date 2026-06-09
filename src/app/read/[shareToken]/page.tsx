import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { ReaderExperienceWrapper } from './ReaderExperienceWrapper'

interface SharePageProps {
  params: Promise<{ shareToken: string }>
}

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const { shareToken } = await params
  const supabase = await createClient()

  const { data: story } = await supabase
    .from('stories')
    .select('title, topic, share_active')
    .eq('share_token', shareToken)
    .eq('share_active', true)
    .single()

  if (!story) {
    return { title: 'Story not available' }
  }

  return {
    title: story.title || 'A Story',
    description: `A story about ${story.topic}`,
    openGraph: {
      title: story.title || 'A Story',
      description: `A story about ${story.topic}`,
      type: 'article',
    },
  }
}

export default async function SharePage({ params }: SharePageProps) {
  const { shareToken } = await params
  const supabase = await createClient()

  const { data: story } = await supabase
    .from('stories')
    .select('*')
    .eq('share_token', shareToken)
    .eq('share_active', true)
    .single()

  // Non-specific unavailable message for invalid, deactivated, or non-existent tokens
  if (!story) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)]">
        <p className="text-[var(--color-text-muted)] font-serif text-lg">
          This story is not available.
        </p>
      </div>
    )
  }

  // Map to client-friendly shape
  const mappedStory = {
    id: story.id,
    userId: story.user_id,
    title: story.title,
    topic: story.topic,
    status: story.status,
    sourceDocumentUrl: story.source_document_url,
    sourceDocumentType: story.source_document_type,
    intakeTranscript: [],
    intakeSignals: story.intake_signals || {},
    frameworkSelected: [],
    storyContent: story.story_content || [],
    previousVersions: [],
    visualStyle: story.visual_style,
    stylePrompt: story.style_prompt,
    visualsEnabled: story.visuals_enabled,
    shareToken: story.share_token,
    shareActive: story.share_active,
    createdAt: story.created_at,
    updatedAt: story.updated_at,
  }

  return <ReaderExperienceWrapper story={mappedStory} />
}
