import { createClient } from '@/lib/supabase/server'
import { getAnthropicClient } from '@/lib/ai/client'
import { buildIntakeSystemPrompt } from '@/lib/ai/intake-prompt'
import { createStreamingResponse } from '@/lib/ai/stream'
import type { IntakeSignals } from '@/types/story'
import type { IntakeMessage } from '@/types/intake'

interface IntakeChatRequest {
  storyId: string
  message: string
  signals: Partial<IntakeSignals>
  messages: IntakeMessage[]
  documentContext?: string | null
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Unauthorized', code: 'AUTH_REQUIRED' }, { status: 401 })
  }

  const body: IntakeChatRequest = await request.json()
  const { storyId, message, signals, messages, documentContext } = body

  if (!storyId || !message) {
    return Response.json(
      { error: 'Missing required fields', code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }

  // Build conversation history for Claude
  const systemPrompt = buildIntakeSystemPrompt(signals, documentContext || null)
  const conversationMessages = messages.map((msg) => ({
    role: msg.role as 'user' | 'assistant',
    content: msg.content,
  }))

  // Add the new user message
  conversationMessages.push({ role: 'user', content: message })

  const anthropic = getAnthropicClient()

  return createStreamingResponse(async function* () {
    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-5-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: conversationMessages,
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

    // Parse signals from the response
    const signalMatch = fullResponse.match(/```signals\n([\s\S]*?)\n```/)
    if (signalMatch) {
      try {
        const parsed = JSON.parse(signalMatch[1])
        if (parsed.signal && parsed.value) {
          yield { type: 'signal_update', signal: parsed.signal, value: parsed.value }
        }
      } catch {
        // Ignore malformed signal extraction
      }
    }

    // Check if ready to generate
    if (fullResponse.includes('[SIGNALS_READY]')) {
      const updatedSignals: IntakeSignals = {
        topic: signals.topic || '',
        tension: signals.tension || null,
        audiencePortrait: signals.audiencePortrait || null,
        resistancePattern: signals.resistancePattern || null,
        stakes: signals.stakes || null,
        desiredShift: signals.desiredShift || null,
      }
      yield { type: 'ready_to_generate', signals: updatedSignals }
    }

    // Persist the exchange to the database
    const newUserMessage: IntakeMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    }

    // Strip the signal markers from the stored response
    const cleanResponse = fullResponse
      .replace(/```signals\n[\s\S]*?\n```/g, '')
      .replace(/\[SIGNALS_READY\]/g, '')
      .trim()

    const newAssistantMessage: IntakeMessage = {
      role: 'assistant',
      content: cleanResponse,
      timestamp: new Date().toISOString(),
    }

    const updatedTranscript = [...messages, newUserMessage, newAssistantMessage]

    await supabase
      .from('stories')
      .update({
        intake_transcript: updatedTranscript,
        intake_signals: signals,
      })
      .eq('id', storyId)
      .eq('user_id', user.id)

    yield { type: 'done' }
  })
}
