export type EditorialScore = 'pass' | 'revise'

export interface EditorialVerdict {
  metaphorIntegrity: EditorialScore
  emotionalContractDelivered: EditorialScore
  identityActivated: EditorialScore
  toneCalibration: EditorialScore
  desiredShiftEmbodied: EditorialScore
  verdict: EditorialScore
  revisionNotes: string | null // only populated when verdict is 'revise'
}
