/**
 * Deterministic intake question sequence.
 * The client owns the ordering — the AI only validates answers.
 */

export interface IntakeQuestion {
  id: string
  /** The field name in the payload */
  field: 'idea' | 'audience' | 'desiredBehaviorChange' | 'tuningOutReason'
  /** Displayed as the hero headline */
  headline: string
  /** Shown below the headline as supporting copy */
  supporting: string
  /** Sent to the AI as context for validation */
  validationPrompt: string
}

export const INTAKE_QUESTIONS: IntakeQuestion[] = [
  {
    id: 'idea',
    field: 'idea',
    headline: "What's the idea?",
    supporting: 'A sentence is enough. We\u2019ll build from there.',
    validationPrompt: `The user was asked for their core idea — the thing they want to communicate. They said: "{answer}". 

Accept if it contains a claim, point of view, tension, or argument (not just a topic label like "AI" or "leadership"). 

If acceptable, respond with exactly: [ACCEPTED]
If too vague or just a topic name, respond with a single short question (max 15 words) to sharpen it. No affirmations, no preamble.`,
  },
  {
    id: 'audience',
    field: 'audience',
    headline: 'Who needs to hear it?',
    supporting: 'A person, a role, a mindset.',
    validationPrompt: `The user was asked who needs to hear their story. Their idea is: "{idea}". They said: "{answer}".

Accept if it names a specific enough audience to write for (a role, title, type of person, or described mindset).

If acceptable, respond with exactly: [ACCEPTED]
If too vague (e.g., just "people" or "everyone"), respond with a single short question (max 15 words) to narrow it. No affirmations, no preamble.`,
  },
  {
    id: 'desiredBehaviorChange',
    field: 'desiredBehaviorChange',
    headline: 'What do you want them to do differently after they hear it?',
    supporting: 'A behavior, a decision, a shift in attention.',
    validationPrompt: `The user was asked what they want their audience to do differently. Their idea is: "{idea}". Their audience is: "{audience}". They said: "{answer}".

Accept if it describes a concrete behavioral change, decision, or shift — even loosely stated.

If acceptable, respond with exactly: [ACCEPTED]
If too abstract or empty, respond with a single short question (max 15 words) to make it concrete. No affirmations, no preamble.`,
  },
  {
    id: 'tuningOutReason',
    field: 'tuningOutReason',
    headline: "What's their biggest reason for tuning this out?",
    supporting: 'The real reason, not the polite one.',
    validationPrompt: `The user was asked why their audience tunes this out. Their idea is: "{idea}". Their audience is: "{audience}". The desired shift is: "{desiredBehaviorChange}". They said: "{answer}".

Accept if it names a real resistance reason — a belief, a competing priority, a fear, or a pattern of avoidance.

If acceptable, respond with exactly: [ACCEPTED]
If too generic or empty, respond with a single short question (max 15 words) to dig into the real reason. No affirmations, no preamble.`,
  },
]

export function getIntakeQuestion(step: number): IntakeQuestion | undefined {
  return INTAKE_QUESTIONS[step]
}

/**
 * Build the validation prompt for a given step, injecting prior answers as context.
 */
export function buildValidationPrompt(
  step: number,
  answer: string,
  priorAnswers: Record<string, string>
): string {
  const question = INTAKE_QUESTIONS[step]
  if (!question) return ''

  let prompt = question.validationPrompt.replace('{answer}', answer)

  // Inject prior context
  for (const [key, value] of Object.entries(priorAnswers)) {
    prompt = prompt.replace(`{${key}}`, value)
  }

  return prompt
}
