export type PressureLevel = "act_now" | "change_soon" | "grow_over_time"
export type RelationshipDynamic = "above" | "beside" | "below" | "internal"
export type DesiredShiftType = "behavioral" | "cognitive" | "emotional" | "identity"
export type ResistancePatternType = "absent" | "misdiagnosed" | "skeptical" | "threatened" | "complacent"

export interface IntakePayload {
  idea: string
  audience: string
  desiredBehaviorChange: string
  tuningOutReason: string
  pressure: PressureLevel
  toneTemperature: number // 0 (warm) – 100 (cool)
  relationshipDynamic: RelationshipDynamic
  desiredShift: DesiredShiftType
  resistancePattern: ResistancePatternType
  protectionPattern: string
}

export interface CalibrationOption<T extends string = string> {
  value: T
  label: string
  description: string
}
