/**
 * Sharing Invariants
 *
 * This module enforces correctness properties for the sharing system:
 * (a) Reader access is blocked when share_active is false
 * (b) Share URL never reveals story ID or creator identity
 * (c) Invalid/non-existent tokens produce the same response as deactivated tokens
 *
 * Validates: Requirements 8.1, 8.2, 8.4, 8.5
 */

/**
 * The generic unavailable message displayed for any inaccessible share link.
 * This must be identical for invalid, non-existent, and deactivated tokens
 * to prevent information leakage.
 */
export const UNAVAILABLE_MESSAGE = 'This story is not available.'

/**
 * The share URL path format: /read/[shareToken]
 */
export const SHARE_URL_PREFIX = '/read/'

/**
 * Represents the result of resolving a share token against the database.
 */
export interface ShareResolutionResult {
  found: boolean
  shareActive: boolean
}

/**
 * (a) Determines whether a reader should be granted access to a shared story.
 * Access is only granted when the token resolves to an existing story AND share_active is true.
 */
export function isReaderAccessGranted(resolution: ShareResolutionResult): boolean {
  return resolution.found && resolution.shareActive
}

/**
 * (a) Determines whether reader access should be blocked.
 * Blocked when share_active is false, token doesn't exist, or token is invalid.
 */
export function isReaderAccessBlocked(resolution: ShareResolutionResult): boolean {
  return !isReaderAccessGranted(resolution)
}

/**
 * (b) Constructs a share URL from a share token.
 * The URL format is /read/[shareToken] — it must NEVER contain the story ID or user ID.
 */
export function buildShareUrl(shareToken: string): string {
  return `${SHARE_URL_PREFIX}${shareToken}`
}

/**
 * (b) Validates that a share URL does NOT contain the story ID.
 * Returns true if the URL is safe (does not leak the story ID).
 */
export function shareUrlDoesNotRevealStoryId(
  shareUrl: string,
  storyId: string
): boolean {
  return !shareUrl.includes(storyId)
}

/**
 * (b) Validates that a share URL does NOT contain the creator's user ID.
 * Returns true if the URL is safe (does not leak the user ID).
 */
export function shareUrlDoesNotRevealUserId(
  shareUrl: string,
  userId: string
): boolean {
  return !shareUrl.includes(userId)
}

/**
 * (b) Combined check: share URL reveals neither story ID nor creator identity.
 */
export function isShareUrlPrivacySafe(
  shareUrl: string,
  storyId: string,
  userId: string
): boolean {
  return (
    shareUrlDoesNotRevealStoryId(shareUrl, storyId) &&
    shareUrlDoesNotRevealUserId(shareUrl, userId)
  )
}

/**
 * (c) Determines the response message for a given share resolution.
 * Invalid tokens, non-existent tokens, and deactivated tokens ALL produce
 * the same generic unavailable message — no information leakage.
 */
export function getSharePageResponse(
  resolution: ShareResolutionResult
): { accessible: false; message: string } | { accessible: true } {
  if (isReaderAccessGranted(resolution)) {
    return { accessible: true }
  }
  return { accessible: false, message: UNAVAILABLE_MESSAGE }
}

/**
 * (c) Validates that different inaccessible states produce identical responses.
 * Compares the response for two different resolution results that both deny access.
 */
export function areInaccessibleResponsesIdentical(
  resolutionA: ShareResolutionResult,
  resolutionB: ShareResolutionResult
): boolean {
  const responseA = getSharePageResponse(resolutionA)
  const responseB = getSharePageResponse(resolutionB)

  // Both should be inaccessible
  if (responseA.accessible || responseB.accessible) {
    return false
  }

  // Both should produce the same message
  return responseA.message === responseB.message
}
