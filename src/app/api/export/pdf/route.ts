import { createClient } from '@/lib/supabase/server'
import { generatePdfHtml } from '@/lib/export/pdf'
import type { Story } from '@/types/story'

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Unauthorized', code: 'AUTH_REQUIRED' }, { status: 401 })
  }

  const { storyId } = await request.json()

  if (!storyId) {
    return Response.json(
      { error: 'Missing storyId', code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }

  const { data: story, error } = await supabase
    .from('stories')
    .select('*')
    .eq('id', storyId)
    .eq('user_id', user.id)
    .single()

  if (error || !story) {
    return Response.json(
      { error: 'Story not found', code: 'NOT_FOUND' },
      { status: 404 }
    )
  }

  if (story.status !== 'complete') {
    return Response.json(
      { error: 'Story is not complete', code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }

  // Map DB row to Story type for the HTML generator
  const mappedStory: Story = {
    id: story.id,
    userId: story.user_id,
    title: story.title,
    topic: story.topic,
    status: story.status,
    sourceDocumentUrl: story.source_document_url,
    sourceDocumentType: story.source_document_type,
    intakeTranscript: [],
    intakeSignals: story.intake_signals || {},
    frameworkSelected: story.framework_selected || [],
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

  try {
    const html = generatePdfHtml(mappedStory)

    // For v1, return the print-optimized HTML
    // In production, this would use Puppeteer to generate actual PDF
    // For now, return HTML that can be printed/saved as PDF via the browser
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="${(story.title || 'story').replace(/[^a-z0-9]/gi, '-')}.html"`,
      },
    })
  } catch {
    return Response.json(
      { error: 'PDF generation failed', code: 'GENERATION_FAILED' },
      { status: 500 }
    )
  }
}
