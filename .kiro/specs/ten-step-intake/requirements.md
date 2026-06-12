# Requirements Document: Ten-Step Intake Capture Model

## Introduction

This specification extends the existing four-question conversational intake into a ten-step capture model. The first four questions remain conversational free-text. After Q4, the system transitions into a calibration phase (Q5–Q9) using structured single-select and slider inputs presented one at a time within the conversational flow. Q10 returns to free-text. The experience should feel like a precise interview that tunes the story, not a form or survey.

This update is scoped exclusively to intake capture, calibration UX, and the internal data structure. No changes to the story engine, agent pipeline, reading experience, or generation logic are included.

## Glossary

- **Conversational_Phase**: Questions 1–4 of the intake, delivered as free-text AI-driven conversation
- **Calibration_Phase**: Questions 5–9 of the intake, delivered as structured UI controls (single-select cards, slider) one at a time
- **Structured_Card**: A contained UI element presenting options or a control for a single calibration question
- **Single_Select_Card**: A structured card showing labeled options where the creator picks one
- **Tone_Slider**: A horizontal slider control for Q6 (toneTemperature) with warm/cool poles
- **Continue_CTA**: A button that appears after the creator interacts with a structured control, advancing to the next step
- **Intake_Payload**: The complete data object produced by all ten intake steps
- **Phase_Indicator**: A two-phase progress indicator showing Conversation and Calibration segments

## Requirements

### Requirement 1: Extended Intake Data Model

**User Story:** As a developer, I want a well-typed data model for the ten-step intake, so that all captured signals are available to downstream systems.

#### Acceptance Criteria

1. THE Intake_Payload SHALL conform to the following TypeScript interface:
```typescript
interface IntakePayload {
  idea: string
  audience: string
  desiredBehaviorChange: string
  tuningOutReason: string
  pressure: "act_now" | "change_soon" | "grow_over_time"
  toneTemperature: number
  relationshipDynamic: "above" | "beside" | "below" | "internal"
  desiredShift: "behavioral" | "cognitive" | "emotional" | "identity"
  resistancePattern: "absent" | "misdiagnosed" | "skeptical" | "threatened" | "complacent"
  protectionPattern: string
}
```
2. THE toneTemperature field SHALL be a numeric value in the range 0–100, where 0 represents maximum warmth and 100 represents maximum coolness
3. THE system SHALL store enum values (e.g., "act_now", "beside", "behavioral") as the primary data values, never display labels
4. THE Intake_Payload SHALL be persisted to the existing Supabase stories table (as intake_signals or equivalent column), extending the current IntakeSignals type without breaking existing story records
5. THE existing IntakeSignals fields (topic, tension, audiencePortrait, resistancePattern, stakes, desiredShift) SHALL continue to be populated for backward compatibility with the story generation engine, mapped from the new Intake_Payload fields

### Requirement 2: Conversational Phase (Q1–Q4)

**User Story:** As a creator, I want the first four questions to remain a natural conversation, so that the experience starts open and human.

#### Acceptance Criteria

1. THE Intake_Screen SHALL present Q1–Q4 as free-text conversational questions using the existing AI-driven exchange pattern with no changes to the current conversational behavior
2. THE four conversational questions SHALL remain: (1) "What's the idea?" (2) "Who needs to hear it?" (3) "What do you want them to do differently after they hear it?" (4) "What's their biggest reason for tuning this out?"
3. THE answers to Q1–Q4 SHALL populate Intake_Payload fields: idea, audience, desiredBehaviorChange, and tuningOutReason respectively
4. THE AI behavior rules from the existing spec (one question per turn, max 20 words, no affirmations, no markdown) SHALL remain in effect for Q1–Q4

### Requirement 3: Calibration Transition

**User Story:** As a creator, I want a smooth transition from conversation to calibration, so that the shift in interaction mode feels natural.

#### Acceptance Criteria

1. WHEN the creator submits their answer to Q4, THE system SHALL display a short AI message: "Now let's tune the story." in the same conversational flow
2. THE transition message SHALL appear in the same visual style as prior AI messages (same typography, same position in the exchange list)
3. THE transition SHALL NOT navigate to a separate page, route, or view
4. THE transition SHALL NOT feel like entering a survey, onboarding wizard, or separate mode — it should feel like the interview is getting more precise
5. AFTER the transition message appears, THE system SHALL hide the text input bar and present the first calibration question (Q5)

### Requirement 4: Structured Calibration Controls (Q5–Q9)

**User Story:** As a creator, I want structured calibration inputs that feel like tuning, so that I can give precise answers without typing.

#### Acceptance Criteria

