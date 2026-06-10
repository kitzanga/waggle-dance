import type { StoryStatus } from '@/types/story'
import type { IntakeMessage } from '@/types/intake'

/**
 * Intake Signal Invariants
 *
 * This module enforces three invariants for story intake:
 * (a) A story cannot transition to `generating` without a non-empty topic
 * (b) intake_transcript is append-only (new entries extend, never remove existing)
 * (c) document fields (source_document_url, source_document_type) are both-set-or-both-null
 */

/**
 * Validates whether a status transition is allowed.
 * A transition to 'generating' requires a non-empty topic.
 */
export function canTransitionTo(
  targetStatus: StoryStatus,
  topic: string
): { allowed: boolean; reason?: string } {
  if (targetStatus === 'generating') {
    const trimmedTopic = topic.trim()
    if (!trimmedTopic) {
      return {
        allowed: false,
        reason: 'Cannot transition to generating without a non-empty topic',
      }
    }
  }
  return { allowed: true }
}

/**
 * Validates that a transcript update is append-only.
 * The new transcript must contain all existing messages in the same order,
 * with only new messages appended at the end.
 */
export function isTranscriptAppendOnly(
  existing: IntakeMessage[],
  updated: IntakeMessage[]
): boolean {
  // Updated cannot be shorter than existing
  if (updated.length < existing.length) {
    return false
  }

  // All existing entries must appear in the same order at the start
  for (let i = 0; i < existing.length; i++) {
    if (
      existing[i].role !== updated[i].role ||
      existing[i].content !== updated[i].content ||
      existing[i].timestamp !== updated[i].timestamp
    ) {
      return false
    }
  }

  return true
}

/**
 * Validates document field consistency.
 * source_document_url and source_document_type must be both set or both null.
 */
export function areDocumentFieldsConsistent(
  documentUrl: string | null,
  documentType: 'pdf' | 'pptx' | 'docx' | null
): boolean {
  const urlSet = documentUrl !== null && documentUrl.trim().length > 0
  const typeSet = documentType !== null

  return urlSet === typeSet
}
