import { createClient } from '@/lib/supabase/server'
import { getAnthropicClient } from '@/lib/ai/client'
import { buildStorySystemPrompt } from '@/lib/ai/story-prompt'
import { createStreamingResponse } from '@/lib/ai/stream'
import type { IntakeSignals, VisualStyle, Chapter } from '@/types/story'

interface GenerateRequest {
  storyId: string
  signals: IntakeSignals
  visualStyle: VisualStyle
  documentContent?: string | null
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Unauthorized', code: 'AUTH_REQUIRED' }, { status: 401 })
  }

  const body: GenerateRequest = await request.json()
  const { storyId, signals, visualStyle } = body

  if (!storyId || !signals.topic) {
    return Response.json(
      { error: 'Missing required fields', code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }

  // Update story status to generating
  await supabase
    .from('stories')
    .update({ status: 'generating', visual_style: visualStyle })
    .eq('id', storyId)
    .eq('user_id', user.id)

  const systemPrompt = buildStorySystemPrompt(signals, visualStyle)
  const anthropic = getAnthropicClient()

  return createStreamingResponse(async function* () {
    yield { type: 'transition', message: 'Finding the story inside your challenge...' }

    try {
      const stream = anthropic.messages.stream({
        model: 'claude-sonnet-4-5-20250514',
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: 'Generate the story based on the intake signals provided in the system prompt.',
          },
        ],
      })

      let fullResponse = ''

      for await (const event of stream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          const token = event.delta.text
          fullResponse += token
          yield { type: 'token', content: token }
        }
      }

      // Parse the JSON response
      const jsonMatch = fullResponse.match(/```json\n([\s\S]*?)\n```/)
      const jsonContent = jsonMatch ? jsonMatch[1] : fullResponse

      let parsed: {
        title: string
        chapters: Array<{ title: string; body: string; imagePrompt: string }>
        frameworksUsed: string[]
      }

      try {
        parsed = JSON.parse(jsonContent)
      } catch {
        // Try to find JSON without code fences
        const rawJsonMatch = fullResponse.match(/\{[\s\S]*"chapters"[\s\S]*\}/)
        if (rawJsonMatch) {
          parsed = JSON.parse(rawJsonMatch[0])
        } else {
          throw new Error('Failed to parse story output')
        }
      }

      // Validate chapter count and content
      if (!parsed.chapters || parsed.chapters.length < 3 || parsed.chapters.length > 5) {
        throw new Error('Story must contain 3-5 chapters')
      }

      const storyContent: Chapter[] = parsed.chapters.map((ch) => ({
        title: ch.title,
        body: ch.body,
        imagePrompt: ch.imagePrompt,
        imageUrl: null, // Stubbed in v1
      }))

      // Emit chapter events for UI
      for (let i = 0; i < storyContent.length; i++) {
        yield { type: 'chapter_start', index: i, title: storyContent[i].title }
        yield { type: 'chapter_complete', index: i, imagePrompt: storyContent[i].imagePrompt }
      }

      // Save to database
      await supabase
        .from('stories')
        .update({
          title: parsed.title,
          status: 'complete',
          story_content: storyContent,
          framework_selected: parsed.frameworksUsed || [],
          intake_signals: signals,
        })
        .eq('id', storyId)
        .eq('user_id', user.id)

      yield {
        type: 'story_complete',
        title: parsed.title,
        frameworkSelected: parsed.frameworksUsed || [],
      }
    } catch (error) {
      // Update status to error
      await supabase
        .from('stories')
        .update({ status: 'error' })
        .eq('id', storyId)
        .eq('user_id', user.id)

      yield {
        type: 'error',
        message: error instanceof Error ? error.message : 'Story generation failed',
      }
    }
  })
}
