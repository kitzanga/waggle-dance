import { createClient } from '@/lib/supabase/server'
import { getAnthropicClient } from '@/lib/ai/client'
import { buildRefinementSystemPrompt } from '@/lib/ai/refinement-prompt'
import { createStreamingResponse } from '@/lib/ai/stream'
import type { Chapter } from '@/types/story'

interface RefineRequest {
  storyId: string
  chapterIndex: number
  direction: string
  fullStory: Chapter[]
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Unauthorized', code: 'AUTH_REQUIRED' }, { status: 401 })
  }

  const body: RefineRequest = await request.json()
  const { storyId, chapterIndex, direction, fullStory } = body

  if (!storyId || chapterIndex === undefined || !direction || !fullStory) {
    return Response.json(
      { error: 'Missing required fields', code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }

  if (direction.length > 500) {
    return Response.json(
      { error: 'Direction must be 500 characters or fewer', code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }

  if (chapterIndex < 0 || chapterIndex >= fullStory.length) {
    return Response.json(
      { error: 'Invalid chapter index', code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }

  const systemPrompt = buildRefinementSystemPrompt(chapterIndex, fullStory, direction)
  const anthropic = getAnthropicClient()

  return createStreamingResponse(async function* () {
    try {
      const stream = anthropic.messages.stream({
        model: 'claude-sonnet-4-5',
        max_tokens: 2048,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Revise Chapter ${chapterIndex + 1} according to the direction: "${direction}"`,
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

      let revisedChapter: Chapter

      try {
        const parsed = JSON.parse(jsonContent)
        revisedChapter = {
          title: parsed.title,
          body: parsed.body,
          imagePrompt: parsed.imagePrompt,
          imageUrl: null, // Preserve stub
        }
      } catch {
        const rawJsonMatch = fullResponse.match(/\{[\s\S]*"body"[\s\S]*\}/)
        if (rawJsonMatch) {
          const parsed = JSON.parse(rawJsonMatch[0])
          revisedChapter = {
            title: parsed.title,
            body: parsed.body,
            imagePrompt: parsed.imagePrompt,
            imageUrl: null,
          }
        } else {
          yield { type: 'error', message: 'Failed to parse refined chapter' }
          return
        }
      }

      // Update only the specified chapter in the database
      const updatedContent = [...fullStory]
      updatedContent[chapterIndex] = revisedChapter

      await supabase
        .from('stories')
        .update({ story_content: updatedContent })
        .eq('id', storyId)
        .eq('user_id', user.id)

      yield { type: 'chapter_complete', chapter: revisedChapter }
    } catch (error) {
      yield {
        type: 'error',
        message: error instanceof Error ? error.message : 'Refinement failed',
      }
    }
  })
}
