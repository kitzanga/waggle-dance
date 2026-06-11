import { createClient } from '@/lib/supabase/server'
import { runStoryPipeline } from '@/lib/ai/pipeline'
import type { IntakeSignals, VisualStyle } from '@/types/story'
import type { PipelineEvent } from '@/types/pipeline'

interface PipelineRequest {
  storyId: string
  intakeSignals: IntakeSignals
  visualStyle: VisualStyle
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Unauthorized', code: 'AUTH_REQUIRED' }, { status: 401 })
  }

  const body: PipelineRequest = await request.json()
  const { storyId, intakeSignals, visualStyle } = body

  if (!storyId || !intakeSignals?.topic) {
    return Response.json(
      { error: 'Missing required fields', code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }

  // Update story status and visual style
  await supabase
    .from('stories')
    .update({ status: 'generating', visual_style: visualStyle })
    .eq('id', storyId)
    .eq('user_id', user.id)

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      function emit(event: PipelineEvent) {
        const data = `data: ${JSON.stringify(event)}\n\n`
        controller.enqueue(encoder.encode(data))
      }

      await runStoryPipeline(storyId, intakeSignals, emit)
      controller.close()
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
