export interface CreativeBrief {
  mode: string
  modeRationale: string
  protagonist: {
    type: string
    world: string
    rationale: string
  }
  metaphor: {
    vehicle: string
    tenor: string
    rationale: string
  }
  emotionalContract: string
  identityActivated: string
  structure: {
    chapters: number // 3-5
    arc: string
    tensionPeak: number // chapter index where tension peaks
    resolutionType: string
  }
  toneBenchmark: string
  constraints: string[]
  mustNot: string[]
}
