# Implementation Plan: Ten-Step Intake Capture Model

## Overview

Extend the intake flow from four conversational questions to a ten-step capture model with a calibration phase. The implementation adds structured UI components (single-select cards, tone slider) inline within the existing conversational layout, a two-phase progress indicator, conditional input bar visibility, and a payload mapper for backward compatibility.

No story engine, generation pipeline, or reading experience changes.

## Tasks

- [ ] 1. Types and data model
  - [ ] 1.1 Create IntakePayload type and calibration option types
    - Create `src/types/intake-payload.ts` with IntakePayload interface, PressureLevel, RelationshipDynamic, DesiredShiftType, ResistancePatternType unions, and CalibrationOption generic
    - Ensure all enum values match the spec exactly
    - _Requirements: 1.1, 1.2, 1.3_

  - [ ] 1.2 Create calibration configuration
    - Create `src/lib/intake/calibration-config.ts` with CALIBRATION_STEPS array
    - Define all options for Q5, Q7, Q8, Q9 with value/label/description
    - Define Q6 slider config (prompt, supportingCopy, range)
    - _Requirements: 5.1–5.6, 6.1–6.9, 7.1–7.4, 8.1–8.4, 9.1–9.4_

  - [ ] 1.3 Create payload-to-signals mapper
    - Create `src/lib/intake/payload-mapper.ts`
    - Map IntakePayload fields to existing IntakeSignals fields
    - Ensure backward compatibility with generation engine
    - _Requirements: 1.5, 15.1, 15.2, 15.3, 15.4_

- [ ] 2. Calibration UI components
  - [ ] 2.1 Build SingleSelectCard component
    - Create `src/components/intake/SingleSelectCard.tsx`
    - Compact card pattern: one option per row, label primary, description secondary
    - Selected state: subtle accent-bg + accent-border, not loud
    - Apple HIG-style: clean, minimal, no decorative elements
    - 150ms color transition on selection
    - Accessible: proper role, aria-selected, keyboard navigation
    - _Requirements: 4.7, 5.3, 5.4, 5.5_

  - [ ] 2.2 Build ToneSlider component
    - Create `src/components/intake/ToneSlider.tsx`
    - Contained card with "Warm" / "Cool" pole labels
    - Slider track visible (2px), thumb tactile but not dominant (18px)
    - No readout before interaction; show readout label after first touch/move
    - Readout labels: "Mostly warm" / "Warm-leaning" / "Balanced" / "Cool-leaning" / "Mostly cool"
    - Store numeric 0–100 value
    - Accessible: proper ARIA slider role, value announcements
    - _Requirements: 6.1–6.9_

  - [ ] 2.3 Build ContinueCTA component
    - Create `src/components/intake/ContinueCTA.tsx`
    - Secondary pill button style, appears only after interaction
    - Entrance animation: opacity + translateY (200ms)
    - Hidden = not rendered, not invisible
    - _Requirements: 4.4, 6.9_

  - [ ] 2.4 Build CalibrationPrompt component
    - Create `src/components/intake/CalibrationPrompt.tsx`
    - Renders prompt in HeroExchange style (20px, 400 weight, --text-primary)
    - Supporting copy below at --text-sm, --text-secondary
    - _Requirements: 4.1, 5.1, 5.2_

  - [ ] 2.5 Build CalibrationStep container
    - Create `src/components/intake/CalibrationStep.tsx`
    - Composes CalibrationPrompt + children (control) + ContinueCTA
    - Entrance animation: fade + rise (300ms)
    - _Requirements: 4.1, 4.3, 4.4, 14.2_

  - [ ] 2.6 Build PastCalibrationStep component
    - Create `src/components/intake/PastCalibrationStep.tsx`
    - Receded view: prompt at --text-sm/--text-muted, answer at --text-sm/--text-secondary
    - Hairline divider between steps
    - _Requirements: 4.6_

- [ ] 3. Progress indicator and input bar updates
  - [ ] 3.1 Rewrite ProgressIndicator to two-phase design
    - Modify `src/components/intake/ProgressIndicator.tsx`
    - Two segments: conversation (fills Q1–Q4) and calibration (fills Q5–Q10)
    - Same 2px height, --radius-full, separated by 8px gap
    - No ten dots, no labels, no percentage
    - Animated fill over 400ms ease-default
    - _Requirements: 11.1–11.6_

  - [ ] 3.2 Add hidden/show animation to InputBar
    - Modify `src/components/intake/InputBar.tsx`
    - Add `hidden` prop
    - When hidden: opacity fade + height collapse (200ms)
    - When shown: reverse (opacity + height expand)
    - During Q5–Q9: completely hidden (not disabled, not invisible-but-present)
    - _Requirements: 12.1–12.4_