1. FOR Q5 through Q9, THE system SHALL present one structured input at a time within the conversational flow area
2. THE text input bar SHALL be completely hidden (not visible, not disabled) during Q5–Q9
3. EACH structured card SHALL appear below the AI prompt message for that question
4. THE Continue_CTA SHALL appear only after the creator makes a selection or interacts with the control
5. WHEN the creator taps Continue, THE system SHALL record the selection, visually recede the completed step upward into conversation history, and present the next calibration question
6. Previous answers (both conversational and calibration) SHALL remain visible above the current question but visually receded (muted styling consistent with existing PastExchange treatment)
7. THE structured cards SHALL use restrained Apple HIG-style hierarchy: clean spacing, clear type hierarchy, minimal borders, no decorative styling
8. THE structured cards SHALL NOT use bee imagery, waggle metaphors, or playful decoration
9. THE Intake_Screen SHALL remain in light mode throughout all calibration steps

### Requirement 5: Q5 — Pressure Single-Select

**User Story:** As a creator, I want to indicate how much urgency is behind my story, so that the system can calibrate narrative pressure.

#### Acceptance Criteria

1. THE system SHALL display the prompt "How much pressure is behind this?" as an AI message
2. THE system SHALL display supporting copy "Choose the kind of pressure the story needs to carry." below the prompt
3. THE system SHALL present three options in a compact single-select card pattern:
   - "Act now" — "Something important is at risk if they don't move." (value: "act_now")
   - "Change soon" — "The current pattern is already costing them." (value: "change_soon")
   - "Grow over time" — "This is about perspective, identity, or maturity." (value: "grow_over_time")
4. EACH option SHALL display the label as primary text and the description as secondary text
5. THE selected state SHALL be visually clear but not loud (subtle highlight, not bold color fill)
6. THE system SHALL store the selected value in Intake_Payload.pressure

### Requirement 6: Q6 — Tone Temperature Slider

**User Story:** As a creator, I want to set the emotional temperature of my story on a spectrum, so that I can express nuance between warm and cool tones.

#### Acceptance Criteria

1. THE system SHALL display the prompt "How do you want this story to feel?" as an AI message
2. THE system SHALL display supporting copy "Warm stories lean emotional and human. Cool stories lean clear and precise." below the prompt
3. THE system SHALL present a minimal contained slider card with: "Warm" label on the left, "Cool" label on the right, and a horizontal slider control between them
4. THE slider card SHALL NOT show a readout label before the creator interacts with it
5. AFTER the creator touches or moves the slider, THE system SHALL display a small readout label with one of: "Mostly warm" (0–19), "Warm-leaning" (20–39), "Balanced" (40–59), "Cool-leaning" (60–79), "Mostly cool" (80–100)
6. THE slider thumb SHALL feel tactile but not dominant — visible enough to read as a slider control, not a floating dot
7. THE slider track SHALL be visible enough that the control reads as a slider
8. THE system SHALL store the slider value (0–100) in Intake_Payload.toneTemperature
9. THE Continue_CTA SHALL appear only after the creator interacts with the slider

### Requirement 7: Q7 — Relationship Dynamic Single-Select

**User Story:** As a creator, I want to specify my position relative to my audience, so that the story's voice matches my authority.

#### Acceptance Criteria

1. THE system SHALL display the prompt "What's your relationship to this audience?" as an AI message
2. THE system SHALL display supporting copy "Where are you speaking from?" below the prompt
3. THE system SHALL present four options in a compact single-select card pattern:
   - "Above" — "You have authority, responsibility, or leadership over the audience." (value: "above")
   - "Beside" — "You are a peer, partner, teammate, or fellow traveler." (value: "beside")
   - "Below" — "You see something that people with more power may be missing." (value: "below")
   - "Internal" — "This is really a story you are telling yourself." (value: "internal")
4. THE system SHALL store the selected value in Intake_Payload.relationshipDynamic

### Requirement 8: Q8 — Desired Shift Single-Select

**User Story:** As a creator, I want to specify the type of change I want my story to create, so that the narrative targets the right layer.

#### Acceptance Criteria

1. THE system SHALL display the prompt "What do you want to shift in them?" as an AI message
2. THE system SHALL display supporting copy "Choose the kind of change the story should create." below the prompt
3. THE system SHALL present four options in a compact single-select card pattern:
   - "What they do" — "They need to act differently." (value: "behavioral")
   - "What they understand" — "They need to see the issue differently." (value: "cognitive")
   - "What they feel" — "They need to care, trust, or feel less guarded." (value: "emotional")
   - "Who they believe they are" — "They need to step into a different role or self-image." (value: "identity")
4. THE system SHALL store the selected value in Intake_Payload.desiredShift

### Requirement 9: Q9 — Resistance Pattern Single-Select

**User Story:** As a creator, I want to name the pattern behind audience resistance, so that the story can address the real obstacle.

