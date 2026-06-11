import { createClient } from '@/lib/supabase/server'
import { getAnthropicClient } from '@/lib/ai/client'
import { createStreamingResponse } from '@/lib/ai/stream'
import type { Chapter } from '@/types/story'
import type { CreativeBrief } from '@/types/creative-brief'

const SYSTEM_PROMPT = `[PLACEHOLDER — Writer system prompt coming in separate prompt]`

interface GenerateRequest {
  storyId: string
  creativeBrief: CreativeBrief
  revisionNotes?: string | null
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
  const { storyId, creativeBrief, revisionNotes } = body

  if (!storyId || !creativeBrief) {
    return Response.json(
      { error: 'Missing required fields', code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }

  // Update story status to generating
  await supabase
    .from('stories')
    .update({ status: 'generating' })
    .eq('id', storyId)
    .eq('user_id', user.id)

  const anthropic = getAnthropicClient()

  // Build the user message: creative brief + optional revision notes
  let userMessage = `Creative Brief:\n${JSON.stringify(creativeBrief, null, 2)}`
  if (revisionNotes) {
    userMessage += `\n\nRevision Notes (from editorial review):\n${revisionNotes}`
  }

  return createStreamingResponse(async function* () {
    try {
      const stream = anthropic.messages.stream({
        model: 'claude-sonnet-4-5',
        max_tokens: 8192,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: userMessage,
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

      // Validate chapter count
      if (!parsed.chapters || parsed.chapters.length < 3 || parsed.chapters.length > 5) {
        throw new Error('Story must contain 3-5 chapters')
      }

      const storyContent: Chapter[] = parsed.chapters.map((ch) => ({
        title: ch.title,
        body: ch.body,
        imagePrompt: ch.imagePrompt,
        imageUrl: null,
      }))

      // Emit chapter events for UI
      for (let i = 0; i < storyContent.length; i++) {
        yield { type: 'chapter_start', index: i, title: storyContent[i].title }
        yield { type: 'chapter_complete', index: i }
      }

      // Save to database
      await supabase
        .from('stories')
        .update({
          title: parsed.title,
          status: 'complete',
          story_content: storyContent,
        })
        .eq('id', storyId)
        .eq('user_id', user.id)

      // Emit full chapters for pipeline orchestrator consumption
      yield { type: 'chapters_payload', chapters: storyContent }

      yield {
        type: 'story_complete',
        title: parsed.title,
        chapters: storyContent,
      }
    } catch (error) {
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
