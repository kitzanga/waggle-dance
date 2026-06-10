import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  isReaderAccessGranted,
  isReaderAccessBlocked,
  buildShareUrl,
  shareUrlDoesNotRevealStoryId,
  shareUrlDoesNotRevealUserId,
  isShareUrlPrivacySafe,
  getSharePageResponse,
  areInaccessibleResponsesIdentical,
  UNAVAILABLE_MESSAGE,
  SHARE_URL_PREFIX,
  type ShareResolutionResult,
} from './sharingInvariants'

/**
 * Property-based tests for sharing invariants.
 *
 * **Validates: Requirements 8.1, 8.2, 8.4, 8.5**
 *
 * Property 3: Sharing Invariants —
 * (a) reader access is blocked when share_active is false,
 * (b) share URL never reveals story ID or creator identity,
 * (c) invalid/non-existent tokens produce same response as deactivated tokens
 */
describe('Feature: waggle-dance, Property 3: Sharing invariants', () => {
  // --- Arbitraries ---

  const uuidArbitrary = fc.uuid()

  // Share token: a valid UUID representing the opaque share identifier
  const shareTokenArbitrary = uuidArbitrary

  // Story ID: a UUID distinct from the share token
  const storyIdArbitrary = uuidArbitrary

  // User ID: a UUID representing the creator's identity
  const userIdArbitrary = uuidArbitrary

  // Resolution result for deactivated shares (found but share_active = false)
  const deactivatedResolution: fc.Arbitrary<ShareResolutionResult> = fc.constant({
    found: true,
    shareActive: false,
  })

  // Resolution result for non-existent tokens
  const nonExistentResolution: fc.Arbitrary<ShareResolutionResult> = fc.constant({
    found: false,
    shareActive: false,
  })

  // Resolution result for active shares (found and share_active = true)
  const activeResolution: fc.Arbitrary<ShareResolutionResult> = fc.constant({
    found: true,
    shareActive: true,
  })

  // Any inaccessible resolution (covers invalid, non-existent, deactivated)
  const inaccessibleResolutionArbitrary: fc.Arbitrary<ShareResolutionResult> =
    fc.oneof(
      // Deactivated: found but not active
      fc.constant({ found: true, shareActive: false }),
      // Non-existent: not found
      fc.constant({ found: false, shareActive: false }),
      // Invalid (also treated as not found)
      fc.constant({ found: false, shareActive: false })
    )

  // --- (a) Reader access is blocked when share_active is false ---

  describe('(a) reader access is blocked when share_active is false', () => {
    it('access is always blocked when share_active is false, regardless of found status', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          (found) => {
            const resolution: ShareResolutionResult = {
              found,
              shareActive: false,
            }
            expect(isReaderAccessGranted(resolution)).toBe(false)
            expect(isReaderAccessBlocked(resolution)).toBe(true)
          }
        ),
        { numRuns: 15 }
      )
    })

    it('access is always blocked when token is not found, regardless of shareActive', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          (shareActive) => {
            const resolution: ShareResolutionResult = {
              found: false,
              shareActive,
            }
            expect(isReaderAccessGranted(resolution)).toBe(false)
            expect(isReaderAccessBlocked(resolution)).toBe(true)
          }
        ),
        { numRuns: 15 }
      )
    })

    it('access is only granted when found=true AND share_active=true', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          fc.boolean(),
          (found, shareActive) => {
            const resolution: ShareResolutionResult = { found, shareActive }
            const granted = isReaderAccessGranted(resolution)

            if (found && shareActive) {
              expect(granted).toBe(true)
            } else {
              expect(granted).toBe(false)
            }
          }
        ),
        { numRuns: 15 }
      )
    })

    it('isReaderAccessBlocked is always the inverse of isReaderAccessGranted', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          fc.boolean(),
          (found, shareActive) => {
            const resolution: ShareResolutionResult = { found, shareActive }
            expect(isReaderAccessBlocked(resolution)).toBe(
              !isReaderAccessGranted(resolution)
            )
          }
        ),
        { numRuns: 15 }
      )
    })
  })

  // --- (b) Share URL never reveals story ID or creator identity ---

  describe('(b) share URL never reveals story ID or creator identity', () => {
    it('share URL contains only the share token, never the story ID', () => {
      fc.assert(
        fc.property(
          shareTokenArbitrary,
          storyIdArbitrary,
          (shareToken, storyId) => {
            // Skip when UUIDs happen to collide (extremely rare but possible in fast-check)
            fc.pre(shareToken !== storyId)

            const url = buildShareUrl(shareToken)
            expect(shareUrlDoesNotRevealStoryId(url, storyId)).toBe(true)
            // The URL should contain the share token
            expect(url).toContain(shareToken)
            // The URL should NOT contain the story ID
            expect(url).not.toContain(storyId)
          }
        ),
        { numRuns: 15 }
      )
    })

    it('share URL never contains the creator user ID', () => {
      fc.assert(
        fc.property(
          shareTokenArbitrary,
          userIdArbitrary,
          (shareToken, userId) => {
            fc.pre(shareToken !== userId)

            const url = buildShareUrl(shareToken)
            expect(shareUrlDoesNotRevealUserId(url, userId)).toBe(true)
            expect(url).not.toContain(userId)
          }
        ),
        { numRuns: 15 }
      )
    })

    it('share URL is privacy safe: reveals neither story ID nor user ID', () => {
      fc.assert(
        fc.property(
          shareTokenArbitrary,
          storyIdArbitrary,
          userIdArbitrary,
          (shareToken, storyId, userId) => {
            fc.pre(shareToken !== storyId && shareToken !== userId)

            const url = buildShareUrl(shareToken)
            expect(isShareUrlPrivacySafe(url, storyId, userId)).toBe(true)
          }
        ),
        { numRuns: 15 }
      )
    })

    it('share URL always starts with the expected prefix /read/', () => {
      fc.assert(
        fc.property(shareTokenArbitrary, (shareToken) => {
          const url = buildShareUrl(shareToken)
          expect(url.startsWith(SHARE_URL_PREFIX)).toBe(true)
        }),
        { numRuns: 15 }
      )
    })

    it('share URL path is exactly /read/{token} with no extra segments', () => {
      fc.assert(
        fc.property(shareTokenArbitrary, (shareToken) => {
          const url = buildShareUrl(shareToken)
          // Should be exactly prefix + token, nothing else
          expect(url).toBe(`/read/${shareToken}`)
          // Should not have any additional path segments after the token
          const afterPrefix = url.slice(SHARE_URL_PREFIX.length)
          expect(afterPrefix).toBe(shareToken)
          expect(afterPrefix).not.toContain('/')
        }),
        { numRuns: 15 }
      )
    })
  })

  // --- (c) Invalid/non-existent tokens produce same response as deactivated tokens ---

  describe('(c) invalid/non-existent tokens produce same response as deactivated tokens', () => {
    it('deactivated and non-existent resolutions produce identical responses', () => {
      fc.assert(
        fc.property(
          deactivatedResolution,
          nonExistentResolution,
          (deactivated, nonExistent) => {
            expect(
              areInaccessibleResponsesIdentical(deactivated, nonExistent)
            ).toBe(true)
          }
        ),
        { numRuns: 15 }
      )
    })

    it('any two inaccessible resolutions always produce the same message', () => {
      fc.assert(
        fc.property(
          inaccessibleResolutionArbitrary,
          inaccessibleResolutionArbitrary,
          (resA, resB) => {
            expect(areInaccessibleResponsesIdentical(resA, resB)).toBe(true)
          }
        ),
        { numRuns: 15 }
      )
    })

    it('all inaccessible resolutions produce the generic unavailable message', () => {
      fc.assert(
        fc.property(inaccessibleResolutionArbitrary, (resolution) => {
          const response = getSharePageResponse(resolution)
          expect(response.accessible).toBe(false)
          if (!response.accessible) {
            expect(response.message).toBe(UNAVAILABLE_MESSAGE)
          }
        }),
        { numRuns: 15 }
      )
    })

    it('the unavailable message never reveals token status (deactivated vs not found)', () => {
      fc.assert(
        fc.property(inaccessibleResolutionArbitrary, (resolution) => {
          const response = getSharePageResponse(resolution)
          if (!response.accessible) {
            // Message should not contain revealing terms
            expect(response.message.toLowerCase()).not.toContain('deactivated')
            expect(response.message.toLowerCase()).not.toContain('not found')
            expect(response.message.toLowerCase()).not.toContain('invalid')
            expect(response.message.toLowerCase()).not.toContain('expired')
            expect(response.message.toLowerCase()).not.toContain('disabled')
          }
        }),
        { numRuns: 15 }
      )
    })

    it('active resolutions produce accessible response (no message)', () => {
      fc.assert(
        fc.property(activeResolution, (resolution) => {
          const response = getSharePageResponse(resolution)
          expect(response.accessible).toBe(true)
        }),
        { numRuns: 15 }
      )
    })
  })
})
