import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StoryDetailClient } from './StoryDetailClient'

export default async function StoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: story, error } = await supabase
    .from('stories')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !story) {
    redirect('/dashboard')
  }

  // Map DB row to Story type
  const mappedStory = {
    id: story.id,
    userId: story.user_id,
    title: story.title,
    topic: story.topic,
    status: story.status,
    sourceDocumentUrl: story.source_document_url,
    sourceDocumentType: story.source_document_type,
    intakeTranscript: story.intake_transcript || [],
    intakeSignals: story.intake_signals || {},
    frameworkSelected: story.framework_selected || [],
    storyContent: story.story_content || [],
    previousVersions: story.previous_versions || [],
    visualStyle: story.visual_style,
    stylePrompt: story.style_prompt,
    visualsEnabled: story.visuals_enabled,
    shareToken: story.share_token,
    shareActive: story.share_active,
    createdAt: story.created_at,
    updatedAt: story.updated_at,
  }

  return <StoryDetailClient story={mappedStory} />
}
