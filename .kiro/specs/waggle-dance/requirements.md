# Requirements Document

## Introduction

This specification covers a comprehensive design system overhaul and intake screen redesign for the Waggle Dance application. The redesign replaces the existing 240px fixed sidebar navigation with a minimal 48px top navigation bar, introduces a structured design token system using CSS custom properties, and rebuilds the intake screen (/new route) with a conversation-first layout featuring bottom-up exchange growth, entrance animations, progress indicators, and a redesigned input bar. The reading experience retains its existing dark surface and has no navigation chrome. The project uses Next.js, Tailwind v4, Framer Motion, and Supabase — all of which remain unchanged.

## Glossary

- **Top_Nav**: A 48px-height persistent navigation bar displayed across all creator screens, replacing the previous 240px fixed sidebar
- **Creator_Screen**: Any authenticated screen where the Creator interacts with the application (intake, library, story management)
- **Reading_Experience**: The dark-themed immersive story consumption view accessed via share link, which has no navigation
- **Intake_Screen**: The conversational intake interface at route /new where the Creator describes their communication challenge
- **Design_Token**: A CSS custom property defining a reusable visual value (color, spacing, typography, motion) in the global stylesheet
- **Surface_Page**: The background color applied to the main viewport area of creator screens
- **Exchange**: A single question-answer pair between the Intake AI and the Creator in the intake conversation
- **Hero_Exchange**: The most recent AI question in the intake conversation, displayed at 20px font size
- **Progress_Indicator**: A row of 4 pill-shaped segments indicating intake progress through the four fixed questions
- **Input_Bar**: The bottom-anchored area of the intake screen containing the attach button, text input, and send button
- **Ghost_Button**: A text-only button with no background fill or border, used for secondary navigation actions
- **Pill_Button**: A button with full border-radius creating a capsule shape, used for primary navigation actions
- **Attach_Button**: A 34×34px circular button with a paperclip icon that opens the file picker for document upload
- **Send_Button**: A 34×34px circular amber button with an arrow-up icon that submits the current input
- **Opening_State**: The initial centered display shown before the Creator submits their first message, containing the headline and subtitle
- **Motion_Token**: A CSS custom property defining animation duration and easing for UI transitions

## Requirements

### Requirement 1: Top Navigation Bar

**User Story:** As a creator, I want a minimal top navigation bar instead of a sidebar, so that I have more horizontal space for content and a cleaner visual hierarchy.

#### Acceptance Criteria