- [ ] 4. Intake flow orchestration
  - [ ] 4.1 Extend useIntake hook with calibration state
    - Modify `src/hooks/useIntake.ts`
    - Add intakePhase, currentStep, payload state
    - Add calibration step handlers (local, no API call for Q5–Q9)
    - Handle transition from conversational to calibration after Q4
    - Handle Q10 as free-text (local capture, no AI needed)
    - Map final payload to IntakeSignals on completion
    - _Requirements: 2.1–2.4, 3.1–3.5, 10.1–10.5, 13.1–13.4_

  - [ ] 4.2 Update IntakeChat to support calibration rendering
    - Modify `src/components/intake/IntakeChat.tsx`
    - Conditional rendering: show CalibrationStep when intakePhase === 'calibrating'
    - Show InputBar when intakePhase is 'conversing' or 'final_question'
    - Hide InputBar during 'calibrating' phase
    - Inject transition message "Now let's tune the story." client-side after Q4
    - Pass calibration config to CalibrationStep based on currentStep
    - Handle completed calibration steps as PastCalibrationStep in exchange list
    - _Requirements: 3.1–3.5, 4.1–4.9, 12.1–12.4_

  - [ ] 4.3 Update ExchangeList to render mixed content
    - Modify `src/components/intake/ExchangeList.tsx`
    - Support rendering PastCalibrationStep alongside PastExchange
    - Maintain bottom-up layout with calibration steps receding upward
    - _Requirements: 4.6, 14.5_

  - [ ] 4.4 Update intake prompt for transition message
    - Modify `src/lib/ai/intake-prompt.ts`
    - No prompt changes needed — transition is handled client-side via step count
    - The AI still asks 4 questions and emits [SIGNALS_READY] per existing protocol
    - The frontend ignores [SIGNALS_READY] for phase transition (uses step count instead)
    - _Requirements: 3.1, 3.2_

- [ ] 5. Integration and persistence
  - [ ] 5.1 Update stories/new page for new payload format
    - Modify `src/app/stories/new/page.tsx`
    - handleIntakeComplete receives IntakePayload
    - Use payload-mapper to convert to IntakeSignals for generation
    - _Requirements: 13.1–13.4, 15.4_

  - [ ] 5.2 Update API route for new signal fields
    - Modify `src/app/api/intake/chat/route.ts`
    - Persist IntakePayload to intake_signals column (superset of old format)
    - No marker handling needed — transition is state-driven on the client
    - _Requirements: 1.4, 15.1–15.3_

  - [ ] 5.3 Extend IntakeSignals type for backward compatibility
    - Modify `src/types/story.ts`
    - Add optional IntakePayload fields or a separate `intakePayload` field
    - Ensure existing code continues to work with the old format
    - _Requirements: 1.4, 1.5, 15.1_

- [ ] 6. Visual polish and motion
  - [ ] 6.1 Implement all calibration motion patterns
    - Ensure all transitions match spec: card entrance (300ms), CTA appearance (200ms), option selection (150ms), step recession (300ms)
    - Respect prefers-reduced-motion throughout
    - _Requirements: 14.1–14.3, 14.6_

  - [ ] 6.2 Verify light mode persists through all steps
    - Confirm data-mode="light" stays active through Q1–Q10
    - No dark mode until generation waiting screen
    - _Requirements: 4.9, 13.3, 14.5_

  - [ ] 6.3 Verify no prohibited language in UI
    - Audit all user-facing strings for prohibited terms: dimension, framework, agent, creative brief, pipeline, JSON, calibration model, resistance pattern, data shape
    - _Requirements: 14.4_

## Notes

- Calibration (Q5–Q9) is handled entirely client-side. No API calls needed — the options are static.
- If the user refreshes during calibration, they'll resume from the last persisted exchange (Q4) and redo calibration. This is acceptable since calibration takes ~30 seconds.
- The transition message "Now let's tune the story." is injected client-side for instant feel. No API round-trip.
- Q10 answer is captured locally and persisted as part of the final IntakePayload batch.
- The payload-mapper is the only bridge between new and old systems. The generation engine never sees IntakePayload directly.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["1.3", "2.1", "2.2", "2.3", "2.4"] },
    { "id": 2, "tasks": ["2.5", "2.6", "3.1", "3.2"] },
    { "id": 3, "tasks": ["4.1", "4.4"] },
    { "id": 4, "tasks": ["4.2", "4.3", "5.3"] },
    { "id": 5, "tasks": ["5.1", "5.2"] },
    { "id": 6, "tasks": ["6.1", "6.2", "6.3"] }
  ]
}
```
