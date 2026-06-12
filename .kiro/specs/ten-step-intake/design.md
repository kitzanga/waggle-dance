# Design Document: Ten-Step Intake Capture Model

## Overview

This design extends the existing four-question conversational intake into a ten-step capture model with two phases:

1. **Conversational phase (Q1–Q4)** — unchanged free-text AI-driven exchange
2. **Calibration phase (Q5–Q10)** — structured inputs (Q5–Q9) followed by a return to free-text (Q10)

The calibration phase introduces new UI components (single-select cards, a tone slider) that appear inline within the existing conversational layout. The text input bar hides during Q5–Q9 and reappears for Q10. The entire experience remains on the light intake surface.

No changes to the story engine, agent pipeline, reading experience, or generation logic.

## Architecture

### Component Tree (Intake Screen)

```
IntakeChat
├── ExchangeList (existing — past exchanges recede upward)
│   ├── PastExchange (×n) — existing conversational answers
│   ├── PastCalibrationStep (×n) — NEW: receded calibration answers
│   └── HeroExchange | CalibrationStep — active question
├── ProgressIndicator (MODIFIED — two-phase design)
├── InputBar (existing — conditionally hidden)
└── CalibrationStep (NEW — container for structured inputs)
    ├── CalibrationPrompt — AI-style prompt + supporting copy
    ├── SingleSelectCard — Q5, Q7, Q8, Q9
    ├── ToneSlider — Q6
    └── ContinueCTA — appears after interaction
```

### State Machine

```
opening → conversing → calibration_transition → calibrating → final_question → complete
```

| State | Steps | Input Mode | Input Bar |
|-------|-------|-----------|-----------|
| `opening` | None | Hidden | Visible |
| `conversing` | Q1–Q4 | Free text | Visible |
| `calibration_transition` | — | None | Fading out |
| `calibrating` | Q5–Q9 | Structured controls | Hidden |
| `final_question` | Q10 | Free text | Visible |
| `complete` | — | None | Hidden |

### File Plan

**New files:**

| File | Purpose |
|------|---------|
| `src/types/intake-payload.ts` | IntakePayload interface and calibration option types |
| `src/components/intake/CalibrationStep.tsx` | Container for structured calibration inputs |
| `src/components/intake/SingleSelectCard.tsx` | Reusable single-select card component |
| `src/components/intake/ToneSlider.tsx` | Warm/cool slider component |
| `src/components/intake/ContinueCTA.tsx` | Continue button that appears after interaction |
| `src/components/intake/CalibrationPrompt.tsx` | AI-style prompt + supporting copy for calibration |
| `src/components/intake/PastCalibrationStep.tsx` | Receded view of a completed calibration answer |
| `src/lib/intake/calibration-config.ts` | Static config for Q5–Q9 options/labels |
| `src/lib/intake/payload-mapper.ts` | Maps IntakePayload → IntakeSignals for generation |

**Modified files:**

| File | Changes |
|------|---------|
| `src/components/intake/IntakeChat.tsx` | Add calibration state machine, conditional rendering, input bar visibility |
| `src/components/intake/ExchangeList.tsx` | Support mixed exchange types (text + calibration) |
| `src/components/intake/ProgressIndicator.tsx` | Rewrite to two-phase design |
| `src/components/intake/InputBar.tsx` | Add `hidden` prop with animated show/hide |
| `src/hooks/useIntake.ts` | Extend to manage calibration state and IntakePayload |
| `src/types/intake.ts` | Add calibration-related message modes |
| `src/types/story.ts` | Extend IntakeSignals or add IntakePayload reference |
| `src/app/stories/new/page.tsx` | Pass new payload format on completion |
| `src/app/api/intake/chat/route.ts` | Minor: handle new signal fields in persistence |
| `src/lib/ai/intake-prompt.ts` | Update to produce transition message after Q4 |

## Components and Interfaces

### IntakePayload (New Type)

```typescript
// src/types/intake-payload.ts

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
  toneTemperature: number // 0–100
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
```

### CalibrationStep Component

```typescript
// src/components/intake/CalibrationStep.tsx

interface CalibrationStepProps {
  stepNumber: number // 5–9
  prompt: string
  supportingCopy: string
  children: React.ReactNode // SingleSelectCard or ToneSlider
  onContinue: () => void
  canContinue: boolean
}
```

