export interface IntakeSignals {
  topic: string
  tension: string | null
  audiencePortrait: string | null
  resistancePattern: string | null
  stakes: string | null
  desiredShift: string | null
}

export interface Chapter {
  title: string
  body: string
  imagePrompt: string
  imageUrl: string | null
}

export type VisualStyle = 'watercolor' | 'manga' | 'flat' | 'ink_sketch'

export type StoryStatus = 'intake' | 'generating' | 'complete' | 'error'

export interface Story {
  id: string
  userId: string
  title: string | null
  topic: string
  status: StoryStatus
  sourceDocumentUrl: string | null
  sourceDocumentType: 'pdf' | 'pptx' | 'docx' | null
  intakeTranscript: import('./intake').IntakeMessage[]
  intakeSignals: IntakeSignals
  frameworkSelected: string[]
  storyContent: Chapter[]
  previousVersions: Chapter[][]
  visualStyle: VisualStyle
  stylePrompt: string | null
  visualsEnabled: boolean
  shareToken: string
  shareActive: boolean
  createdAt: string
  updatedAt: string
}
