import { createClient } from '@/lib/supabase/server'
import { getAnthropicClient } from '@/lib/ai/client'

interface IntakeValidateRequest {
  storyId: string
  step: number
  answer: string
  validationPrompt: string
  /** Full transcript for persistence */
  transcript: Array<{ question: string; answer: string }>
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (!user) {
    return Response.json(
      { error: 'Unauthorized', code: 'AUTH_REQUIRED', debug: authError?.message },
      { status: 401 }
    )
  }

  const body: IntakeValidateRequest = await request.json()
  const { storyId, step, answer, validationPrompt, transcript } = body

  if (!storyId || step === undefined || !answer || !validationPrompt) {
    return Response.json(
      { error: 'Missing required fields', code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }

  const anthropic = getAnthropicClient()
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await anthropic.messages.create({
          model: 'claude-sonnet-4-5',
          max_tokens: 256,
          system: `You are the intake validator for Waggle Dance. Your job is to assess whether a user's answer is specific enough to use.

Rules:
- If the answer is good enough, respond with exactly: [ACCEPTED]
- If not, respond with a single short follow-up question (max 15 words)
- Never open with affirmations ("Got it", "Great", etc.)
- No markdown, no em dashes
- Be direct and concise — like a sharp colleague`,
          messages: [
            { role: 'user', content: validationPrompt },
          ],
          stream: true,
        })

        let fullResponse = ''

        for await (const event of response) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            const token = event.delta.text
            fullResponse += token
            const data = `data: ${JSON.stringify({ type: 'token', content: token })}\n\n`
            controller.enqueue(encoder.encode(data))
          }
        }

        // Determine if accepted
        const accepted = fullResponse.includes('[ACCEPTED]')
        const acceptedData = `data: ${JSON.stringify({ type: 'validation_result', accepted, step })}\n\n`
        controller.enqueue(encoder.encode(acceptedData))

        // Persist transcript to DB on each accepted answer
        if (accepted) {
          await supabase
            .from('stories')
            .update({ intake_transcript: transcript })
            .eq('id', storyId)
            .eq('user_id', user.id)
        }

        const doneData = `data: ${JSON.stringify({ type: 'done' })}\n\n`
        controller.enqueue(encoder.encode(doneData))
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        const data = `data: ${JSON.stringify({ type: 'error', message: errorMessage })}\n\n`
        controller.enqueue(encoder.encode(data))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
