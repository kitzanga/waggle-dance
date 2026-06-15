'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useIntake } from '@/hooks/useIntake'
import { OpeningState } from './OpeningState'
import { ExchangeList } from './ExchangeList'
import { ProgressIndicator } from './ProgressIndicator'
import { InputBar } from './InputBar'
import { CalibrationStep } from './CalibrationStep'
import { SingleSelectCard } from './SingleSelectCard'
import { ToneSlider } from './ToneSlider'
import { PastCalibrationStep } from './PastCalibrationStep'
import { getCalibrationStep } from '@/lib/intake/calibration-config'
import type { SingleSelectStepConfig } from '@/lib/intake/calibration-config'
import type { IntakeSignals } from '@/types/story'
import type { IntakePayload } from '@/types/intake-payload'

interface Exchange {
  question: string
  answer: string | null
}

interface IntakeChatProps {
  storyId: string
  initialMessages?: import('@/types/intake').IntakeMessage[]
  initialSignals?: Partial<IntakeSignals>
  onComplete: (signals: IntakeSignals, payload: IntakePayload) => void
}

export function IntakeChat({
  storyId,
  initialMessages,
  initialSignals,
  onComplete,
}: IntakeChatProps) {
  const [documentContext, setDocumentContext] = useState<string | null>(null)
  const [attachError, setAttachError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Calibration local state
  const [currentSelection, setCurrentSelection] = useState<string | null>(null)
  const [sliderValue, setSliderValue] = useState(50)
  const [sliderInteracted, setSliderInteracted] = useState(false)

  const {
    messages,
    isStreaming,
    readyToGenerate,
    error,
    sendMessage,
    intakePhase,
    currentStep,
    calibrationAnswers,
    acceptedAnswers,
    conversationalQuestionsAnswered,
    submitCalibrationAnswer,
    submitFinalAnswer,
    getFinalPayload,
    getFinalSignals,
  } = useIntake({
    storyId,
    initialMessages,
    initialSignals,
    documentContext,
  })

  // ─── Exchange construction ───
  // Build exchanges from accepted answers only. Rejected attempts remain
  // visible as part of the "current exchange" context, not as completed history.
  //
  // An exchange is "completed" only when the AI emits a signal for it
  // (tracked in acceptedAnswers). The conversation messages include both
  // accepted and rejected attempts, but only accepted ones form past exchanges.

  // Map of question labels for display
  const QUESTION_LABELS = [
    "What's the idea?",
    "Who needs to hear it?",
    "What do you want them to do differently after they hear it?",
    "What's their biggest reason for tuning this out?",
  ]

  // Build completed exchanges from accepted answers
  const completedExchanges: Exchange[] = []
  const acceptedFields: (keyof typeof acceptedAnswers)[] = [
    'idea', 'audience', 'desiredBehaviorChange', 'tuningOutReason',
  ]

  for (let i = 0; i < acceptedFields.length; i++) {
    const answer = acceptedAnswers[acceptedFields[i]]
    if (answer) {
      completedExchanges.push({
        question: QUESTION_LABELS[i],
        answer,
      })
    }
  }

  // Determine the current "hero" question — the one being actively asked.
  // This is either the AI's most recent message (could be a re-ask) or
  // the next question in sequence if we just completed a transition.
  // Hide the hero once all 4 conversational questions are answered to avoid
  // showing a stale synthesizing question alongside the calibration step.
  let heroQuestion: string | null = null
  if (intakePhase === 'conversing' && completedExchanges.length < 4) {
    if (messages.length === 0) {
      // Opening state handles this
      heroQuestion = null
    } else {
      // Find the last assistant message — that's the current question
      const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant')
      if (lastAssistant) {
        heroQuestion = lastAssistant.content
      } else {
        // User has submitted first answer but AI hasn't responded yet
        // (streaming state) — show nothing for hero, the opening question
        // "What's the idea?" was the prompt
        heroQuestion = QUESTION_LABELS[0]
      }
    }
  }

  const hasStarted = messages.length > 0
  const showOpening = !hasStarted && intakePhase === 'conversing'

  // Calculate progress
  const calibrationProgress = calibrationAnswers.length + (intakePhase === 'complete' ? 1 : 0) // +1 for Q10

  function handleSubmit(text: string) {
    if (intakePhase === 'final_question') {
      submitFinalAnswer(text)
    } else {
      sendMessage(text)
    }
  }

  const handleAttach = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ]
    if (!validTypes.includes(file.type)) {
      setAttachError('Only PDF, PPTX, and DOCX files are supported')
      setTimeout(() => setAttachError(null), 5000)
      e.target.value = ''
      return
    }

    if (file.size > 20 * 1024 * 1024) {
      setAttachError('File must be under 20 MB')
      setTimeout(() => setAttachError(null), 5000)
      e.target.value = ''
      return
    }

    uploadFile(file)
    e.target.value = ''
  }

  async function uploadFile(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('storyId', storyId)

    try {
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      })
      if (response.ok) {
        const result = await response.json()
        setDocumentContext(result.extractedText)
      } else {
        setAttachError('Could not read document. Try a different file.')
        setTimeout(() => setAttachError(null), 5000)
      }
    } catch {
      setAttachError('Upload failed. Please try again.')
      setTimeout(() => setAttachError(null), 5000)
    }
  }

  // Handle calibration continue
  function handleCalibrationContinue() {
    const stepConfig = getCalibrationStep(currentStep)
    if (!stepConfig) return

    if (stepConfig.type === 'slider') {
      submitCalibrationAnswer(currentStep, stepConfig.field, sliderValue)
      // Reset slider state for next potential use
      setSliderInteracted(false)
      setSliderValue(50)
    } else if (currentSelection !== null) {
      submitCalibrationAnswer(currentStep, stepConfig.field, currentSelection)
      setCurrentSelection(null)
    }
  }

  // Determine if continue is available
  function canContinue(): boolean {
    const stepConfig = getCalibrationStep(currentStep)
    if (!stepConfig) return false
    if (stepConfig.type === 'slider') return sliderInteracted
    return currentSelection !== null
  }

  // When ready to generate, hand off after a brief delay
  useEffect(() => {
    if (!readyToGenerate) return
    const finalSignals = getFinalSignals()
    const finalPayload = getFinalPayload()
    if (!finalSignals || !finalPayload) return
    const timer = setTimeout(() => onComplete(finalSignals, finalPayload), 2000)
    return () => clearTimeout(timer)
  }, [readyToGenerate]) // eslint-disable-line react-hooks/exhaustive-deps

  // Determine input bar visibility
  const inputBarHidden = intakePhase === 'calibrating' || intakePhase === 'complete'

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 'calc(100vh - 48px)' }}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.pptx"
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
      />

      {/* Conversation area — bottom-anchored, content grows upward */}
      <div className="flex-1 flex flex-col justify-end overflow-hidden">
        {showOpening ? (
          <OpeningState visible={true} />
        ) : (
          <div
            className="intake-content-column flex flex-col justify-end flex-1 overflow-y-auto"
            style={{
              maxWidth: 'var(--content-max)',
              margin: '0 auto',
              width: '100%',
            }}
          >
            {/* Completed conversational exchanges (accepted answers only) */}
            {completedExchanges.length > 0 && (
              <ExchangeList
                exchanges={completedExchanges}
                isStreaming={false}
                hideHero={intakePhase !== 'conversing'}
              />
            )}

            {/* Active conversational question (hero) — only during conversing */}
            {intakePhase === 'conversing' && heroQuestion && !isStreaming && (
              <div style={{ paddingBottom: '24px' }}>
                <p
                  style={{
                    fontSize: 'var(--text-lg)',
                    fontWeight: 400,
                    lineHeight: 1.45,
                    letterSpacing: '-0.015em',
                    color: 'var(--text-primary)',
                  }}
                >
                  {heroQuestion}
                </p>
              </div>
            )}

            {/* Past calibration steps */}
            {calibrationAnswers.map((answer) => (
              <div key={`cal-${answer.step}`} style={{ paddingBottom: '24px' }}>
                <PastCalibrationStep
                  prompt={answer.prompt}
                  selectedLabel={answer.displayLabel}
                />
              </div>
            ))}

            {/* Active calibration step */}
            {intakePhase === 'calibrating' && (
              <ActiveCalibrationView
                currentStep={currentStep}
                currentSelection={currentSelection}
                onSelect={setCurrentSelection}
                sliderValue={sliderValue}
                onSliderChange={setSliderValue}
                sliderInteracted={sliderInteracted}
                onSliderInteract={() => setSliderInteracted(true)}
                canContinue={canContinue()}
                onContinue={handleCalibrationContinue}
              />
            )}

            {/* Q10 prompt — free text return */}
            {intakePhase === 'final_question' && (
              <div style={{ paddingBottom: '24px' }}>
                <p
                  style={{
                    fontSize: 'var(--text-lg)',
                    fontWeight: 400,
                    lineHeight: 1.45,
                    letterSpacing: '-0.015em',
                    color: 'var(--text-primary)',
                  }}
                >
                  What are they trying to protect or prove?
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="px-6 py-2">
          <p
            className="text-center"
            style={{ fontSize: 'var(--text-xs)', color: '#ff453a' }}
          >
            {error}
          </p>
        </div>
      )}

      {/* Progress indicator */}
      <ProgressIndicator
        conversationProgress={conversationalQuestionsAnswered}
        calibrationProgress={calibrationProgress}
        visible={hasStarted}
      />

      {/* Input bar — hidden during calibration */}
      <InputBar
        onSubmit={handleSubmit}
        onAttach={handleAttach}
        isDisabled={isStreaming}
        attachError={attachError}
        hidden={inputBarHidden}
      />
    </div>
  )
}

