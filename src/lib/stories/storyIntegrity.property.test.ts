import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  isChapterCountValid,
  isCompletedChapterValid,
  isVisualStyleValid,
  isStatusTransitionValid,
  isShareTokenValid,
  areShareTokensUnique,
  isPreviousVersionsAppendOnly,
  VALID_VISUAL_STYLES,
  VALID_STATUS_TRANSITIONS,
} from './storyIntegrity'
import type { Chapter, VisualStyle, StoryStatus } from '@/types/story'

/**
 * Property-based tests for story integrity invariants.
 *
 * **Validates: Requirements 4.1, 4.7, 5.2, 6.1, 6.3**
 *
 * Property 1: Story Integrity Invariants —
 * (a) story_content has 0-5 chapters,
 * (b) completed chapters have non-empty title/body/imagePrompt,
 * (c) visual_style is always a valid enum,
 * (d) status follows state machine,
 * (e) share_token is unique and non-null,
 * (f) previous_versions is append-only
 */
describe('Feature: waggle-dance, Property 1: Story Integrity Invariants', () => {
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

  const emptyFieldChapterArbitrary: fc.Arbitrary<Chapter> = fc.record({
    title: fc.constantFrom('', ' ', '\t', '\n'),
    body: fc.constantFrom('', ' ', '\t', '\n'),
    imagePrompt: fc.constantFrom('', ' ', '\t', '\n'),
    imageUrl: fc.option(fc.webUrl(), { nil: null }),
  })

  const visualStyleArbitrary: fc.Arbitrary<VisualStyle> = fc.constantFrom(
    ...VALID_VISUAL_STYLES
  )

  const storyStatusArbitrary: fc.Arbitrary<StoryStatus> = fc.constantFrom(
    'intake',
    'generating',
    'complete',
    'error'
  )

  const uuidArbitrary = fc.uuid()

  // --- (a) story_content has 0-5 chapters ---

  describe('(a) story_content has 0-5 chapters', () => {
    it('any chapter array with 0-5 elements is always valid', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 5 }),
          (count) => {
            const chapters: Chapter[] = Array.from({ length: count }, () => ({
              title: 'test',
              body: 'test body',
              imagePrompt: 'test prompt',
              imageUrl: null,
            }))
            expect(isChapterCountValid(chapters)).toBe(true)
          }
        ),
        { numRuns: 15 }
      )
    })

    it('any chapter array with more than 5 elements is always invalid', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 6, max: 20 }),
          (count) => {
            const chapters: Chapter[] = Array.from({ length: count }, () => ({
              title: 'test',
              body: 'test body',
              imagePrompt: 'test prompt',
              imageUrl: null,
            }))
            expect(isChapterCountValid(chapters)).toBe(false)
          }
        ),
        { numRuns: 15 }
      )
    })
  })

  // --- (b) completed chapters have non-empty title/body/imagePrompt ---

  describe('(b) completed chapters have non-empty title/body/imagePrompt', () => {
    it('chapters with non-empty title, body, and imagePrompt are always valid', () => {
      fc.assert(
        fc.property(chapterArbitrary, (chapter) => {
          expect(isCompletedChapterValid(chapter)).toBe(true)
        }),
        { numRuns: 15 }
      )
    })

    it('chapters with empty/whitespace-only title are always invalid', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('', ' ', '\t', '\n', '  \n\t  '),
          nonEmptyStringArbitrary,
          nonEmptyStringArbitrary,
          (title, body, imagePrompt) => {
            const chapter: Chapter = { title, body, imagePrompt, imageUrl: null }
            expect(isCompletedChapterValid(chapter)).toBe(false)
          }
        ),
        { numRuns: 15 }
      )
    })

    it('chapters with empty/whitespace-only body are always invalid', () => {
      fc.assert(
        fc.property(
          nonEmptyStringArbitrary,
          fc.constantFrom('', ' ', '\t', '\n', '  \n\t  '),
          nonEmptyStringArbitrary,
          (title, body, imagePrompt) => {
            const chapter: Chapter = { title, body, imagePrompt, imageUrl: null }
            expect(isCompletedChapterValid(chapter)).toBe(false)
          }
        ),
        { numRuns: 15 }
      )
    })

    it('chapters with empty/whitespace-only imagePrompt are always invalid', () => {
      fc.assert(
        fc.property(
          nonEmptyStringArbitrary,
          nonEmptyStringArbitrary,
          fc.constantFrom('', ' ', '\t', '\n', '  \n\t  '),
          (title, body, imagePrompt) => {
            const chapter: Chapter = { title, body, imagePrompt, imageUrl: null }
            expect(isCompletedChapterValid(chapter)).toBe(false)
          }
        ),
        { numRuns: 15 }
      )
    })
  })

  // --- (c) visual_style is always a valid enum ---

  describe('(c) visual_style is always a valid enum', () => {
    it('all defined visual styles are valid', () => {
      fc.assert(
        fc.property(visualStyleArbitrary, (style) => {
          expect(isVisualStyleValid(style)).toBe(true)
        }),
        { numRuns: 15 }
      )
    })

    it('arbitrary strings not in the enum are always invalid', () => {
      const invalidStyleArbitrary = fc
        .string({ minLength: 1, maxLength: 50 })
        .filter((s) => !(VALID_VISUAL_STYLES as string[]).includes(s))

      fc.assert(
        fc.property(invalidStyleArbitrary, (style) => {
          expect(isVisualStyleValid(style)).toBe(false)
        }),
        { numRuns: 15 }
      )
    })
  })

  // --- (d) status follows state machine ---

  describe('(d) status follows state machine transitions', () => {
    it('all defined valid transitions are accepted', () => {
      // Generate valid (from, to) pairs
      const validTransitionArbitrary = fc
        .constantFrom(
          ...Object.entries(VALID_STATUS_TRANSITIONS).flatMap(([from, tos]) =>
            tos.map((to) => ({ from: from as StoryStatus, to }))
          )
        )

      fc.assert(
        fc.property(validTransitionArbitrary, ({ from, to }) => {
          expect(isStatusTransitionValid(from, to)).toBe(true)
        }),
        { numRuns: 15 }
      )
    })

    it('invalid transitions are always rejected', () => {
      // Generate invalid (from, to) pairs
      const invalidTransitionArbitrary = fc
        .tuple(storyStatusArbitrary, storyStatusArbitrary)
        .filter(
          ([from, to]) => !VALID_STATUS_TRANSITIONS[from].includes(to)
        )

      fc.assert(
        fc.property(invalidTransitionArbitrary, ([from, to]) => {
          expect(isStatusTransitionValid(from, to)).toBe(false)
        }),
        { numRuns: 15 }
      )
    })

    it('complete status cannot transition to any other status', () => {
      fc.assert(
        fc.property(storyStatusArbitrary, (to) => {
          expect(isStatusTransitionValid('complete', to)).toBe(false)
        }),
        { numRuns: 15 }
      )
    })

    it('intake can only transition to generating', () => {
      const nonGeneratingStatus: fc.Arbitrary<StoryStatus> = fc.constantFrom(
        'intake',
        'complete',
        'error'
      )

      fc.assert(
        fc.property(nonGeneratingStatus, (to) => {
          expect(isStatusTransitionValid('intake', to)).toBe(false)
        }),
        { numRuns: 15 }
      )
    })
  })

  // --- (e) share_token is unique and non-null ---

  describe('(e) share_token is unique and non-null', () => {
    it('valid UUID tokens are always accepted', () => {
      fc.assert(
        fc.property(uuidArbitrary, (token) => {
          expect(isShareTokenValid(token)).toBe(true)
        }),
        { numRuns: 15 }
      )
    })

    it('null or undefined tokens are always rejected', () => {
      expect(isShareTokenValid(null)).toBe(false)
      expect(isShareTokenValid(undefined)).toBe(false)
    })

    it('empty or whitespace-only tokens are always rejected', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('', ' ', '\t', '\n', '  \n\t  '),
          (token) => {
            expect(isShareTokenValid(token)).toBe(false)
          }
        ),
        { numRuns: 15 }
      )
    })

    it('collections of distinct UUIDs are always unique', () => {
      fc.assert(
        fc.property(
          fc.uniqueArray(uuidArbitrary, { minLength: 1, maxLength: 20 }),
          (tokens) => {
            expect(areShareTokensUnique(tokens)).toBe(true)
          }
        ),
        { numRuns: 15 }
      )
    })

    it('collections with duplicate tokens are never unique', () => {
      fc.assert(
        fc.property(
          uuidArbitrary,
          fc.integer({ min: 2, max: 10 }),
          (token, count) => {
            const tokens = Array.from({ length: count }, () => token)
            expect(areShareTokensUnique(tokens)).toBe(false)
          }
        ),
        { numRuns: 15 }
      )
    })
  })

  // --- (f) previous_versions is append-only ---

  describe('(f) previous_versions is append-only', () => {
    const versionArbitrary = fc.array(chapterArbitrary, {
      minLength: 1,
      maxLength: 5,
    })

    const versionsArrayArbitrary = fc.array(versionArbitrary, {
      minLength: 0,
      maxLength: 5,
    })

    it('appending new versions always passes the append-only check', () => {
      fc.assert(
        fc.property(
          versionsArrayArbitrary,
          fc.array(versionArbitrary, { minLength: 0, maxLength: 3 }),
          (existing, newVersions) => {
            const updated = [...existing, ...newVersions]
            expect(isPreviousVersionsAppendOnly(existing, updated)).toBe(true)
          }
        ),
        { numRuns: 15 }
      )
    })

    it('removing any version from previous_versions fails the append-only check', () => {
      fc.assert(
        fc.property(
          fc.array(versionArbitrary, { minLength: 2, maxLength: 5 }),
          fc.nat(),
          (versions, indexSeed) => {
            const removeIndex = indexSeed % versions.length
            const updated = [
              ...versions.slice(0, removeIndex),
              ...versions.slice(removeIndex + 1),
            ]
            expect(isPreviousVersionsAppendOnly(versions, updated)).toBe(false)
          }
        ),
        { numRuns: 15 }
      )
    })

    it('modifying a chapter in any existing version fails the append-only check', () => {
      fc.assert(
        fc.property(
          fc.array(versionArbitrary, { minLength: 1, maxLength: 5 }),
          fc.nat(),
          nonEmptyStringArbitrary,
          (versions, indexSeed, newTitle) => {
            const versionIndex = indexSeed % versions.length
            const chapterIndex = 0 // modify first chapter of selected version

            // Ensure the title actually changes
            if (versions[versionIndex][chapterIndex].title === newTitle) return

            const updated = versions.map((version, vi) =>
              vi === versionIndex
                ? version.map((chapter, ci) =>
                    ci === chapterIndex
                      ? { ...chapter, title: newTitle }
                      : chapter
                  )
                : version
            )
            expect(isPreviousVersionsAppendOnly(versions, updated)).toBe(false)
          }
        ),
        { numRuns: 15 }
      )
    })
  })
})