**Behavior:**
- Renders prompt in the same style as an AI message (HeroExchange typography: 20px, weight 400, --text-primary)
- Supporting copy below prompt at --text-sm, --text-secondary
- Children (structured control) below supporting copy with 16px gap
- ContinueCTA below children, appears only when `canContinue` is true
- Entrance animation: fade + subtle rise (opacity 0→1, translateY 8→0, 300ms ease-default)

### SingleSelectCard Component

```typescript
// src/components/intake/SingleSelectCard.tsx

interface SingleSelectOption {
  value: string
  label: string
  description: string
}

interface SingleSelectCardProps {
  options: SingleSelectOption[]
  selectedValue: string | null
  onSelect: (value: string) => void
}
```

**Visual design:**
- Container: no border, no shadow, compact vertical stack
- Each option: a row/card with 12px padding, --radius-md border-radius
- Unselected: 0.5px --border-default border, --surface-card background
- Selected: --accent-border border (0.5px), --accent-bg background
- Label: --text-base, --font-medium (500), --text-primary
- Description: --text-sm, --text-secondary, margin-top 2px
- Options stacked vertically with 8px gap
- No radio circles, no checkmarks — selection indicated by background + border change
- Transition: background-color and border-color over 150ms

### ToneSlider Component

```typescript
// src/components/intake/ToneSlider.tsx

interface ToneSliderProps {
  value: number // 0–100
  onChange: (value: number) => void
  hasInteracted: boolean
  onInteract: () => void
}
```

**Visual design:**
- Container card: --surface-card background, --radius-md, 20px padding, 0.5px --border-default border
- Layout: horizontal flex with "Warm" left, slider center (flex:1), "Cool" right
- Pole labels: --text-sm, --text-muted
- Slider track: 2px height, --border-default color, --radius-full
- Slider fill: --progress-active color (from left to thumb position for warm, or none)
- Thumb: 18px circle, --surface-card background, 0.5px --border-input border, --shadow-sm
- Readout label: appears below slider only after interaction, --text-xs, --text-secondary, centered
- Readout values:
  - 0–19: "Mostly warm"
  - 20–39: "Warm-leaning"
  - 40–59: "Balanced"
  - 60–79: "Cool-leaning"
  - 80–100: "Mostly cool"

### ContinueCTA Component

```typescript
// src/components/intake/ContinueCTA.tsx

interface ContinueCTAProps {
  visible: boolean
  onClick: () => void
  label?: string // default "Continue"
}
```

**Visual design:**
- Secondary-style button: --surface-card background, --text-primary text, 0.5px --border-default border
- Pill shape: --radius-full
- Size: 13px text, padding 8px 20px
- Entrance: opacity 0→1, translateY 4→0, 200ms ease-default
- When not visible: not rendered (no invisible placeholder)

### CalibrationPrompt Component

```typescript
// src/components/intake/CalibrationPrompt.tsx

interface CalibrationPromptProps {
  prompt: string
  supportingCopy: string
}
```

**Visual design:**
- Prompt: same HeroExchange style (20px, weight 400, --text-primary, --text-question-leading)
- Supporting copy: --text-sm, --text-secondary, margin-top 6px, max-width --content-max

### PastCalibrationStep Component

```typescript
// src/components/intake/PastCalibrationStep.tsx

interface PastCalibrationStepProps {
  prompt: string
  selectedLabel: string // Display label, not enum value
}
```

**Visual design:**
- Same treatment as PastExchange: prompt at --text-sm, --text-muted; selected label at --text-sm, --text-secondary
- Hairline divider between steps (1px, --border-default, 8px margin)

### Modified ProgressIndicator

```typescript
// src/components/intake/ProgressIndicator.tsx (rewrite)

interface ProgressIndicatorProps {
  conversationProgress: number // 0–4 (questions completed in Q1–Q4)
  calibrationProgress: number // 0–6 (questions completed in Q5–Q10)
  phase: 'conversation' | 'calibration'
  visible: boolean
}
```

**Visual design:**
- Two segments side by side, separated by 8px gap
- Each segment: 2px height, --radius-full, fills from left to right
- "Conversation" segment: fills 0–100% based on conversationProgress/4
- "Calibration" segment: fills 0–100% based on calibrationProgress/6
- Active phase segment uses --progress-active fill; inactive uses --progress-done (completed) or --progress-empty (not started)
- No labels visible — the two segments are unlabeled progress bars
- Total width: --content-max, centered, same position as current indicator
- Animation: fill transition over 400ms ease-default