// ─── Active Calibration View (extracted for clarity) ───

interface ActiveCalibrationViewProps {
  currentStep: number
  currentSelection: string | null
  onSelect: (value: string) => void
  sliderValue: number
  onSliderChange: (value: number) => void
  sliderInteracted: boolean
  onSliderInteract: () => void
  canContinue: boolean
  onContinue: () => void
}

function ActiveCalibrationView({
  currentStep,
  currentSelection,
  onSelect,
  sliderValue,
  onSliderChange,
  sliderInteracted,
  onSliderInteract,
  canContinue,
  onContinue,
}: ActiveCalibrationViewProps) {
  const stepConfig = getCalibrationStep(currentStep)
  if (!stepConfig) return null

  return (
    <CalibrationStep
      prompt={stepConfig.prompt}
      supportingCopy={stepConfig.supportingCopy}
      onContinue={onContinue}
      canContinue={canContinue}
    >
      {stepConfig.type === 'single-select' && (
        <SingleSelectCard
          options={(stepConfig as SingleSelectStepConfig).options}
          selectedValue={currentSelection}
          onSelect={onSelect}
        />
      )}
      {stepConfig.type === 'slider' && (
        <ToneSlider
          value={sliderValue}
          onChange={onSliderChange}
          hasInteracted={sliderInteracted}
          onInteract={onSliderInteract}
        />
      )}
    </CalibrationStep>
  )
}
