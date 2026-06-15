'use client'

import { useState, useCallback } from 'react'
import { readStream } from '@/lib/ai/stream'
import type { IntakeSignals } from '@/types/story'
import type { IntakePayload } from '@/types/intake-payload'
import { mapPayloadToSignals } from '@/lib/intake/payload-mapper'
import { getCalibrationStep, getToneReadout, getDisplayLabel } from '@/lib/intake/calibration-config'
import { INTAKE_QUESTIONS, buildValidationPrompt } from '@/lib/intake/questions-config'
import { validateQ1 } from '@/lib/intake/q1-validator'

export type IntakePhase = 'conversing' | 'calibrating' | 'final_question' | 'complete'

interface UseIntakeOptions {
  storyId: string
  documentContext?: string | null
}

export interface CalibrationAnswer {
  step: number
  field: string
  value: string | number
  displayLabel: string
  prompt: string
}

export interface AcceptedConversationAnswers {
  idea: string | null
  audience: string | null
  desiredBehaviorChange: string | null
  tuningOutReason: string | null
}

interface StreamEvent {
  type: 'token' | 'validation_result' | 'done' | 'error'
  content?: string
  accepted?: boolean
  step?: number
  message?: string
}

export function useIntake({
  storyId,
  documentContext = null,
}: UseIntakeOptions) {
  // Conversational state — client-driven sequence
  const [conversationStep, setConversationStep] = useState(0) // 0–3 for Q1–Q4
  const [acceptedAnswers, setAcceptedAnswers] = useState<AcceptedConversationAnswers>({
    idea: null,
    audience: null,
    desiredBehaviorChange: null,
    tuningOutReason: null,
  })
  const [followUpQuestion, setFollowUpQuestion] = useState<string | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Calibration state
  const [intakePhase, setIntakePhase] = useState<IntakePhase>('conversing')
  const [currentStep, setCurrentStep] = useState(5) // 5–10 for calibration
  const [payload, setPayload] = useState<Partial<IntakePayload>>({})
  const [calibrationAnswers, setCalibrationAnswers] = useState<CalibrationAnswer[]>([])
  const [readyToGenerate, setReadyToGenerate] = useState(false)

  // Derived state
  const conversationalQuestionsAnswered = [
    acceptedAnswers.idea,
    acceptedAnswers.audience,
    acceptedAnswers.desiredBehaviorChange,
    acceptedAnswers.tuningOutReason,
  ].filter(Boolean).length

  /**
   * Submit an answer for the current conversational question.
   * The client sends it to the AI for validation only.
   */
  const sendMessage = useCallback(
    async (content: string) => {
      setError(null)
      setFollowUpQuestion(null)
      setIsStreaming(true)

      // Client-side Q1 validation (fast reject for gibberish/bare topics)
      if (conversationStep === 0 && !acceptedAnswers.idea) {
        const rejection = validateQ1(content)
        if (rejection) {
          setFollowUpQuestion(rejection)
          setIsStreaming(false)
          return
        }
      }

      // Build the validation prompt with prior context
      const priorAnswers: Record<string, string> = {}
      if (acceptedAnswers.idea) priorAnswers.idea = acceptedAnswers.idea
      if (acceptedAnswers.audience) priorAnswers.audience = acceptedAnswers.audience
      if (acceptedAnswers.desiredBehaviorChange) priorAnswers.desiredBehaviorChange = acceptedAnswers.desiredBehaviorChange

      const validationPrompt = buildValidationPrompt(conversationStep, content, priorAnswers)

      // Build transcript for persistence
      const transcript = []
      const fields: (keyof AcceptedConversationAnswers)[] = ['idea', 'audience', 'desiredBehaviorChange', 'tuningOutReason']
      for (let i = 0; i < conversationStep; i++) {
        const q = INTAKE_QUESTIONS[i]
        const a = acceptedAnswers[fields[i]]
        if (q && a) {
          transcript.push({ question: q.headline, answer: a })
        }
      }
      // Add the current answer (will be persisted if accepted)
      transcript.push({ question: INTAKE_QUESTIONS[conversationStep].headline, answer: content })

      try {
        const response = await fetch('/api/intake/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            storyId,
            step: conversationStep,
            answer: content,
            validationPrompt,
            transcript,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => null)
          throw new Error(errorData?.error || `Request failed: ${response.status}`)
        }

        let streamedText = ''
        let accepted = false

        for await (const event of readStream<StreamEvent>(response)) {
          switch (event.type) {
            case 'token':
              streamedText += event.content || ''
              break
            case 'validation_result':
              accepted = event.accepted || false
              break
            case 'done':
              break
          }
        }

        if (accepted) {
          // Record the accepted answer
          const question = INTAKE_QUESTIONS[conversationStep]
          setAcceptedAnswers((prev) => ({
            ...prev,
            [question.field]: content,
          }))

          // Advance to next step
          if (conversationStep < 3) {
            setConversationStep((prev) => prev + 1)
          } else {
            // All 4 questions answered — transition to calibration
            setPayload((prev) => ({
              ...prev,
              idea: conversationStep === 0 ? content : acceptedAnswers.idea || '',
              audience: conversationStep === 1 ? content : acceptedAnswers.audience || '',
              desiredBehaviorChange: conversationStep === 2 ? content : acceptedAnswers.desiredBehaviorChange || '',
              tuningOutReason: content,
            }))
            setIntakePhase('calibrating')
          }
          setFollowUpQuestion(null)
        } else {
          // AI rejected — show its follow-up question
          const cleanText = streamedText.replace('[ACCEPTED]', '').trim()
          setFollowUpQuestion(cleanText || null)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setIsStreaming(false)
      }
    },
    [storyId, conversationStep, acceptedAnswers, documentContext]
  )

  /**
   * Handle a calibration step answer (Q5–Q9).
   */
  const submitCalibrationAnswer = useCallback(
    (step: number, field: string, value: string | number) => {
      setPayload((prev) => ({ ...prev, [field]: value }))

      let displayLabel: string
      if (field === 'toneTemperature' && typeof value === 'number') {
        displayLabel = getToneReadout(value)
      } else {
        displayLabel = getDisplayLabel(step, String(value))
      }

      const stepConfig = getCalibrationStep(step)
      const prompt = stepConfig?.prompt ?? ''

      setCalibrationAnswers((prev) => [
        ...prev,
        { step, field, value, displayLabel, prompt },
      ])

      if (step < 9) {
        setCurrentStep(step + 1)
      } else {
        setIntakePhase('final_question')
        setCurrentStep(10)
      }
    },
    []
  )

  /**
   * Handle Q10 answer (free text — protection pattern).
   */
  const submitFinalAnswer = useCallback(
    (content: string) => {
      setPayload((prev) => ({ ...prev, protectionPattern: content }))
      setIntakePhase('complete')
      setReadyToGenerate(true)
    },
    []
  )

  const getFinalPayload = useCallback((): IntakePayload | null => {
    if (
      !payload.idea ||
      !payload.audience ||
      !payload.desiredBehaviorChange ||
      !payload.tuningOutReason ||
      !payload.pressure ||
      payload.toneTemperature === undefined ||
      !payload.relationshipDynamic ||
      !payload.desiredShift ||
      !payload.resistancePattern ||
      !payload.protectionPattern
    ) {
      return null
    }
    return payload as IntakePayload
  }, [payload])

  const getFinalSignals = useCallback((): IntakeSignals | null => {
    const finalPayload = getFinalPayload()
    if (!finalPayload) return null
    return mapPayloadToSignals(finalPayload)
  }, [getFinalPayload])

  return {
    isStreaming,
    readyToGenerate,
    error,
    sendMessage,
    setReadyToGenerate,

    // Conversation state
    conversationStep,
    acceptedAnswers,
    followUpQuestion,
    conversationalQuestionsAnswered,

    // Calibration state
    intakePhase,
    currentStep,
    payload,
    calibrationAnswers,
    submitCalibrationAnswer,
    submitFinalAnswer,
    getFinalPayload,
    getFinalSignals,
  }
}
