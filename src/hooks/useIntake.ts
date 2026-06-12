'use client'

import { useState, useCallback } from 'react'
import { readStream } from '@/lib/ai/stream'
import type { IntakeSignals } from '@/types/story'
import type { IntakeMessage } from '@/types/intake'
import type { IntakeStreamEvent } from '@/types/api'
import type { IntakePayload } from '@/types/intake-payload'
import { mapPayloadToSignals } from '@/lib/intake/payload-mapper'
import { getCalibrationStep, getToneReadout, getDisplayLabel } from '@/lib/intake/calibration-config'
import { validateQ1 } from '@/lib/intake/q1-validator'

export type IntakePhase = 'conversing' | 'calibrating' | 'final_question' | 'complete'

interface UseIntakeOptions {
  storyId: string
  initialMessages?: IntakeMessage[]
  initialSignals?: Partial<IntakeSignals>
  documentContext?: string | null
}

export interface CalibrationAnswer {
  step: number
  field: string
  value: string | number
  displayLabel: string
  prompt: string
}

/**
 * Tracks accepted conversational answers explicitly.
 * Only populated when the AI accepts an answer and advances (emits a signal).
 */
export interface AcceptedConversationAnswers {
  idea: string | null
  audience: string | null
  desiredBehaviorChange: string | null
  tuningOutReason: string | null
}

// Signal-to-field mapping: when the AI emits a signal for one of these keys,
// we know the corresponding conversational answer was accepted.
const SIGNAL_TO_CONVERSATION_FIELD: Record<string, keyof AcceptedConversationAnswers> = {
  topic: 'idea',
  audiencePortrait: 'audience',
  desiredShift: 'desiredBehaviorChange',
  resistancePattern: 'tuningOutReason',
}

export function useIntake({
  storyId,
  initialMessages = [],
  initialSignals = {},
  documentContext = null,
}: UseIntakeOptions) {
  const [messages, setMessages] = useState<IntakeMessage[]>(initialMessages)
  const [signals, setSignals] = useState<Partial<IntakeSignals>>(initialSignals)
  const [isStreaming, setIsStreaming] = useState(false)
  const [readyToGenerate, setReadyToGenerate] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Calibration state
  const [intakePhase, setIntakePhase] = useState<IntakePhase>('conversing')
  const [currentStep, setCurrentStep] = useState(1) // 1–10
  const [payload, setPayload] = useState<Partial<IntakePayload>>({})
  const [calibrationAnswers, setCalibrationAnswers] = useState<CalibrationAnswer[]>([])

  // Explicitly tracked accepted conversational answers
  const [acceptedAnswers, setAcceptedAnswers] = useState<AcceptedConversationAnswers>({
    idea: null,
    audience: null,
    desiredBehaviorChange: null,
    tuningOutReason: null,
  })

  // Count completed conversational questions from accepted answers
  const conversationalQuestionsAnswered = [
    acceptedAnswers.idea,
    acceptedAnswers.audience,
    acceptedAnswers.desiredBehaviorChange,
    acceptedAnswers.tuningOutReason,
  ].filter(Boolean).length

  const sendMessage = useCallback(
    async (content: string) => {
      setError(null)
      setIsStreaming(true)

      const userMessage: IntakeMessage = {
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
      }

      const updatedMessages = [...messages, userMessage]
      setMessages(updatedMessages)

      // Client-side Q1 validation: if idea hasn't been accepted yet,
      // validate before sending to the API.
      if (!acceptedAnswers.idea) {
        const rejection = validateQ1(content)
        if (rejection) {
          // Show the rejection as an AI message — don't hit the API
          const rejectionMessage: IntakeMessage = {
            role: 'assistant',
            content: rejection,
            timestamp: new Date().toISOString(),
          }
          setMessages((prev) => [...prev, rejectionMessage])
          setIsStreaming(false)
          return
        }
      }

      try {
        const response = await fetch('/api/intake/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            storyId,
            message: content,
            signals,
            messages: updatedMessages,
            documentContext,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => null)
          throw new Error(errorData?.error || `Request failed: ${response.status}`)
        }

        let assistantContent = ''
        let signalsReady = false
        const signalUpdates: Array<{ signal: string; value: string }> = []

        for await (const event of readStream<IntakeStreamEvent>(response)) {
          switch (event.type) {
            case 'token':
              assistantContent += event.content
              break
            case 'signal_update':
              signalUpdates.push({ signal: event.signal, value: event.value })
              break
            case 'ready_to_generate':
              signalsReady = true
              break
            case 'done':
              break
          }
        }

        // Apply signal updates and track accepted answers.
        // When the AI emits a signal, it means it accepted the user's answer
        // for that question and is advancing.
        if (signalUpdates.length > 0) {
          setSignals((prev) => {
            const updated = { ...prev }
            for (const { signal, value } of signalUpdates) {
              (updated as Record<string, string>)[signal] = value
            }
            return updated
          })

          // Mark accepted answers based on which signals were emitted.
          // For topic (Q1), double-check that the answer passes client validation
          // as a safety net against AI non-compliance.
          setAcceptedAnswers((prev) => {
            const updated = { ...prev }
            for (const { signal } of signalUpdates) {
              const field = SIGNAL_TO_CONVERSATION_FIELD[signal]
              if (field && !updated[field]) {
                // For Q1 (idea/topic), validate client-side as safety net
                if (field === 'idea' && validateQ1(content) !== null) {
                  // Don't accept — validator rejected it
                } else {
                  updated[field] = content
                }
              }
            }
            return updated
          })
        }

        if (signalsReady && intakePhase === 'conversing') {
          // All 4 signals gathered. Transition to calibration.
          // Do NOT display the AI's response — go directly to Q5.
          // Use accepted answers for payload (not positional slicing).
          setAcceptedAnswers((prev) => {
            // Also capture the current answer if a signal was just emitted
            const final = { ...prev }
            for (const { signal } of signalUpdates) {
              const field = SIGNAL_TO_CONVERSATION_FIELD[signal]
              if (field && !final[field]) {
                final[field] = content
              }
            }
            setPayload((prevPayload) => ({
              ...prevPayload,
              idea: final.idea || '',
              audience: final.audience || '',
              desiredBehaviorChange: final.desiredBehaviorChange || '',
              tuningOutReason: final.tuningOutReason || '',
            }))
            return final
          })
          setIntakePhase('calibrating')
          setCurrentStep(5)
        } else {
          // Normal flow: display the AI's response as the next question
          const displayContent = assistantContent
            .replace(/```signals\n[\s\S]*?\n```/g, '')
            .replace(/\[SIGNALS_READY\]/g, '')
            .trim()

          const assistantMessage: IntakeMessage = {
            role: 'assistant',
            content: displayContent,
            timestamp: new Date().toISOString(),
          }
          setMessages((prev) => [...prev, assistantMessage])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setIsStreaming(false)
      }
    },
    [storyId, messages, signals, documentContext, intakePhase]
  )

  /**
   * Handle a calibration step answer (Q5–Q9).
   * No API call — these are handled locally.
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
    messages,
    signals,
    isStreaming,
    readyToGenerate,
    error,
    sendMessage,
    setReadyToGenerate,

    // Calibration state
    intakePhase,
    currentStep,
    payload,
    calibrationAnswers,
    acceptedAnswers,
    conversationalQuestionsAnswered,
    submitCalibrationAnswer,
    submitFinalAnswer,
    getFinalPayload,
    getFinalSignals,
  }
}
