import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  applyChapterRefinement,
  isOnlyTargetedChapterChanged,
  pushToPreviousVersions,
  isFullRegenerationValid,
  canRefine,
} from './refinementInvariants'
import type { Chapter, StoryStatus } from '@/types/story'

/**
 * Property-based tests for refinement invariants.
 *
 * **Validates: Requirements 5.1, 5.2, 5.5**
 *
 * Property 4: Refinement Invariants —
 * (a) only the targeted chapter changes during refinement,
 * (b) full regeneration pushes current content to previous_versions before overwrite,
 * (c) refinement only applies to stories with status `complete`
 */
describe('Feature: waggle-dance, Property 4: Refinement invariants', () => {
  // --- Arbitraries ---

  const nonEmptyStringArbitrary = fc
    .string({ minLength: 1, maxLength: 200 })
    .filter((s) => s.trim().length > 0)

  const chapterArbitrary: fc.Arbitrary<Chapter> = fc.record({
    title: nonEmptyStringArbitrary,
    body: nonEmptyStringArbitrary,
    imagePrompt: nonEmptyStringArbitrary,
    imageUrl: fc.option(fc.webUrl(), { nil: null }),
  })

  /** Generate a story with 1-5 chapters (valid range) */
  const storyContentArbitrary = fc.array(chapterArbitrary, {
    minLength: 1,
    maxLength: 5,
  })

  /** Generate a valid target index within a given chapter count */
  function targetIndexArbitrary(chapterCount: number) {
    return fc.integer({ min: 0, max: chapterCount - 1 })
  }

  const versionArbitrary = fc.array(chapterArbitrary, {
    minLength: 1,
    maxLength: 5,
  })

  const previousVersionsArbitrary = fc.array(versionArbitrary, {
    minLength: 0,
    maxLength: 5,
  })

  const storyStatusArbitrary: fc.Arbitrary<StoryStatus> = fc.constantFrom(
    'intake',
    'generating',
    'complete',
    'error'
  )

  // --- (a) Only the targeted chapter changes during refinement ---

  describe('(a) only the targeted chapter changes during refinement', () => {
    it('applying a refinement to a chapter leaves all other chapters unchanged', () => {
      fc.assert(
        fc.property(
          storyContentArbitrary.chain((chapters) =>
            fc.tuple(
              fc.constant(chapters),
              targetIndexArbitrary(chapters.length),
              chapterArbitrary
            )
          ),
          ([chapters, targetIndex, revisedChapter]) => {
            const refined = applyChapterRefinement(
              chapters,
              targetIndex,
              revisedChapter
            )

            expect(
              isOnlyTargetedChapterChanged(chapters, refined, targetIndex)
            ).toBe(true)
          }
        ),
        { numRuns: 15 }
      )
    })

    it('the refined chapter at the target index equals the revised chapter', () => {
      fc.assert(
        fc.property(
          storyContentArbitrary.chain((chapters) =>
            fc.tuple(
              fc.constant(chapters),
              targetIndexArbitrary(chapters.length),
              chapterArbitrary
            )
          ),
          ([chapters, targetIndex, revisedChapter]) => {
            const refined = applyChapterRefinement(
              chapters,
              targetIndex,
              revisedChapter
            )

            expect(refined[targetIndex].title).toBe(revisedChapter.title)
            expect(refined[targetIndex].body).toBe(revisedChapter.body)
            expect(refined[targetIndex].imagePrompt).toBe(
              revisedChapter.imagePrompt
            )
          }
        ),
        { numRuns: 15 }
      )
    })

    it('refinement preserves the array length', () => {
      fc.assert(
        fc.property(
          storyContentArbitrary.chain((chapters) =>
            fc.tuple(
              fc.constant(chapters),
              targetIndexArbitrary(chapters.length),
              chapterArbitrary
            )
          ),
          ([chapters, targetIndex, revisedChapter]) => {
            const refined = applyChapterRefinement(
              chapters,
              targetIndex,
              revisedChapter
            )

            expect(refined.length).toBe(chapters.length)
          }
        ),
        { numRuns: 15 }
      )
    })

    it('a non-targeted chapter index with different content fails the invariant check', () => {
      fc.assert(
        fc.property(
          fc
            .array(chapterArbitrary, { minLength: 2, maxLength: 5 })
            .chain((chapters) =>
              fc.tuple(
                fc.constant(chapters),
                targetIndexArbitrary(chapters.length),
                chapterArbitrary
              )
            ),
          ([chapters, targetIndex, differentChapter]) => {
            // Modify a NON-targeted chapter
            const wrongIndex =
              targetIndex === 0 ? chapters.length - 1 : targetIndex - 1

            const tampered = chapters.map((ch, i) =>
              i === wrongIndex ? differentChapter : ch
            )

            // If the different chapter is actually identical (unlikely but possible),
            // skip this case
            if (
              chapters[wrongIndex].title === differentChapter.title &&
              chapters[wrongIndex].body === differentChapter.body &&
              chapters[wrongIndex].imagePrompt === differentChapter.imagePrompt &&
              chapters[wrongIndex].imageUrl === differentChapter.imageUrl
            ) {
              return
            }

            expect(
              isOnlyTargetedChapterChanged(chapters, tampered, targetIndex)
            ).toBe(false)
          }
        ),
        { numRuns: 15 }
      )
    })
  })

  // --- (b) Full regeneration pushes current content to previous_versions before overwrite ---

  describe('(b) full regeneration pushes current content to previous_versions before overwrite', () => {
    it('pushToPreviousVersions appends current content as last entry', () => {
      fc.assert(
        fc.property(
          storyContentArbitrary,
          previousVersionsArbitrary,
          (currentContent, previousVersions) => {
            const updated = pushToPreviousVersions(
              currentContent,
              previousVersions
            )

            expect(
              isFullRegenerationValid(previousVersions, updated, currentContent)
            ).toBe(true)
          }
        ),
        { numRuns: 15 }
      )
    })

    it('full regeneration increases previous_versions length by exactly 1', () => {
      fc.assert(
        fc.property(
          storyContentArbitrary,
          previousVersionsArbitrary,
          (currentContent, previousVersions) => {
            const updated = pushToPreviousVersions(
              currentContent,
              previousVersions
            )

            expect(updated.length).toBe(previousVersions.length + 1)
          }
        ),
        { numRuns: 15 }
      )
    })

    it('all existing versions are preserved unchanged after full regeneration', () => {
      fc.assert(
        fc.property(
          storyContentArbitrary,
          previousVersionsArbitrary,
          (currentContent, previousVersions) => {
            const updated = pushToPreviousVersions(
              currentContent,
              previousVersions
            )

            // Verify existing entries are untouched
            for (let i = 0; i < previousVersions.length; i++) {
              expect(updated[i].length).toBe(previousVersions[i].length)
              for (let j = 0; j < previousVersions[i].length; j++) {
                expect(updated[i][j].title).toBe(previousVersions[i][j].title)
                expect(updated[i][j].body).toBe(previousVersions[i][j].body)
                expect(updated[i][j].imagePrompt).toBe(
                  previousVersions[i][j].imagePrompt
                )
              }
            }
          }
        ),
        { numRuns: 15 }
      )
    })

    it('skipping the push (not appending current content) fails validation', () => {
      fc.assert(
        fc.property(
          storyContentArbitrary,
          previousVersionsArbitrary,
          (currentContent, previousVersions) => {
            // Simulate a bug: not pushing current content
            const buggyUpdate = [...previousVersions]

            expect(
              isFullRegenerationValid(
                previousVersions,
                buggyUpdate,
                currentContent
              )
            ).toBe(false)
          }
        ),
        { numRuns: 15 }
      )
    })

    it('pushing wrong content to previous_versions fails validation', () => {
      fc.assert(
        fc.property(
          storyContentArbitrary,
          storyContentArbitrary,
          previousVersionsArbitrary,
          (currentContent, wrongContent, previousVersions) => {
            // Simulate pushing different content than what was current
            const badUpdate = [...previousVersions, wrongContent]

            // Skip if the wrong content happens to be identical
            if (
              currentContent.length === wrongContent.length &&
              currentContent.every(
                (ch, i) =>
                  ch.title === wrongContent[i].title &&
                  ch.body === wrongContent[i].body &&
                  ch.imagePrompt === wrongContent[i].imagePrompt
              )
            ) {
              return
            }

            expect(
              isFullRegenerationValid(
                previousVersions,
                badUpdate,
                currentContent
              )
            ).toBe(false)
          }
        ),
        { numRuns: 15 }
      )
    })
  })

  // --- (c) Refinement only applies to stories with status `complete` ---

  describe('(c) refinement only applies to stories with status complete', () => {
    it('stories with status complete can always be refined', () => {
      expect(canRefine('complete')).toBe(true)
    })

    it('stories with any non-complete status can never be refined', () => {
      const nonCompleteStatusArbitrary: fc.Arbitrary<StoryStatus> =
        fc.constantFrom('intake', 'generating', 'error')

      fc.assert(
        fc.property(nonCompleteStatusArbitrary, (status) => {
          expect(canRefine(status)).toBe(false)
        }),
        { numRuns: 15 }
      )
    })

    it('for any arbitrary status, canRefine returns true if and only if status is complete', () => {
      fc.assert(
        fc.property(storyStatusArbitrary, (status) => {
          const result = canRefine(status)
          if (status === 'complete') {
            expect(result).toBe(true)
          } else {
            expect(result).toBe(false)
          }
        }),
        { numRuns: 15 }
      )
    })
  })
})
