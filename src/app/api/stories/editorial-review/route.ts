import { createClient } from '@/lib/supabase/server'
import { getAnthropicClient } from '@/lib/ai/client'
import type { Chapter } from '@/types/story'
import type { CreativeBrief } from '@/types/creative-brief'
import type { EditorialVerdict } from '@/types/editorial'

const SYSTEM_PROMPT = `[PLACEHOLDER — Editorial system prompt coming in separate prompt]`

interface EditorialReviewRequest {
  storyId: string
  creativeBrief: CreativeBrief
  storyContent: Chapter[]
  revisionCycle: number
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Unauthorized', code: 'AUTH_REQUIRED' }, { status: 401 })
  }

  const body: EditorialReviewRequest = await request.json()
  const { storyId, creativeBrief, storyContent, revisionCycle } = body

  if (!storyId || !creativeBrief || !storyContent?.length) {
    return Response.json(
      { error: 'Missing required fields', code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }

  const anthropic = getAnthropicClient()

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: JSON.stringify({
            creativeBrief,
            storyContent,
            revisionCycle,
          }),
        },
      ],
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type')
    }

    // Parse JSON from response
    const text = content.text
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/)
    const jsonContent = jsonMatch ? jsonMatch[1] : text

    const verdict: EditorialVerdict = JSON.parse(jsonContent)

    // Validate verdict structure
    if (!verdict.verdict || !['pass', 'revise'].includes(verdict.verdict)) {
      throw new Error('Invalid editorial verdict')
    }

    // Force pass if we've hit max revision cycles
    if (revisionCycle >= 2) {
      verdict.verdict = 'pass'
      verdict.revisionNotes = null
    }

    // Save to database
    await supabase
      .from('stories')
      .update({ editorial_verdict: verdict })
      .eq('id', storyId)
      .eq('user_id', user.id)

    return Response.json({ verdict })
  } catch (error) {
    return Response.json(
      {
        error: 'Editorial review failed',
        code: 'GENERATION_ERROR',
        detail: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
