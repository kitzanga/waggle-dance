import { createClient } from '@/lib/supabase/server'
import { getAnthropicClient } from '@/lib/ai/client'
import type { IntakeSignals } from '@/types/story'
import type { CreativeBrief } from '@/types/creative-brief'

const SYSTEM_PROMPT = `[PLACEHOLDER — Creative Director system prompt coming in separate prompt]`

interface CreativeBriefRequest {
  storyId: string
  intakeSignals: IntakeSignals
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Unauthorized', code: 'AUTH_REQUIRED' }, { status: 401 })
  }

  const body: CreativeBriefRequest = await request.json()
  const { storyId, intakeSignals } = body

  if (!storyId || !intakeSignals?.topic) {
    return Response.json(
      { error: 'Missing required fields', code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }

  const anthropic = getAnthropicClient()

  let brief: CreativeBrief | null = null
  let attempts = 0
  const maxAttempts = 2

  while (attempts < maxAttempts && !brief) {
    attempts++

    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: JSON.stringify(intakeSignals),
          },
        ],
      })

      const content = response.content[0]
      if (content.type !== 'text') {
        throw new Error('Unexpected response type')
      }

      // Parse JSON from response — handle code fences or raw JSON
      const text = content.text
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/)
      const jsonContent = jsonMatch ? jsonMatch[1] : text

      brief = JSON.parse(jsonContent) as CreativeBrief

      // Basic validation
      if (!brief.mode || !brief.protagonist || !brief.metaphor || !brief.structure) {
        brief = null
        throw new Error('Invalid creative brief structure')
      }
    } catch (error) {
      if (attempts >= maxAttempts) {
        return Response.json(
          {
            error: 'Failed to generate creative brief',
            code: 'GENERATION_ERROR',
            detail: error instanceof Error ? error.message : 'Parse failure',
          },
          { status: 500 }
        )
      }
      // Retry on next iteration
    }
  }

  // Save to database
  await supabase
    .from('stories')
    .update({ creative_brief: brief })
    .eq('id', storyId)
    .eq('user_id', user.id)

  return Response.json({ brief })
}
