import type { IntakePayload } from '@/types/intake-payload'
import type { IntakeSignals } from '@/types/story'

/**
 * Maps the ten-step IntakePayload to the existing IntakeSignals format
 * expected by the story generation engine.
 *
 * This is the only bridge between the new intake model and the existing
 * generation pipeline. The generation engine never sees IntakePayload directly.
 */
export function mapPayloadToSignals(payload: IntakePayload): IntakeSignals {
  return {
    topic: payload.idea,
    tension: payload.tuningOutReason,
    audiencePortrait: payload.audience,
    resistancePattern: payload.resistancePattern,
    stakes: payload.pressure,
    desiredShift: payload.desiredShift,
  }
}
