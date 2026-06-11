import type { CreativeBrief } from './creative-brief'

export type PipelineEvent =
  | { type: 'stage_change'; stage: 'brief' | 'writing' | 'editorial' | 'revising' }
  | { type: 'brief_complete'; brief: CreativeBrief }
  | { type: 'chapter_start'; chapterIndex: number }
  | { type: 'token'; chapterIndex: number; token: string }
  | { type: 'chapter_complete'; chapterIndex: number }
  | { type: 'story_complete' }
  | { type: 'editorial_pass' }
  | { type: 'editorial_revise'; cycle: number }
  | { type: 'pipeline_complete' }
  | { type: 'pipeline_error'; message: string }