### Modified InputBar

```typescript
// src/components/intake/InputBar.tsx (add hidden prop)

interface InputBarProps {
  onSubmit: (text: string) => void
  onAttach: () => void
  isDisabled: boolean
  attachError: string | null
  hidden?: boolean // NEW — when true, smoothly hides the entire bar
}
```

**Behavior when `hidden`:**
- Animate: opacity 1→0, height collapses to 0, over 200ms ease-default
- Use `overflow: hidden` during collapse to prevent layout shift
- On show: reverse animation (opacity 0→1, height auto→measured)

## Data Models

### Calibration Config (Static)

```typescript
// src/lib/intake/calibration-config.ts

export const CALIBRATION_STEPS = [
  {
    step: 5,
    field: 'pressure' as const,
    type: 'single-select' as const,
    prompt: "How much pressure is behind this?",
    supportingCopy: "Choose the kind of pressure the story needs to carry.",
    options: [
      { value: "act_now", label: "Act now", description: "Something important is at risk if they don't move." },
      { value: "change_soon", label: "Change soon", description: "The current pattern is already costing them." },
      { value: "grow_over_time", label: "Grow over time", description: "This is about perspective, identity, or maturity." },
    ],
  },
  {
    step: 6,
    field: 'toneTemperature' as const,
    type: 'slider' as const,
    prompt: "How do you want this story to feel?",
    supportingCopy: "Warm stories lean emotional and human. Cool stories lean clear and precise.",
  },
  {
    step: 7,
    field: 'relationshipDynamic' as const,
    type: 'single-select' as const,
    prompt: "What's your relationship to this audience?",
    supportingCopy: "Where are you speaking from?",
    options: [
      { value: "above", label: "Above", description: "You have authority, responsibility, or leadership over the audience." },
      { value: "beside", label: "Beside", description: "You are a peer, partner, teammate, or fellow traveler." },
      { value: "below", label: "Below", description: "You see something that people with more power may be missing." },
      { value: "internal", label: "Internal", description: "This is really a story you are telling yourself." },
    ],
  },
  {
    step: 8,
    field: 'desiredShift' as const,
    type: 'single-select' as const,
    prompt: "What do you want to shift in them?",
    supportingCopy: "Choose the kind of change the story should create.",
    options: [
      { value: "behavioral", label: "What they do", description: "They need to act differently." },
      { value: "cognitive", label: "What they understand", description: "They need to see the issue differently." },
      { value: "emotional", label: "What they feel", description: "They need to care, trust, or feel less guarded." },
      { value: "identity", label: "Who they believe they are", description: "They need to step into a different role or self-image." },
    ],
  },
  {
    step: 9,
    field: 'resistancePattern' as const,
    type: 'single-select' as const,
    prompt: "What's really going on when they resist?",
    supportingCopy: "Name the pattern underneath the pushback.",
    options: [
      { value: "absent", label: "They're absent", description: "They are not paying attention yet." },
      { value: "misdiagnosed", label: "They're solving the wrong problem", description: "They care, but they misunderstand what is happening." },
      { value: "skeptical", label: "They don't believe it", description: "They doubt the idea, the messenger, or the promised outcome." },
      { value: "threatened", label: "They feel threatened", description: "The idea puts their status, control, or identity at risk." },
      { value: "complacent", label: "They're comfortable", description: "The current state feels safe enough to ignore the need for change." },
    ],
  },
] as const
```

### Payload-to-Signals Mapper

```typescript
// src/lib/intake/payload-mapper.ts

import type { IntakePayload } from '@/types/intake-payload'
import type { IntakeSignals } from '@/types/story'

/**
 * Maps the new 10-step IntakePayload to the existing IntakeSignals format
 * expected by the story generation engine.
 */
export function mapPayloadToSignals(payload: IntakePayload): IntakeSignals {
  return {
    topic: payload.idea,
    tension: payload.tuningOutReason,
    audiencePortrait: payload.audience,
    resistancePattern: payload.resistancePattern,
    stakes: payload.pressure,
    desiredShift: payload.desiredShift,
  }
}
```

### Extended useIntake Hook State

The `useIntake` hook will be extended with:

```typescript
interface UseIntakeState {
  // Existing
  messages: IntakeMessage[]
  signals: Partial<IntakeSignals>
  isStreaming: boolean
  readyToGenerate: boolean
  error: string | null

  // New
  intakePhase: 'conversing' | 'calibrating' | 'final_question' | 'complete'
  currentStep: number // 1–10
  payload: Partial<IntakePayload>
  calibrationReady: boolean // true after Q4 answer + transition message
}
```

