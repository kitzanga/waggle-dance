import type { IntakeSignals, Chapter } from '@/types/story'
import type { CreativeBrief } from '@/types/creative-brief'
import type { EditorialVerdict } from '@/types/editorial'
import type { PipelineEvent } from '@/types/pipeline'

/**
 * Orchestrates the three-stage story generation pipeline:
 * 1. Creative Director → produces a creative brief
 * 2. Writer → produces the story chapters
 * 3. Editorial → evaluates and optionally requests revision (max 2 cycles)
 */
export async function runStoryPipeline(
  storyId: string,
  intakeSignals: IntakeSignals,
  onEvent: (event: PipelineEvent) => void
): Promise<void> {
  try {
    // ─── Stage 1: Creative Director ───
    onEvent({ type: 'stage_change', stage: 'brief' })

    const briefResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/stories/creative-brief`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyId, intakeSignals }),
      }
    )

    if (!briefResponse.ok) {
      throw new Error(`Creative Director failed: ${briefResponse.status}`)
    }

    const briefResult = await briefResponse.json()
    const brief: CreativeBrief = briefResult.brief

    onEvent({ type: 'brief_complete', brief })

    // ─── Stage 2: Writer ───
    onEvent({ type: 'stage_change', stage: 'writing' })

    let chapters = await runWriter(storyId, brief, null, onEvent)

    // ─── Stage 3: Editorial (with up to 2 revision cycles) ───
    let revisionCycle = 0

    while (revisionCycle < 2) {
      onEvent({ type: 'stage_change', stage: 'editorial' })

      const verdict = await runEditorial(storyId, brief, chapters, revisionCycle)

      if (verdict.verdict === 'pass' || revisionCycle >= 1) {
        onEvent({ type: 'editorial_pass' })
        break
      }

      // Revision needed
      onEvent({ type: 'editorial_revise', cycle: revisionCycle + 1 })
      onEvent({ type: 'stage_change', stage: 'revising' })

      chapters = await runWriter(storyId, brief, verdict.revisionNotes, onEvent)
      revisionCycle++
    }

    onEvent({ type: 'pipeline_complete' })
  } catch (error) {
    onEvent({
      type: 'pipeline_error',
      message: error instanceof Error ? error.message : 'Pipeline failed',
    })
  }
}

/**
 * Calls the Writer API route and collects streamed chapter events.
 */
async function runWriter(
  storyId: string,
  brief: CreativeBrief,
  revisionNotes: string | null,
  onEvent: (event: PipelineEvent) => void
): Promise<Chapter[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/stories/generate`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storyId, creativeBrief: brief, revisionNotes }),
    }
  )

  if (!response.ok) {
    throw new Error(`Writer failed: ${response.status}`)
  }

  const reader = response.body?.getReader()
  if (!reader) throw new Error('No response body from writer')

  const decoder = new TextDecoder()
  let buffer = ''
  const chapters: Chapter[] = []

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      try {
        const event = JSON.parse(line.slice(6))
        switch (event.type) {
          case 'chapter_start':
            onEvent({ type: 'chapter_start', chapterIndex: event.index })
            break
          case 'token':
            onEvent({ type: 'token', chapterIndex: event.chapterIndex ?? 0, token: event.content })
            break
          case 'chapter_complete':
            onEvent({ type: 'chapter_complete', chapterIndex: event.index })
            break
          case 'story_complete':
            onEvent({ type: 'story_complete' })
            if (event.chapters) {
              chapters.push(...event.chapters)
            }
            break
          case 'chapters_payload':
            // Writer emits the full chapters array for pipeline consumption
            chapters.push(...event.chapters)
            break
          case 'error':
            throw new Error(event.message)
        }
      } catch (e) {
        if (e instanceof Error && e.message !== 'Unexpected end of JSON input') {
          throw e
        }
      }
    }
  }

  return chapters
}

/**
 * Calls the Editorial API route and returns the verdict.
 */
async function runEditorial(
  storyId: string,
  brief: CreativeBrief,
  chapters: Chapter[],
  revisionCycle: number
): Promise<EditorialVerdict> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/stories/editorial-review`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        storyId,
        creativeBrief: brief,
        storyContent: chapters,
        revisionCycle,
      }),
    }
  )

  if (!response.ok) {
    throw new Error(`Editorial review failed: ${response.status}`)
  }

  const result = await response.json()
  return result.verdict
}
