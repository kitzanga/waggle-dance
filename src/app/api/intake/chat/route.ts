import { createClient } from '@/lib/supabase/server'
import { getAnthropicClient } from '@/lib/ai/client'
import { buildIntakeSystemPrompt } from '@/lib/ai/intake-prompt'
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
    error: authError,
  } = await supabase.auth.getUser()

  if (!user) {
    return Response.json(
      { error: 'Unauthorized', code: 'AUTH_REQUIRED', debug: authError?.message },
      { status: 401 }
    )
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

  // Use streaming with ReadableStream directly for better control
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await anthropic.messages.create({
          model: 'claude-sonnet-4-5',
          max_tokens: 1024,
          system: systemPrompt,
          messages: conversationMessages,
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

        // Parse signals from the response
        const signalMatch = fullResponse.match(/```signals\n([\s\S]*?)\n```/)
        if (signalMatch) {
          try {
            const parsed = JSON.parse(signalMatch[1])
            if (parsed.signal && parsed.value) {
              const data = `data: ${JSON.stringify({ type: 'signal_update', signal: parsed.signal, value: parsed.value })}\n\n`
              controller.enqueue(encoder.encode(data))
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
          const data = `data: ${JSON.stringify({ type: 'ready_to_generate', signals: updatedSignals })}\n\n`
          controller.enqueue(encoder.encode(data))
        }

        // Persist the exchange to the database
        const cleanResponse = fullResponse
          .replace(/```signals\n[\s\S]*?\n```/g, '')
          .replace(/\[SIGNALS_READY\]/g, '')
          .trim()

        const newUserMessage: IntakeMessage = {
          role: 'user',
          content: message,
          timestamp: new Date().toISOString(),
        }

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