**Phase transition logic:**
1. After Q4 answer is submitted, `useIntake` sends the message to the API
2. API returns the transition message "Now let's tune the story."
3. Hook detects transition via step count (`userMessagesCount >= 4 && intakePhase === 'conversing'`), sets `intakePhase = 'calibrating'`, `currentStep = 5`
4. Q5–Q9 are handled locally (no API call — options are static config)
5. After Q9, sets `intakePhase = 'final_question'`, `currentStep = 10`
6. Q10 answer can be handled locally (no AI needed) or sent to API for the reflection step
7. After Q10, maps payload to signals and calls `onComplete`

### Intake Prompt Update

No changes to `intake-prompt.ts` are needed. The AI continues to ask its 4 questions and emit `[SIGNALS_READY]` per the existing protocol. The frontend ignores `[SIGNALS_READY]` for phase transitions — it uses step count instead. The transition message "Now let's tune the story." is injected client-side after Q4's response streams back, requiring no AI awareness of calibration.

## Progress Indicator Recommendation

**Chosen approach: Two-segment fill bar**

Ten dots would be too granular and create visual noise. A traditional progress bar is too heavy. The recommended treatment:

- Two minimal bar segments, same 2px height as current indicators
- Segment 1 fills as Q1–Q4 are completed (25% per question)
- Segment 2 fills as Q5–Q10 are completed (~16.7% per step)
- The two segments are separated by a small gap (8px)
- No labels, no numbers — just two quiet bars filling left to right
- Active segment uses --progress-active; completed segment uses --progress-done

This preserves the lightweight feel while communicating that there are two phases. The creator sees the first bar complete, then the second bar begin filling — an implicit signal that "calibration" has started without using that word.

## Motion Specifications

| Transition | Animation | Duration |
|-----------|-----------|----------|
| Transition message appears | Same as AI message (opacity, translateY) | 350ms |
| Input bar hides | Opacity 1→0, height collapse | 200ms |
| Calibration card enters | Opacity 0→1, translateY 8→0 | 300ms |
| Option selected | Background/border color transition | 150ms |
| Continue CTA appears | Opacity 0→1, translateY 4→0 | 200ms |
| Completed step recedes | Opacity to muted, size unchanged | 300ms |
| Input bar returns (Q10) | Opacity 0→1, height expands | 200ms |

All animations respect `prefers-reduced-motion` (instant when enabled).

## Error Handling

| Scenario | Behavior |
|----------|----------|
| Q4 API call fails | Show error inline, allow retry; don't transition to calibration |
| Calibration step skipped (code bug) | Validation on completion — require all 10 fields populated |
| Q10 submission fails | Show inline error, allow retry (same as Q1–Q4 errors) |
| Browser refresh mid-calibration | Calibration state is client-side only; resume from last persisted exchange (Q4). Calibration restarts from Q5 |
| Slider value not set but continue pressed | Continue CTA is not rendered until interaction — impossible by design |

## Open Implementation Questions

1. **Persistence of calibration state**: Should Q5–Q9 answers be persisted to Supabase after each step, or batched at the end? Recommendation: batch at end (after Q10). Simpler. If the user refreshes, they redo calibration (it's fast — 5 taps and a text input).

2. **AI involvement in transition**: Should the transition message "Now let's tune the story." come from the actual AI (via API), or be injected client-side after Q4? Recommendation: inject client-side. Avoids an extra API round-trip, keeps the transition instant, and the AI doesn't need to know about calibration.

3. **Existing stories migration**: Existing stories have the old IntakeSignals format. The mapper handles forward compatibility (new → old). For old stories, no migration needed — they already work.

## Confirmation: No Story Engine Changes

This spec makes zero changes to:
- `/api/stories/generate/route.ts`
- `/api/stories/pipeline/route.ts`
- `/api/stories/refine/route.ts`
- `/api/stories/editorial-review/route.ts`
- `/api/stories/creative-brief/route.ts`
- `GenerationTransition.tsx`
- `useStoryGeneration.ts`
- Reader experience components
- Dark mode or generation waiting screen

The only bridge between new and old is `payload-mapper.ts`, which translates the new IntakePayload into the existing IntakeSignals format that the generation engine already consumes.