1. THE Waggle_Dance SHALL display a Top_Nav bar that is 48px in height, spans the full viewport width, and persists across all Creator_Screen routes including /dashboard, /stories/new, and /stories/[id]
2. THE Top_Nav SHALL use a transparent background that inherits the current screen surface color, with a 1px bottom border using the border-default token (rgba(0,0,0,0.08) on light screens, rgba(255,255,255,0.07) on dark screens)
3. THE Top_Nav SHALL display the "Waggle Dance" wordmark on the left side, rendered at 14px font size, weight 500, using the system font stack, with color #1a1a1a on light surfaces and rgba(255,255,255,0.9) on dark surfaces
4. THE Top_Nav SHALL display two controls on the right side separated by an 8px gap: a Ghost_Button labeled "Library" (13px, color rgba(0,0,0,0.38) on light) and a Pill_Button labeled "+ New" (12px, color #8a5c00 on light, background rgba(180,108,0,0.08), border 0.5px solid rgba(180,108,0,0.2), border-radius 20px, padding 4px 12px)
5. WHEN a Creator clicks the "Library" Ghost_Button, THE Waggle_Dance SHALL navigate to the /dashboard route
6. WHEN a Creator clicks the "+ New" Pill_Button, THE Waggle_Dance SHALL navigate to the intake screen at route /stories/new
7. THE Top_Nav SHALL NOT display a sign-out control; sign-out functionality is deferred to a future profile menu
8. THE Top_Nav SHALL NOT render on the Reading_Experience view (/read/[shareToken]); reading routes display no navigation chrome
9. THE Waggle_Dance SHALL remove the existing 240px fixed sidebar component (Sidebar.tsx) and all layout offsets (margin-left, padding-left) associated with it from Creator_Screen layouts
10. WHEN the viewport width is 390px or less, THE Top_Nav SHALL retain both the wordmark and both navigation buttons without truncation or overflow
11. THE Top_Nav SHALL use horizontal padding of 24px on viewports below 768px and 40px on viewports 768px and above

### Requirement 2: Design Token System — Colors

**User Story:** As a developer, I want a single source of truth for color values as CSS custom properties, so that the application maintains visual consistency and supports future theming.

#### Acceptance Criteria

1. THE Waggle_Dance SHALL define light mode color tokens as CSS custom properties in the global stylesheet with the following values: --surface-page as #f7f6f2, --surface-card as #ffffff, --surface-input as #ffffff, --surface-bar as transparent, --text-primary as #111111, --text-secondary as rgba(0,0,0,0.5), --text-muted as rgba(0,0,0,0.32), --text-placeholder as rgba(0,0,0,0.25), --border-default as rgba(0,0,0,0.08), --border-input as rgba(0,0,0,0.14), --border-input-focus as rgba(0,0,0,0.3), --accent as #c47a00, --accent-bg as rgba(180,108,0,0.08), --accent-border as rgba(180,108,0,0.2), --progress-done as rgba(180,108,0,0.35), --progress-active as #c47a00, and --progress-empty as rgba(0,0,0,0.1)
2. THE Waggle_Dance SHALL define dark mode color tokens as CSS custom properties in the global stylesheet with the following values: --surface-page-dark as #000000, --surface-elevated-dark as #0d0d0d, --surface-card-dark as #1a1a1c, --surface-input-dark as #1a1a1c, --text-primary-dark as #ffffff, --text-secondary-dark as rgba(255,255,255,0.5), --text-muted-dark as rgba(255,255,255,0.32), --text-placeholder-dark as rgba(255,255,255,0.22), --border-default-dark as rgba(255,255,255,0.07), --border-input-dark as rgba(255,255,255,0.12), --border-input-focus-dark as rgba(255,159,10,0.3), --accent-dark as #ff9f0a, --accent-bg-dark as rgba(255,159,10,0.08), --accent-border-dark as rgba(255,159,10,0.2), --progress-done-dark as rgba(255,159,10,0.5), --progress-active-dark as #ff9f0a, and --progress-empty-dark as rgba(255,255,255,0.1)
3. THE Waggle_Dance SHALL apply light mode tokens to all Creator_Screen routes — specifically /dashboard, /stories/new, and /stories/[id] — by setting --surface-page (#f7f6f2) as background-color and --text-primary (#111111) as the default text color
4. THE Waggle_Dance SHALL apply dark mode tokens to the Reading_Experience view (/read/[shareToken]) by setting --surface-page-dark (#000000) as background-color and --text-primary-dark (#ffffff) as the default text color, with no light mode tokens applied to this view
5. THE Waggle_Dance SHALL use the amber accent token (#c47a00 in light mode, #ff9f0a in dark mode) as the fill color for the Send_Button, Pill_Button, and any other primary-action interactive element
6. WHEN the Waggle_Dance renders any text-on-background color token pairing, THE Waggle_Dance SHALL maintain a minimum WCAG 2.1 AA contrast ratio of 4.5:1 for normal text (below 18px) and 3:1 for large text (18px or above)
7. THE Waggle_Dance SHALL scope mode application via a CSS class or data attribute on the route layout element so that light mode and dark mode tokens do not conflict when rendered in the same session

### Requirement 3: Design Token System — Typography

**User Story:** As a developer, I want standardized typography tokens, so that font choices and sizes are consistent across all screens.

#### Acceptance Criteria

1. THE Waggle_Dance SHALL define two font family tokens: --font-ui as -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif for all UI elements, and --font-reading as Georgia, 'New York', serif for reading body text
2. THE Waggle_Dance SHALL define a type scale with the following named sizes and corresponding line-heights: --text-xs as 11px / 1.45, --text-sm as 13px / 1.45, --text-base as 15px / 1.5, --text-md as 17px / 1.5, --text-lg as 20px / 1.4, --text-xl as 24px / 1.35, and --text-2xl as 30px / 1.3
3. THE Waggle_Dance SHALL define the intake question typography tokens: --text-question as 20px, --text-question-weight as 400, --text-question-leading as 1.45, and --text-question-tracking as -0.015em
4. THE Waggle_Dance SHALL define three font-weight tokens: regular (400) for body text, medium (500) for labels and navigation items, and semibold (600) for headings and primary buttons
5. THE Waggle_Dance SHALL apply the --font-ui stack to all navigation, buttons, labels, and intake conversation UI
6. THE Waggle_Dance SHALL apply the --font-reading stack exclusively to story body text within the Reading_Experience view
7. WHILE the Reading_Experience is in text-focus mode, THE Waggle_Dance SHALL override the story body font size to 20px and constrain line length to a maximum of 65 characters

### Requirement 4: Design Token System — Spacing and Layout

**User Story:** As a developer, I want a spacing system based on a 4px unit, so that all component dimensions and gaps are visually harmonious.

#### Acceptance Criteria

1. THE Waggle_Dance SHALL define spacing tokens based on a 4px base unit: --space-1 as 4px, --space-2 as 8px, --space-3 as 12px, --space-4 as 16px, --space-5 as 20px, --space-6 as 24px, --space-8 as 32px, --space-10 as 40px
2. THE Waggle_Dance SHALL define a --content-max token of 600px that constrains the maximum width of the intake conversation area and input bar
3. WHEN the viewport width is less than 600px, THE Waggle_Dance SHALL render the constrained intake content at full viewport width minus horizontal padding of 24px on each side
4. THE Waggle_Dance SHALL apply the --content-max width constraint to the intake screen conversation and input elements, centering them horizontally within the viewport using automatic horizontal margins

### Requirement 5: Design Token System — Motion

**User Story:** As a developer, I want motion tokens for animation durations and easing curves, so that transitions feel consistent and intentional across the application.

#### Acceptance Criteria

1. THE Waggle_Dance SHALL define three duration tokens: --duration-fast as 150ms, --duration-base as 250ms, and --duration-slow as 400ms
2. THE Waggle_Dance SHALL define easing curve tokens: --ease-default as cubic-bezier(0.25, 0.1, 0.25, 1) for general transitions, and --ease-spring as cubic-bezier(0.34, 1.56, 0.64, 1) for elements that appear during conversational flows such as intake chat messages
3. THE Waggle_Dance SHALL classify an animation as an entrance animation if it introduces a new element into the viewport (opacity fade-ins, slide-ins, scale-ups), and SHALL classify an animation as a state transition if it changes visual properties of an element already present (color changes, size adjustments, position shifts)
4. WHILE the user has prefers-reduced-motion enabled, THE Waggle_Dance SHALL remove entrance animations entirely so that elements appear in their final state without motion, and SHALL reduce all state-transition durations to 0ms so that state changes are instantaneous

### Requirement 6: Intake Screen Layout and Surface

**User Story:** As a creator, I want the intake screen to feel warm and focused, so that I can think clearly about my communication challenge without visual distraction.

#### Acceptance Criteria

1. THE Intake_Screen SHALL use the --surface-page (#f7f6f2) warm off-white background color, spanning the full viewport height with no other background color visible behind or around the content area
2. THE Intake_Screen SHALL use a vertical column layout structured as follows from top to bottom: Top_Nav (48px fixed height), conversation area (flex:1, scrollable when content exceeds available space), Progress_Indicator (24px fixed height), Input_Bar (auto height, minimum 64px)
3. IF an unauthenticated user navigates to the intake route (/stories/new), THEN THE Intake_Screen SHALL redirect the user to the sign-in flow before rendering any intake content
4. THE Intake_Screen SHALL constrain the conversation content and Input_Bar to a maximum width of 600px (--content-max), centered horizontally within the viewport

### Requirement 7: Intake Opening State

**User Story:** As a creator, I want a clear starting prompt when I begin a new story, so that I know what to do without reading instructions.

#### Acceptance Criteria

1. WHEN the Intake_Screen loads with no prior messages, THE Waggle_Dance SHALL display an Opening_State consisting of a centered headline "What's the idea?" at --text-2xl (30px), weight 400, color --text-primary, tracking -0.02em, and a subtitle "A sentence is enough. We'll build from there." at --text-sm (13px), color --text-muted, with margin-top 10px
2. WHEN the Creator submits their first message, THE Opening_State SHALL animate out with opacity 0, translateY -8px, over 200ms duration, and SHALL NOT reappear for the remainder of that story's intake session
3. THE Opening_State SHALL be vertically and horizontally centered within the conversation area, constrained to --content-max width
4. WHILE the prefers-reduced-motion media query is set to reduce, THE Opening_State SHALL disappear instantly without the fade animation when the Creator submits their first message

### Requirement 8: Intake Conversation Exchange Layout

**User Story:** As a creator, I want the conversation to grow from the bottom up with the latest question prominent, so that I always know what to answer without scrolling.

#### Acceptance Criteria

1. THE Intake_Screen SHALL render conversation exchanges in a bottom-up growth direction, with the newest Exchange positioned directly above the Input_Bar and previous exchanges stacked above it in reverse-chronological order
2. THE Waggle_Dance SHALL render the most recent AI question (Hero_Exchange) at --text-question (20px), weight --text-question-weight (400), color --text-primary, line-height --text-question-leading (1.45), letter-spacing --text-question-tracking (-0.015em)
3. THE Waggle_Dance SHALL render all previous AI questions at --text-sm (13px) in --text-muted color, with creator answers displayed at --text-sm (13px) in --text-secondary color
4. THE Waggle_Dance SHALL separate exchanges with a 1px solid --border-default hairline divider with 8px vertical margin, and use 24px gap between exchanges
5. WHEN a new Exchange enters the conversation, THE Waggle_Dance SHALL animate existing exchanges: the previous hero question shrinks from 20px to 13px and color fades to --text-muted over 300ms with --ease-default, then the new Hero_Exchange enters with opacity 0→1 and translateY 12px→0 over 350ms with --ease-default and a 50ms delay
6. WHILE the conversation contains more exchanges than fit within the visible area, THE Waggle_Dance SHALL allow scrolling and auto-scroll to keep the latest exchange visible using scrollIntoView({ behavior: 'smooth' })
7. IF the user has enabled prefers-reduced-motion, THEN THE Waggle_Dance SHALL skip all entrance and reposition animations and render exchanges in their final positions instantly

### Requirement 9: Intake Progress Indicator

**User Story:** As a creator, I want to see how far along I am in the intake conversation, so that I know how many questions remain.

#### Acceptance Criteria

1. THE Intake_Screen SHALL display a Progress_Indicator consisting of exactly 4 pill-shaped segments with 4px gap between them, positioned in a 24px-height row between the conversation area and the Input_Bar, constrained to --content-max width and centered with 24px horizontal padding
2. THE Progress_Indicator SHALL render each segment at 2px height with 2px border-radius (fully rounded ends), using three visual states: done (filled with --progress-done), active (filled with --progress-active), and empty (filled with --progress-empty)
3. WHEN the Creator completes an exchange corresponding to one of the four fixed intake questions, THE Progress_Indicator SHALL transition the corresponding segment from active to done with a color change over 400ms
4. THE Progress_Indicator segments SHALL correspond to the four fixed intake questions in fixed left-to-right order: idea, desired outcome, audience, and resistance
5. THE Progress_Indicator SHALL be hidden during the Opening_State and SHALL appear only after the first exchange is submitted
6. IF the Creator resumes an intake conversation that already has captured signals, THEN THE Progress_Indicator SHALL render all segments for previously answered questions as done and the next unanswered segment as active on initial load

### Requirement 10: Intake Input Bar Design

**User Story:** As a creator, I want a clean, focused input area, so that typing my response feels natural and uncluttered.

#### Acceptance Criteria

1. THE Input_Bar SHALL inherit the --surface-page background color with a 1px top border using --border-default, and SHALL NOT display any box shadow, elevation, or tonal shift from the page surface
2. THE Input_Bar SHALL use padding of 12px 24px 20px (extra bottom for mobile home indicator), with a --content-max inner container centered horizontally, containing three elements in a flex row with 8px gap and flex-end alignment: Attach_Button on the left, auto-expanding textarea (flex:1) in the center, Send_Button on the right
3. THE Attach_Button SHALL be a 34×34px circle with no background fill, a 0.5px solid --border-input border, displaying a paperclip icon at 15px in --text-muted color
4. WHEN the Attach_Button is clicked, THE Input_Bar SHALL open a file picker accepting only PDF, PPTX, and DOCX formats with a maximum file size of 20 MB
5. IF a selected file exceeds 20 MB or is not one of the accepted formats, THEN THE Input_Bar SHALL reject the file without uploading and display an inline error message that auto-dismisses after 5 seconds
6. THE textarea SHALL use --surface-input background, 0.5px solid --border-input border, 18px border-radius, 9px 14px padding, --text-base (15px) font size, --text-primary color, placeholder "Your answer…" in --text-placeholder color, and auto-expand from 1 line (~38px) to a maximum of 5 lines then scroll internally
7. WHEN the textarea receives focus, THE border-color SHALL transition to --border-input-focus with no fill change, no amber border, and no glow
8. WHEN the Creator presses Enter without Shift held, THE textarea SHALL submit the current message. WHEN the Creator presses Shift+Enter, THE textarea SHALL insert a newline character
9. THE Send_Button SHALL be a 34×34px circle with --accent fill (#c47a00) displaying a white arrow-up icon at 14px, with no border
10. WHILE the textarea contains only whitespace or is empty, THE Send_Button SHALL appear at 0.35 opacity and be non-interactive (disabled)
11. WHEN the textarea contains at least one non-whitespace character, THE Send_Button SHALL appear at full opacity and become interactive
12. WHEN the Send_Button is pressed, THE Send_Button SHALL scale to 0.94 for 100ms duration as active feedback

### Requirement 11: Intake AI Conversational Behavior

**User Story:** As a creator, I want the AI to ask short, direct questions in a fixed sequence, so that the conversation feels purposeful rather than open-ended.

#### Acceptance Criteria

1. THE Intake_Engine SHALL produce exactly one interrogative sentence per turn, and the total response SHALL NOT exceed 20 words
2. THE Intake_Engine SHALL NOT include affirmations (e.g., "Great!", "Got it," "Perfect," "Interesting," "That's helpful"), markdown formatting (no asterisks, no bold, no bullet points), or em dashes in any response; the question IS the entire response with no preamble
3. THE Intake_Engine SHALL ask four questions in the following fixed order: (1) "What's the idea?" (2) "What do you want them to do differently after they hear it?" (3) "Who are these people — in human terms, not titles?" (4) "What's their biggest reason for tuning this out?"
4. WHEN the Creator has answered all four questions, THE Intake_Engine SHALL have enough signal to generate; IF a signal is genuinely unclear, one inference-confirm is allowed (state what was inferred, ask if it's right), then generate regardless of the answer
5. THE Intake_Engine SHALL adopt the tone of a sharp colleague who asks good questions and doesn't waste your time — not a therapist, not a workshop facilitator, not a chatbot assistant — by excluding hedging phrases, open-ended qualifiers, and therapeutic language
6. THE Intake_Engine SHALL NOT open with acknowledgment of what was heard; it SHALL acknowledge by how the next question is framed, not by commenting on the previous answer

### Requirement 12: Preserved System Behaviors

**User Story:** As a developer, I want clarity on what remains unchanged, so that the redesign does not accidentally break existing functionality.

#### Acceptance Criteria

1. THE Waggle_Dance SHALL continue to use Supabase for authentication and database operations with no changes to the existing auth flow, database schema, or RLS policies; additive extensions to the schema are permitted
2. THE Waggle_Dance SHALL continue to use the existing story generation engine with no changes to its API route paths (/api/stories/generate, /api/stories/refine, /api/intake/chat) or generation logic
3. THE Reading_Experience SHALL continue to use a dark surface (#000000) background with the existing serif typography (--font-reading: Georgia, 'New York', serif) and warm amber accent color
4. THE Waggle_Dance SHALL continue to use Framer Motion (already in the dependency stack) for all animations including the new intake entrance animations described in Requirements 7 and 8
5. THE Waggle_Dance SHALL continue to use Tailwind v4 for layout and spacing utilities where appropriate, with the design tokens defined in Requirements 2–5 taking precedence for colors, typography, and motion values
