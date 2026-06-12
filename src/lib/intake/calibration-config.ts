import type {
  CalibrationOption,
  PressureLevel,
  RelationshipDynamic,
  DesiredShiftType,
  ResistancePatternType,
} from '@/types/intake-payload'

export interface SingleSelectStepConfig<T extends string = string> {
  step: number
  field: string
  type: 'single-select'
  prompt: string
  supportingCopy: string
  options: CalibrationOption<T>[]
}

export interface SliderStepConfig {
  step: number
  field: string
  type: 'slider'
  prompt: string
  supportingCopy: string
}

export type CalibrationStepConfig = SingleSelectStepConfig | SliderStepConfig

export const PRESSURE_OPTIONS: CalibrationOption<PressureLevel>[] = [
  {
    value: 'act_now',
    label: 'Act now',
    description: 'Something important is at risk if they don\'t move.',
  },
  {
    value: 'change_soon',
    label: 'Change soon',
    description: 'The current pattern is already costing them.',
  },
  {
    value: 'grow_over_time',
    label: 'Grow over time',
    description: 'This is about perspective, identity, or maturity.',
  },
]

export const RELATIONSHIP_OPTIONS: CalibrationOption<RelationshipDynamic>[] = [
  {
    value: 'above',
    label: 'Above',
    description: 'You have authority, responsibility, or leadership over the audience.',
  },
  {
    value: 'beside',
    label: 'Beside',
    description: 'You are a peer, partner, teammate, or fellow traveler.',
  },
  {
    value: 'below',
    label: 'Below',
    description: 'You see something that people with more power may be missing.',
  },
  {
    value: 'internal',
    label: 'Internal',
    description: 'This is really a story you are telling yourself.',
  },
]

export const DESIRED_SHIFT_OPTIONS: CalibrationOption<DesiredShiftType>[] = [
  {
    value: 'behavioral',
    label: 'What they do',
    description: 'They need to act differently.',
  },
  {
    value: 'cognitive',
    label: 'What they understand',
    description: 'They need to see the issue differently.',
  },
  {
    value: 'emotional',
    label: 'What they feel',
    description: 'They need to care, trust, or feel less guarded.',
  },
  {
    value: 'identity',
    label: 'Who they believe they are',
    description: 'They need to step into a different role or self-image.',
  },
]

export const RESISTANCE_OPTIONS: CalibrationOption<ResistancePatternType>[] = [
  {
    value: 'absent',
    label: 'They\'re absent',
    description: 'They are not paying attention yet.',
  },
  {
    value: 'misdiagnosed',
    label: 'They\'re solving the wrong problem',
    description: 'They care, but they misunderstand what is happening.',
  },
  {
    value: 'skeptical',
    label: 'They don\'t believe it',
    description: 'They doubt the idea, the messenger, or the promised outcome.',
  },
  {
    value: 'threatened',
    label: 'They feel threatened',
    description: 'The idea puts their status, control, or identity at risk.',
  },
  {
    value: 'complacent',
    label: 'They\'re comfortable',
    description: 'The current state feels safe enough to ignore the need for change.',
  },
]

export const CALIBRATION_STEPS: CalibrationStepConfig[] = [
  {
    step: 5,
    field: 'pressure',
    type: 'single-select',
    prompt: 'How much pressure is behind this?',
    supportingCopy: 'Choose the kind of pressure the story needs to carry.',
    options: PRESSURE_OPTIONS,
  },
  {
    step: 6,
    field: 'toneTemperature',
    type: 'slider',
    prompt: 'How do you want this story to feel?',
    supportingCopy: 'Warm stories lean emotional and human. Cool stories lean clear and precise.',
  },
  {
    step: 7,
    field: 'relationshipDynamic',
    type: 'single-select',
    prompt: 'What\'s your relationship to this audience?',
    supportingCopy: 'Where are you speaking from?',
    options: RELATIONSHIP_OPTIONS,
  },
  {
    step: 8,
    field: 'desiredShift',
    type: 'single-select',
    prompt: 'What do you want to shift in them?',
    supportingCopy: 'Choose the kind of change the story should create.',
    options: DESIRED_SHIFT_OPTIONS,
  },
  {
    step: 9,
    field: 'resistancePattern',
    type: 'single-select',
    prompt: 'What\'s really going on when they resist?',
    supportingCopy: 'Name the pattern underneath the pushback.',
    options: RESISTANCE_OPTIONS,
  },
]

/**
 * Get the calibration step config for a given step number (5–9).
 */
export function getCalibrationStep(step: number): CalibrationStepConfig | undefined {
  return CALIBRATION_STEPS.find((s) => s.step === step)
}

/**
 * Get the display label for a calibration selection value.
 */
export function getDisplayLabel(step: number, value: string): string {
  const config = getCalibrationStep(step)
  if (!config || config.type !== 'single-select') return value
  const option = config.options.find((o) => o.value === value)
  return option?.label ?? value
}

/**
 * Get the tone readout label for a given slider value (0–100).
 */
export function getToneReadout(value: number): string {
  if (value < 20) return 'Mostly warm'
  if (value < 40) return 'Warm-leaning'
  if (value < 60) return 'Balanced'
  if (value < 80) return 'Cool-leaning'
  return 'Mostly cool'
}
