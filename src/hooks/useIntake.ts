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

  // Calibration state
  const [intakePhase, setIntakePhase] = useState<IntakePhase>('conversing')
  const [currentStep, setCurrentStep] = useState(1) // 1–10
  const [payload, setPayload] = useState<Partial<IntakePayload>>({})
  const [calibrationAnswers, setCalibrationAnswers] = useState<CalibrationAnswer[]>([])

  // Count completed conversational questions from captured signals
  const conversationalQuestionsAnswered = [
    signals.topic,
    signals.audiencePortrait,
    signals.desiredShift,
    signals.resistancePattern,
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

        // Buffer the stream first to check for signalsReady before displaying
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

        // Apply signal updates
        if (signalUpdates.length > 0) {
          setSignals((prev) => {
            const updated = { ...prev }
            for (const { signal, value } of signalUpdates) {
              (updated as Record<string, string>)[signal] = value
            }
            return updated
          })
        }

        if (signalsReady && intakePhase === 'conversing') {
          // All 4 signals gathered. Transition to calibration.
          // Do NOT display the AI's response — go directly to Q5.
          const userMessages = updatedMessages.filter((m) => m.role === 'user')
          const accepted = userMessages.slice(-4)
          setPayload((prev) => ({
            ...prev,
            idea: accepted[0]?.content || prev.idea || '',
            audience: accepted[1]?.content || prev.audience || '',
            desiredBehaviorChange: accepted[2]?.content || prev.desiredBehaviorChange || '',
            tuningOutReason: accepted[3]?.content || prev.tuningOutReason || '',
          }))
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

    // Calibration state
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
