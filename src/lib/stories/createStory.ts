import type { VisualStyle } from '@/types/story'

/**
 * Parameters for creating a new story record.
 */
export interface CreateStoryParams {
  /** The authenticated user's ID from the session */
  authenticatedUserId: string
  /** Initial topic (can be empty during intake) */
  topic?: string
  /** Visual style selection */
  visualStyle?: VisualStyle
}

/**
 * The story insert record prepared for database insertion.
 * The user_id field MUST always equal the authenticated user's ID.
 */
export interface StoryInsertRecord {
  user_id: string
  topic: string
  status: 'intake'
  visual_style: VisualStyle
}

/**
 * Prepares a story insert record for database insertion.
 * This enforces the ownership invariant: the story's user_id
 * is always set to the authenticated user's ID from the session.
 */
export function buildStoryInsertRecord(
  params: CreateStoryParams
): StoryInsertRecord {
  return {
    user_id: params.authenticatedUserId,
    topic: params.topic ?? '',
    status: 'intake',
    visual_style: params.visualStyle ?? 'watercolor',
  }
}
