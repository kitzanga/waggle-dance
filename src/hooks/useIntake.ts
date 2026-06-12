'use client'

import { useState, useCallback } from 'react'
import { readStream } from '@/lib/ai/stream'
import type { IntakeSignals } from '@/types/story'
import type { IntakeMessage } from '@/types/intake'
import type { IntakeStreamEvent } from '@/types/api'
import type { IntakePayload } from '@/types/intake-payload'
import { mapPayloadToSignals } from '@/lib/intake/payload-mapper'
import { getCalibrationStep, getToneReadout, getDisplayLabel } from '@/lib/intake/calibration-config'

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

  // New calibration state
  const [intakePhase, setIntakePhase] = useState<IntakePhase>('conversing')
  const [currentStep, setCurrentStep] = useState(1) // 1–10
  const [payload, setPayload] = useState<Partial<IntakePayload>>({})
  const [calibrationAnswers, setCalibrationAnswers] = useState<CalibrationAnswer[]>([])

  // Count completed conversational questions from messages
  // messages[0] = user answer to Q1, messages[1] = AI Q2, messages[2] = user answer to Q2, etc.
  const conversationalQuestionsAnswered = Math.min(
    Math.floor((messages.filter((m) => m.role === 'user').length)),
    4
  )

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

      // Track which conversational question this answers
      const userMessagesCount = updatedMessages.filter((m) => m.role === 'user').length
      const newStep = Math.min(userMessagesCount, 4)
      setCurrentStep(newStep + 1) // next step to show

      // Map conversational answers to payload fields
      if (userMessagesCount === 1) {
        setPayload((prev) => ({ ...prev, idea: content }))
      } else if (userMessagesCount === 2) {
        setPayload((prev) => ({ ...prev, audience: content }))
      } else if (userMessagesCount === 3) {
        setPayload((prev) => ({ ...prev, desiredBehaviorChange: content }))
      } else if (userMessagesCount === 4) {
        setPayload((prev) => ({ ...prev, tuningOutReason: content }))
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
        const assistantMessage: IntakeMessage = {
          role: 'assistant',
          content: '',
          timestamp: new Date().toISOString(),
        }

        setMessages((prev) => [...prev, assistantMessage])

        for await (const event of readStream<IntakeStreamEvent>(response)) {
          switch (event.type) {
            case 'token':
              assistantContent += event.content
              // Strip signal markers from display
              const displayContent = assistantContent
                .replace(/```signals\n[\s\S]*?\n```/g, '')
                .replace(/\[SIGNALS_READY\]/g, '')
                .trim()
              setMessages((prev) => {
                const updated = [...prev]
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  content: displayContent,
                }
                return updated
              })
              break

            case 'signal_update':
              setSignals((prev) => ({
                ...prev,
                [event.signal]: event.value,
              }))
              break

            case 'ready_to_generate':
              // In the new flow, we don't use this for phase transition.
              // Phase transition is driven by step count (see below).
              break

            case 'done':
              break
          }
        }

        // After Q4 response is streamed, transition to calibration
        if (userMessagesCount >= 4 && intakePhase === 'conversing') {
          // Inject the transition message client-side
          const transitionMessage: IntakeMessage = {
            role: 'assistant',
            content: 'Now let\u2019s tune the story.',
            timestamp: new Date().toISOString(),
          }
          setMessages((prev) => [...prev, transitionMessage])
          setIntakePhase('calibrating')
          setCurrentStep(5)
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
      // Update payload
      setPayload((prev) => ({ ...prev, [field]: value }))

      // Determine display label
      let displayLabel: string
      if (field === 'toneTemperature' && typeof value === 'number') {
        displayLabel = getToneReadout(value)
      } else {
        displayLabel = getDisplayLabel(step, String(value))
      }

      // Get the prompt for this step
      const stepConfig = getCalibrationStep(step)
      const prompt = stepConfig?.prompt ?? ''

      // Record the answer for display in past steps
      setCalibrationAnswers((prev) => [
        ...prev,
        { step, field, value, displayLabel, prompt },
      ])

      // Advance to next step
      if (step < 9) {
        setCurrentStep(step + 1)
      } else {
        // Q9 done — move to Q10 (free text)
        setIntakePhase('final_question')
        setCurrentStep(10)
      }
    },
    []
  )

  /**
   * Handle Q10 answer (free text — protection pattern).
   * No API call needed. Completes the intake.
   */
  const submitFinalAnswer = useCallback(
    (content: string) => {
      setPayload((prev) => ({ ...prev, protectionPattern: content }))
      setIntakePhase('complete')
      setReadyToGenerate(true)
    },
    []
  )

  /**
   * Build the final IntakePayload from accumulated state.
   */
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

  /**
   * Get IntakeSignals mapped from the payload (for generation handoff).
   */
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

    // New calibration state
    intakePhase,
    currentStep,
    payload,
    calibrationAnswers,
    conversationalQuestionsAnswered,
    submitCalibrationAnswer,
    submitFinalAnswer,
    getFinalPayload,
    getFinalSignals,
  }
}
