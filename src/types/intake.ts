import type { IntakeSignals } from './story'

export type IntakeMode =
  | 'conversational'
  | 'continuum'
  | 'structured_choice'
  | 'inference_confirm'

export interface IntakeMessage {
  role: 'assistant' | 'user'
  content: string
  mode?: IntakeMode
  signalTargeted?: keyof IntakeSignals
  timestamp: string
}

export interface IntakeState {
  storyId: string
  messages: IntakeMessage[]
  signals: IntakeSignals
  documentUploaded: boolean
  readyToGenerate: boolean
}