#### Acceptance Criteria

1. THE system SHALL display the prompt "What's really going on when they resist?" as an AI message
2. THE system SHALL display supporting copy "Name the pattern underneath the pushback." below the prompt
3. THE system SHALL present five options in a compact single-select card pattern:
   - "They're absent" — "They are not paying attention yet." (value: "absent")
   - "They're solving the wrong problem" — "They care, but they misunderstand what is happening." (value: "misdiagnosed")
   - "They don't believe it" — "They doubt the idea, the messenger, or the promised outcome." (value: "skeptical")
   - "They feel threatened" — "The idea puts their status, control, or identity at risk." (value: "threatened")
   - "They're comfortable" — "The current state feels safe enough to ignore the need for change." (value: "complacent")
4. THE system SHALL store the selected value in Intake_Payload.resistancePattern

### Requirement 10: Q10 — Protection Pattern Free-Text

**User Story:** As a creator, I want to describe in my own words what my audience is protecting, so that the story can acknowledge what's at stake for them.

#### Acceptance Criteria

1. THE system SHALL display the prompt "What are they trying to protect or prove?" as an AI message in the conversational flow
2. THE text input bar SHALL reappear for Q10, restoring the same input experience from Q1–Q4
3. Q10 SHALL feel like a return to conversation after the calibration phase
4. THE system SHALL store the creator's answer in Intake_Payload.protectionPattern
5. THE system SHALL NOT present a structured card for Q10

### Requirement 11: Progress Indicator

**User Story:** As a creator, I want to see my progress through intake without it feeling heavy, so that I know roughly where I am.

#### Acceptance Criteria

1. THE Progress_Indicator SHALL use a two-phase design with two labeled segments: "Conversation" (Q1–Q4) and "Calibration" (Q5–Q10)
2. THE "Conversation" segment SHALL fill progressively as Q1–Q4 are completed
3. THE "Calibration" segment SHALL fill progressively as Q5–Q10 are completed
4. THE Progress_Indicator SHALL NOT use ten individual dots or segments
5. THE Progress_Indicator SHALL remain visually lightweight — no heavy progress bar, no percentage, no step counter
6. THE Progress_Indicator SHALL be hidden during the Opening_State and appear after the first exchange

### Requirement 12: Input Bar Visibility

**User Story:** As a creator, I want the input method to match the current question type, so that I'm never confused about how to respond.

#### Acceptance Criteria

1. DURING Q1–Q4 and Q10, THE text input bar SHALL be visible and functional
2. DURING Q5–Q9, THE text input bar SHALL be completely hidden (removed from layout, not merely disabled or invisible)
3. THE transition from visible to hidden (and back) SHALL be smooth — a subtle fade or slide, not an abrupt cut
4. WHEN the input bar is hidden, THE structured card SHALL own the full interaction for that step

### Requirement 13: Completion and Handoff

**User Story:** As a creator, I want to move seamlessly from intake into story generation after my last answer.

#### Acceptance Criteria

1. AFTER Q10 is answered, THE system SHALL continue into the existing reflection and "Find the story" flow with no changes to that downstream behavior
2. THE Intake_Payload SHALL be mapped to the existing IntakeSignals format before passing to the story generation pipeline
3. THE system SHALL NOT enter dark mode until the generation waiting screen begins
4. NO changes SHALL be made to the generation waiting screen, story engine, or agent pipeline

### Requirement 14: Motion and Visual Constraints

**User Story:** As a creator, I want the calibration phase to feel calm and precise, not playful or gamified.

#### Acceptance Criteria

1. THE shift from Q4 to calibration SHALL feel like a register change, not a scene change — subtle, not dramatic
2. Structured cards SHALL use fade or gentle rise entrance animations only
3. THE system SHALL NOT use bouncy, playful, or gamified motion
4. THE system SHALL NOT display the following terms in any user-facing UI: dimension, framework, agent, creative brief, pipeline, JSON, calibration model, resistance pattern, data shape
5. THE Intake_Screen SHALL maintain light mode throughout all ten steps
6. THE system SHALL maintain the existing design tokens, spacing, and typography conventions from the design system steering file

### Requirement 15: Backward Compatibility

**User Story:** As a developer, I want this update to be non-breaking, so that existing stories and the generation pipeline continue to work.

#### Acceptance Criteria

1. THE existing story records in Supabase SHALL NOT be corrupted or invalidated by this update
2. THE existing API routes (/api/intake/chat, /api/stories/generate, /api/stories/pipeline, etc.) SHALL continue to function for stories created before this update
3. THE new Intake_Payload fields SHALL be stored alongside or mapped to existing IntakeSignals fields
4. THE story generation engine SHALL receive its input in the existing IntakeSignals format via a mapping layer
