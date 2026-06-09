export type ApiErrorCode =
  | 'AUTH_REQUIRED'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'GENERATION_FAILED'
  | 'UPLOAD_FAILED'
  | 'RATE_LIMITED'

export interface ApiError {
  error: string
  code: ApiErrorCode
  details?: string
}

/** SSE event types for intake streaming */
export type IntakeStreamEvent =
  | { type: 'token'; content: string }
  | { type: 'signal_update'; signal: string; value: string }
  | { type: 'ready_to_generate'; signals: import('./story').IntakeSignals }
  | { type: 'done' }

/** SSE event types for story generation streaming */
export type GenerationStreamEvent =
  | { type: 'transition'; message: string }
  | { type: 'chapter_start'; index: number; title: string }
  | { type: 'token'; content: string }
  | {
      type: 'chapter_complete'
      index: number
      imagePrompt: string
    }
  | {
      type: 'story_complete'
      title: string
      frameworkSelected: string[]
    }
  | { type: 'error'; message: string }

/** SSE event types for refinement streaming */
export type RefinementStreamEvent =
  | { type: 'token'; content: string }
  | { type: 'chapter_complete'; chapter: import('./story').Chapter }
  | { type: 'error'; message: string }
