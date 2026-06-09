/**
 * Creates a streaming SSE response from an async iterable of events.
 */
export function createStreamingResponse(
  generateEvents: () => AsyncIterable<Record<string, unknown>>
): Response {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of generateEvents()) {
          const data = `data: ${JSON.stringify(event)}\n\n`
          controller.enqueue(encoder.encode(data))
        }
      } catch (error) {
        const errorEvent = `data: ${JSON.stringify({
          type: 'error',
          message:
            error instanceof Error ? error.message : 'An unexpected error occurred',
        })}\n\n`
        controller.enqueue(encoder.encode(errorEvent))
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

/**
 * Helper to read an SSE stream from the client side.
 * Returns an async generator that yields parsed event objects.
 */
export async function* readStream<T>(
  response: Response
): AsyncGenerator<T, void, unknown> {
  const reader = response.body?.getReader()
  if (!reader) return

  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6)) as T
          yield data
        } catch {
          // Skip malformed JSON
        }
      }
    }
  }

  // Process any remaining buffer
  if (buffer.startsWith('data: ')) {
    try {
      const data = JSON.parse(buffer.slice(6)) as T
      yield data
    } catch {
      // Skip malformed JSON
    }
  }
}
