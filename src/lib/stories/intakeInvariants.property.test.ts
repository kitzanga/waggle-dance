import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  canTransitionTo,
  isTranscriptAppendOnly,
  areDocumentFieldsConsistent,
} from './intakeInvariants'
import type { StoryStatus } from '@/types/story'
import type { IntakeMessage, IntakeMode } from '@/types/intake'

/**
 * Property-based tests for intake signal invariants.
 *
 * **Validates: Requirements 2.3, 2.6, 2.8, 3.7**
 *
 * Property 2: Intake Signal Invariants —
 * (a) story cannot transition to `generating` without non-empty topic,
 * (b) intake_transcript is append-only,
 * (c) document fields are both-set-or-both-null
 */
describe('Feature: waggle-dance, Property 2: Intake Signal Invariants', () => {
  // --- Arbitraries ---

  const storyStatusArbitrary: fc.Arbitrary<StoryStatus> = fc.constantFrom(
    'intake',
    'generating',
    'complete',
    'error'
  )

  const intakeModeArbitrary: fc.Arbitrary<IntakeMode> = fc.constantFrom(
    'conversational',
    'continuum',
    'structured_choice',
    'inference_confirm'
  )

  const intakeMessageArbitrary: fc.Arbitrary<IntakeMessage> = fc.record({
    role: fc.constantFrom('assistant' as const, 'user' as const),
    content: fc.string({ minLength: 1, maxLength: 200 }),
    mode: fc.option(intakeModeArbitrary, { nil: undefined }),
    timestamp: fc
      .integer({ min: 1577836800000, max: 1893456000000 }) // 2020-01-01 to 2030-01-01
      .map((ms) => new Date(ms).toISOString()),
  })

  const transcriptArbitrary = fc.array(intakeMessageArbitrary, {
    minLength: 0,
    maxLength: 10,
  })

  const documentTypeArbitrary: fc.Arbitrary<'pdf' | 'pptx' | 'docx'> =
    fc.constantFrom('pdf', 'pptx', 'docx')

  const nonEmptyTopicArbitrary = fc.string({ minLength: 1, maxLength: 200 }).filter(
    (s) => s.trim().length > 0
  )

  const whitespaceOnlyArbitrary = fc.constantFrom('', ' ', '  ', '\t', '\n', '  \n\t  ')

  // --- (a) Transition guard: cannot go to `generating` without non-empty topic ---

  describe('(a) Transition guard — cannot go to generating without non-empty topic', () => {
    it('transitioning to generating with a non-empty topic is always allowed', () => {
      fc.assert(
        fc.property(nonEmptyTopicArbitrary, (topic) => {
          const result = canTransitionTo('generating', topic)
          expect(result.allowed).toBe(true)
        }),
        { numRuns: 15 }
      )
    })

    it('transitioning to generating with empty/whitespace-only topic is always rejected', () => {
      fc.assert(
        fc.property(whitespaceOnlyArbitrary, (topic) => {
          const result = canTransitionTo('generating', topic)
          expect(result.allowed).toBe(false)
          expect(result.reason).toBeDefined()
        }),
        { numRuns: 15 }
      )
    })

    it('transitioning to any non-generating status is always allowed regardless of topic', () => {
      const nonGeneratingStatus: fc.Arbitrary<StoryStatus> = fc.constantFrom(
        'intake',
        'complete',
        'error'
      )
      const anyTopic = fc.oneof(whitespaceOnlyArbitrary, nonEmptyTopicArbitrary)

      fc.assert(
        fc.property(nonGeneratingStatus, anyTopic, (status, topic) => {
          const result = canTransitionTo(status, topic)
          expect(result.allowed).toBe(true)
        }),
        { numRuns: 15 }
      )
    })
  })

  // --- (b) Transcript is append-only ---

  describe('(b) Transcript append-only — new entries extend without removing existing', () => {
    it('appending messages to a transcript always passes the append-only check', () => {
      fc.assert(
        fc.property(
          transcriptArbitrary,
          fc.array(intakeMessageArbitrary, { minLength: 0, maxLength: 5 }),
          (existing, newMessages) => {
            const updated = [...existing, ...newMessages]
            expect(isTranscriptAppendOnly(existing, updated)).toBe(true)
          }
        ),
        { numRuns: 15 }
      )
    })

    it('removing any message from the transcript fails the append-only check', () => {
      fc.assert(
        fc.property(
          fc.array(intakeMessageArbitrary, { minLength: 2, maxLength: 10 }),
          fc.nat(),
          (transcript, indexSeed) => {
            const removeIndex = indexSeed % transcript.length
            const updated = [
              ...transcript.slice(0, removeIndex),
              ...transcript.slice(removeIndex + 1),
            ]
            expect(isTranscriptAppendOnly(transcript, updated)).toBe(false)
          }
        ),
        { numRuns: 15 }
      )
    })

    it('modifying any existing message in the transcript fails the append-only check', () => {
      fc.assert(
        fc.property(
          fc.array(intakeMessageArbitrary, { minLength: 1, maxLength: 10 }),
          fc.nat(),
          fc.string({ minLength: 1, maxLength: 100 }),
          (transcript, indexSeed, newContent) => {
            const modIndex = indexSeed % transcript.length
            // Only test when the content actually changes
            if (newContent === transcript[modIndex].content) return

            const updated = transcript.map((msg, i) =>
              i === modIndex ? { ...msg, content: newContent } : msg
            )
            expect(isTranscriptAppendOnly(transcript, updated)).toBe(false)
          }
        ),
        { numRuns: 15 }
      )
    })
  })

  // --- (c) Document fields both-set-or-both-null ---

  describe('(c) Document fields consistency — both-set-or-both-null', () => {
    it('both url and type set together is always consistent', () => {
      const urlArbitrary = fc
        .webUrl()
        .filter((u) => u.trim().length > 0)

      fc.assert(
        fc.property(urlArbitrary, documentTypeArbitrary, (url, docType) => {
          expect(areDocumentFieldsConsistent(url, docType)).toBe(true)
        }),
        { numRuns: 15 }
      )
    })

    it('both url and type null is always consistent', () => {
      // This is a deterministic property — always true
      expect(areDocumentFieldsConsistent(null, null)).toBe(true)
    })

    it('url set but type null is always inconsistent', () => {
      const urlArbitrary = fc
        .webUrl()
        .filter((u) => u.trim().length > 0)

      fc.assert(
        fc.property(urlArbitrary, (url) => {
          expect(areDocumentFieldsConsistent(url, null)).toBe(false)
        }),
        { numRuns: 15 }
      )
    })

    it('url null but type set is always inconsistent', () => {
      fc.assert(
        fc.property(documentTypeArbitrary, (docType) => {
          expect(areDocumentFieldsConsistent(null, docType)).toBe(false)
        }),
        { numRuns: 15 }
      )
    })

    it('empty/whitespace url with type set is always inconsistent', () => {
      fc.assert(
        fc.property(whitespaceOnlyArbitrary, documentTypeArbitrary, (url, docType) => {
          expect(areDocumentFieldsConsistent(url, docType)).toBe(false)
        }),
        { numRuns: 15 }
      )
    })
  })
})
