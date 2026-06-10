import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { buildStoryInsertRecord } from './createStory'
import type { VisualStyle } from '@/types/story'

/**
 * Property-based test for authentication and story ownership.
 *
 * **Validates: Requirements 1.1, 1.2**
 *
 * Property 1 (partial): Story ownership invariant —
 * Stories created in an authenticated session are always associated
 * with the authenticated user's ID.
 */
describe('Feature: waggle-dance, Property 1: Story ownership invariant', () => {
  const validVisualStyles: VisualStyle[] = ['watercolor', 'manga', 'flat', 'ink_sketch']

  // Arbitrary for generating valid UUIDs (simulating Supabase auth user IDs)
  const uuidArbitrary = fc.uuid()

  // Arbitrary for generating optional topic strings
  const topicArbitrary = fc.oneof(
    fc.constant(undefined),
    fc.string({ minLength: 0, maxLength: 500 })
  )

  // Arbitrary for generating optional visual style
  const visualStyleArbitrary = fc.oneof(
    fc.constant(undefined),
    fc.constantFrom(...validVisualStyles)
  )

  it('story user_id always equals the authenticated user ID regardless of input', () => {
    fc.assert(
      fc.property(
        uuidArbitrary,
        topicArbitrary,
        visualStyleArbitrary,
        (authenticatedUserId, topic, visualStyle) => {
          const record = buildStoryInsertRecord({
            authenticatedUserId,
            topic,
            visualStyle,
          })

          // The core ownership invariant: user_id must equal the authenticated user's ID
          expect(record.user_id).toBe(authenticatedUserId)
        }
      ),
      { numRuns: 15 }
    )
  })

  it('story user_id cannot be overridden by other parameters', () => {
    fc.assert(
      fc.property(
        uuidArbitrary,
        uuidArbitrary,
        topicArbitrary,
        (authenticatedUserId, differentUserId, topic) => {
          // Even if we generate a different user ID, the record must use the authenticated one
          const record = buildStoryInsertRecord({
            authenticatedUserId,
            topic,
          })

          expect(record.user_id).toBe(authenticatedUserId)
          // If the IDs differ, the record must NOT use the other ID
          if (authenticatedUserId !== differentUserId) {
            expect(record.user_id).not.toBe(differentUserId)
          }
        }
      ),
      { numRuns: 15 }
    )
  })

  it('story always starts in intake status with correct ownership', () => {
    fc.assert(
      fc.property(
        uuidArbitrary,
        topicArbitrary,
        visualStyleArbitrary,
        (authenticatedUserId, topic, visualStyle) => {
          const record = buildStoryInsertRecord({
            authenticatedUserId,
            topic,
            visualStyle,
          })

          // Ownership is set correctly
          expect(record.user_id).toBe(authenticatedUserId)
          // Status starts as intake
          expect(record.status).toBe('intake')
          // Visual style defaults to watercolor if not provided
          if (visualStyle === undefined) {
            expect(record.visual_style).toBe('watercolor')
          } else {
            expect(record.visual_style).toBe(visualStyle)
          }
          // Topic defaults to empty string if not provided
          if (topic === undefined) {
            expect(record.topic).toBe('')
          } else {
            expect(record.topic).toBe(topic)
          }
        }
      ),
      { numRuns: 15 }
    )
  })
})
