import type { Chapter, VisualStyle, StoryStatus } from '@/types/story'

/**
 * Story Integrity Invariants
 *
 * This module enforces integrity constraints for the stories table:
 * (a) story_content has 0-5 chapters
 * (b) completed chapters have non-empty title/body/imagePrompt
 * (c) visual_style is always a valid enum
 * (d) status follows the valid state machine transitions
 * (e) share_token is unique and non-null
 * (f) previous_versions is append-only
 */

/** The valid visual style values */
export const VALID_VISUAL_STYLES: VisualStyle[] = [
  'watercolor',
  'manga',
  'flat',
  'ink_sketch',
]

/**
 * Valid status transitions:
 *   intake → generating
 *   generating → complete
 *   generating → error
 *   error → generating
 */
export const VALID_STATUS_TRANSITIONS: Record<StoryStatus, StoryStatus[]> = {
  intake: ['generating'],
  generating: ['complete', 'error'],
  complete: [],
  error: ['generating'],
}

/**
 * (a) Validates that story_content has between 0 and 5 chapters.
 */
export function isChapterCountValid(chapters: Chapter[]): boolean {
  return chapters.length >= 0 && chapters.length <= 5
}

/**
 * (b) Validates that a completed chapter has non-empty title, body, and imagePrompt.
 */
export function isCompletedChapterValid(chapter: Chapter): boolean {
  return (
    chapter.title.trim().length > 0 &&
    chapter.body.trim().length > 0 &&
    chapter.imagePrompt.trim().length > 0
  )
}

/**
 * (c) Validates that a visual_style value is one of the allowed enum values.
 */
export function isVisualStyleValid(style: string): style is VisualStyle {
  return (VALID_VISUAL_STYLES as string[]).includes(style)
}

/**
 * (d) Validates that a status transition follows the state machine.
 * Returns whether transitioning from `from` to `to` is allowed.
 */
export function isStatusTransitionValid(
  from: StoryStatus,
  to: StoryStatus
): boolean {
  return VALID_STATUS_TRANSITIONS[from].includes(to)
}

/**
 * (e) Validates that a share_token is non-null and non-empty.
 * Uniqueness is a database constraint but we can validate format here.
 */
export function isShareTokenValid(token: string | null | undefined): boolean {
  if (token === null || token === undefined) {
    return false
  }
  return token.trim().length > 0
}

/**
 * (e) Validates that share_tokens in a collection are all unique.
 */
export function areShareTokensUnique(tokens: string[]): boolean {
  const uniqueSet = new Set(tokens)
  return uniqueSet.size === tokens.length
}

/**
 * (f) Validates that previous_versions is append-only.
 * The existing versions must appear unchanged at the start of the updated array,
 * with only new versions appended at the end.
 */
export function isPreviousVersionsAppendOnly(
  existing: Chapter[][],
  updated: Chapter[][]
): boolean {
  // Updated cannot be shorter than existing
  if (updated.length < existing.length) {
    return false
  }

  // All existing version entries must appear unchanged at the start
  for (let i = 0; i < existing.length; i++) {
    const existingVersion = existing[i]
    const updatedVersion = updated[i]

    if (existingVersion.length !== updatedVersion.length) {
      return false
    }

    for (let j = 0; j < existingVersion.length; j++) {
      if (
        existingVersion[j].title !== updatedVersion[j].title ||
        existingVersion[j].body !== updatedVersion[j].body ||
        existingVersion[j].imagePrompt !== updatedVersion[j].imagePrompt
      ) {
        return false
      }
    }
  }

  return true
}
