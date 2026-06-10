# Implementation Plan: Waggle Dance

## Overview

Implement a Next.js + TypeScript application on Vercel with Supabase (auth, Postgres, storage), Anthropic Claude streaming API, Framer Motion animations, and PDF export. The implementation follows an incremental approach: project scaffolding and types first, then database and auth, then AI-powered features (intake, generation, refinement), then reader experience, and finally export and polish.

## Tasks

- [x] 1. Project scaffolding and core types
  - [x] 1.1 Initialize Next.js project with TypeScript and install dependencies
    - Create Next.js 14+ app with App Router, TypeScript, Tailwind CSS
    - Install: `@supabase/supabase-js`, `@supabase/ssr`, `@anthropic-ai/sdk`, `framer-motion`, `pdf-parse`, `mammoth`, `puppeteer-core`
    - Install dev: `vitest`, `@testing-library/react`, `msw`, `playwright`
    - Configure `tsconfig.json` path aliases, Tailwind config with dark theme and serif fonts
    - Set up environment variables structure (`.env.local.example`)
    - _Requirements: 12.1, 12.4_

  - [x] 1.2 Define TypeScript types and interfaces
    - Create `src/types/story.ts` with `IntakeSignals`, `Chapter`, `VisualStyle`, `StoryStatus`, `Story` interfaces
    - Create `src/types/intake.ts` with `IntakeMode`, `IntakeMessage`, `IntakeState` interfaces
    - Create `src/types/database.ts` with Supabase-compatible database types
    - Create `src/types/api.ts` with `ApiError` interface and error code union type
    - _Requirements: 2.6, 4.1, 6.1_

  - [x] 1.3 Set up directory structure and shared UI components
    - Create the full `src/` directory structure matching the design component architecture
    - Implement base UI components: `Button.tsx`, `Input.tsx`, `Modal.tsx` with accessibility (ARIA labels, keyboard navigation, focus indicators)
    - Set up global styles with dark theme, warm palette, serif/editorial typeface, responsive breakpoints (320px, 768px, 1024px)
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

- [x] 2. Database and authentication
  - [x] 2.1 Set up Supabase schema and Row Level Security
    - Create SQL migration with `stories` table, `user_profiles` table, all indexes
    - Enable RLS and create policies for creator CRUD and public share read
    - Create triggers for `updated_at` auto-update and user profile creation on signup
    - _Requirements: 1.2, 10.1, 8.2_

  - [x] 2.2 Implement authentication flow
    - Create `src/lib/supabase/client.ts` (browser client) and `src/lib/supabase/server.ts` (server client)
    - Create `src/lib/supabase/middleware.ts` with protected route checking for `/dashboard` and `/stories` paths
    - Implement `src/app/auth/login/page.tsx` with email/password sign-in form, error display, and retry capability
    - Implement `src/app/auth/callback/route.ts` for OAuth callback handling
    - Create root `middleware.ts` integrating Supabase auth middleware
    - Configure 7-day session persistence and sign-out with session clearing
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [x] 2.3 Write property test for authentication and story ownership
    - **Property 1 (partial): Story ownership invariant** — verify that stories created in an authenticated session are always associated with the authenticated user's ID
    - **Validates: Requirements 1.1, 1.2**

- [x] 3. Checkpoint - Ensure auth and database work
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Intake engine and document upload
  - [x] 4.1 Implement streaming utilities and AI prompt infrastructure
    - Create `src/lib/ai/stream.ts` with `createStreamingResponse` helper for SSE streaming
    - Create `src/lib/ai/intake-prompt.ts` with system prompt for intake conversation including interview modes (conversational, continuum, structured choice, inference-and-confirm)
    - Configure Anthropic SDK client initialization with streaming support
    - _Requirements: 2.1, 2.5, 4.8_

  - [x] 4.2 Implement intake chat API route
    - Create `src/app/api/intake/chat/route.ts` with POST handler
    - Accept `storyId`, `message`, and current `signals` in request body
    - Stream response tokens as SSE events with signal_update and ready_to_generate event types
    - Implement signal tracking: emit `ready_to_generate` when topic + desired shift are present
    - Persist messages to `intake_transcript` in Supabase after each exchange
    - Handle intake resumption from last saved state for abandoned sessions
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9_

  - [x] 4.3 Implement document upload and text extraction
    - Create `src/lib/documents/extract.ts` with extraction for PDF (pdf-parse), DOCX (mammoth), and PPTX
    - Create `src/lib/documents/parse.ts` with signal inference from extracted text
    - Create `src/app/api/documents/upload/route.ts` accepting multipart form data
    - Validate file type (PDF, PPTX, DOCX) and size (≤20MB) before processing
    - Upload to Supabase Storage `documents` bucket, store URL in story record
    - Return extracted text and inferred signals on success
    - Handle errors: wrong format (415), too large (413), extraction failure (200 with null)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [x] 4.4 Build IntakeChat and DocumentUpload UI components
    - Create `src/components/intake/IntakeChat.tsx` with chat message interface, text input, streaming response display
    - Create `src/components/intake/IntakeMessage.tsx` for individual message bubbles
    - Create `src/components/intake/DocumentUpload.tsx` with file validation, upload progress, and acknowledgment
    - Create `src/components/intake/IntakeProgress.tsx` showing signal completion status
    - Create `src/hooks/useIntake.ts` managing intake conversation state, SSE stream reading, and signal tracking
    - Surface "Generate Story" button when minimum viable intake (topic + desired shift) is met
    - _Requirements: 2.1, 2.3, 2.7, 3.4, 3.5_

  - [x] 4.5 Create new story page with intake flow
    - Create `src/app/stories/new/page.tsx` as intake flow container
    - Wire IntakeChat component with intake API route
    - Handle document upload integration (signals merge into intake state)
    - Implement 10-minute inactivity detection for session persistence
    - _Requirements: 2.1, 2.8, 3.2, 3.3_

  - [x] 4.6 Write property test for intake signal invariants
    - **Property 2: Intake Signal Invariants** — verify: (a) story cannot transition to `generating` without non-empty topic, (b) intake_transcript is append-only, (c) document fields are both-set-or-both-null
    - **Validates: Requirements 2.3, 2.6, 2.8, 3.7**

- [x] 5. Story generation engine
  - [x] 5.1 Implement story generation API route
    - Create `src/lib/ai/story-prompt.ts` with system prompt incorporating framework selection logic, metaphor constraint, chapter structure (3-5 chapters, 800-1200 words), protagonist selection, and open ending requirement
    - Create `src/app/api/stories/generate/route.ts` with POST handler
    - Stream SSE events: `transition`, `chapter_start`, `token`, `chapter_complete` (with image prompt), `story_complete`
    - Incorporate visual style into image prompt generation for each chapter
    - Save completed story content to Supabase, update status to `complete`
    - Handle generation failure: preserve any fully generated chapters, send error event
    - Apply default framework/protagonist selections when signals are insufficient
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10_

  - [x] 5.2 Implement generation transition and streaming UI
    - Create `src/components/story/GenerationTransition.tsx` with Framer Motion animation (≥2 seconds display)
    - Create `src/hooks/useStoryGeneration.ts` managing SSE stream reading and chapter assembly
    - Wire transition into the story creation flow: intake complete → transition → streaming chapters
    - Display crafting indication during entire generation phase
    - Handle timeout (60s) with error display and retry option
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

  - [x] 5.3 Build StoryView and StyleSelector components
    - Create `src/components/story/StoryView.tsx` displaying all chapters with refinement access
    - Create `src/components/story/ChapterCard.tsx` for individual chapter display
    - Create `src/components/story/StyleSelector.tsx` with four visual style options (watercolor, manga, flat, ink sketch)
    - Create `src/app/stories/[id]/page.tsx` as story view page with refinement, sharing, export controls
    - Apply watercolor as default when no style selected before generation
    - Allow style change post-generation with image prompt regeneration
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

  - [x] 5.4 Write property test for story integrity invariants
    - **Property 1: Story Integrity Invariants** — verify: (a) story_content has 0-5 chapters, (b) completed chapters have non-empty title/body/imagePrompt, (c) visual_style is always a valid enum, (d) status follows state machine, (e) share_token is unique and non-null, (f) previous_versions is append-only
    - **Validates: Requirements 4.1, 4.7, 5.2, 6.1, 6.3**

- [x] 6. Story refinement
  - [x] 6.1 Implement chapter refinement API route
    - Create `src/lib/ai/refinement-prompt.ts` with system prompt ensuring cross-chapter consistency (character names, plot points, timeline)
    - Create `src/app/api/stories/refine/route.ts` with POST handler
    - Accept `storyId`, `chapterIndex`, `direction` (max 500 chars), and `fullStory` for context
    - Stream revised chapter via SSE, update only the specified chapter in Supabase
    - Handle failure: retain pre-refinement state, send error event
    - _Requirements: 5.1, 5.3, 5.4, 5.5, 5.6_

  - [x] 6.2 Implement full story regeneration with version history
    - Add regeneration endpoint logic to push current `story_content` to `previous_versions` before regeneration
    - Generate new story using same intake signals
    - Allow Creator to revert to previous version
    - _Requirements: 5.2_

  - [x] 6.3 Build RefinementChat component and wire refinement UI
    - Create `src/components/story/RefinementChat.tsx` with direction input (500 char limit) and streaming revised chapter display
    - Create `src/hooks/useChapterRefinement.ts` managing refinement SSE stream
    - Show revised chapter alongside original for comparison
    - Allow accept, further refinement, or revert actions
    - _Requirements: 5.1, 5.3, 5.6_

  - [x] 6.4 Write property test for refinement invariants
    - **Property 4: Refinement Invariants** — verify: (a) only the targeted chapter changes during refinement, (b) full regeneration pushes current content to previous_versions before overwrite, (c) refinement only applies to stories with status `complete`
    - **Validates: Requirements 5.1, 5.2, 5.5**

- [x] 7. Checkpoint - Ensure core creator flow works end-to-end
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Reader experience and sharing
  - [x] 8.1 Implement paced reading experience components
    - Create `src/components/reader/ReaderExperience.tsx` as paced reading container (one chapter at a time, dark background, warm palette, serif typeface, max 720px width)
    - Create `src/components/reader/ChapterReveal.tsx` with Framer Motion fade-in animations (600-1200ms transitions)
    - Create `src/components/reader/ChapterTransition.tsx` with visible advance prompt between chapters
    - Conditionally render images within chapter body when `imageUrl` present and visuals enabled
    - Ensure mobile-first layout (320px+), no navigation chrome, no account prompts
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

  - [x] 8.2 Implement share link and reader view SSR page
    - Create `src/app/read/[shareToken]/page.tsx` as server-rendered public page
    - Query story by share_token where `share_active = true`
    - Generate Open Graph metadata (title, description, preview image when visuals enabled)
    - Return non-specific "unavailable" message for invalid, non-existent, or deactivated tokens (no information leakage)
    - Render full paced reading experience without authentication
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

  - [x] 8.3 Build ShareControls component and sharing management
    - Create `src/components/shared/ShareControls.tsx` with share toggle, URL display, copy-to-clipboard
    - Wire share activation/deactivation to Supabase update (`share_active` field)
    - Confirm deactivation with note that existing links stop working
    - _Requirements: 8.1, 8.4, 10.4_

  - [x] 8.4 Write property test for sharing invariants
    - **Property 3: Sharing Invariants** — verify: (a) reader access is blocked when share_active is false, (b) share URL never reveals story ID or creator identity, (c) invalid/non-existent tokens produce same response as deactivated tokens
    - **Validates: Requirements 8.1, 8.2, 8.4, 8.5**

- [x] 9. Dashboard and story management
  - [x] 9.1 Implement story list and dashboard page
    - Create `src/app/dashboard/layout.tsx` as protected layout wrapper
    - Create `src/app/dashboard/page.tsx` querying user's stories sorted by `updated_at` DESC
    - Create `src/components/dashboard/StoryList.tsx` rendering story cards
    - Create `src/components/dashboard/StoryCard.tsx` with title, topic, dates, share status
    - Create `src/components/dashboard/EmptyState.tsx` with prompt to create first story
    - _Requirements: 10.1, 10.2, 10.3, 10.5_

  - [x] 9.2 Implement story deletion with confirmation
    - Add delete action to StoryCard with Modal confirmation step
    - Implement DELETE handler in story API route
    - Ensure permanent removal after confirmation
    - _Requirements: 10.6_

- [x] 10. PDF export
  - [x] 10.1 Implement PDF generation
    - Create `src/lib/export/pdf.ts` with Puppeteer-based PDF generation
    - Create a print-optimized HTML template: A4 dimensions, 20mm margins, serif typeface, light background with dark text
    - Each chapter starts on a new page with story title on first page
    - Conditionally include images (one per chapter) when visuals enabled and image URLs available
    - Omit image placeholders when visuals disabled (text-only layout)
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [x] 10.2 Implement PDF export API route and UI trigger
    - Create `src/app/api/export/pdf/route.ts` returning PDF binary response
    - Create `src/components/shared/ExportButton.tsx` triggering download
    - Handle generation failure with error notification and retry option
    - _Requirements: 9.6_

- [x] 11. Image generation stub and visual toggle
  - [x] 11.1 Implement image generation stub and visuals toggle
    - Create `src/lib/ai/images.ts` with stubbed `generateChapterImage` returning null
    - Wire visuals enabled/disabled toggle in StoryView
    - Ensure Reader_View respects visuals visibility setting
    - Ensure Image_Prompts are always generated regardless of visuals toggle state
    - _Requirements: 6.5, 6.6_

- [x] 12. Landing page and responsive polish
  - [x] 12.1 Create landing page
    - Implement `src/app/page.tsx` as public landing page
    - Include sign-in navigation and value proposition
    - Ensure responsive layout across all breakpoints
    - _Requirements: 1.6, 12.1_

  - [x] 12.2 Accessibility and responsive audit pass
    - Verify WCAG 2.1 Level AA contrast ratios (4.5:1 normal text, 3:1 large text)
    - Ensure all interactive elements reachable via Tab, activatable via Enter/Space, with visible focus indicators
    - Add ARIA labels to all elements without visible text labels
    - Use semantic HTML (headings, landmarks, lists, associated labels)
    - Verify 44×44px minimum touch targets on mobile (≤767px)
    - Ensure no horizontal scrolling at any supported viewport width
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

- [x] 13. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- Image generation is architecturally present but stubbed in v1 (task 11.1)
- PDF export uses Puppeteer for server-side HTML-to-PDF rendering
- All streaming uses Server-Sent Events via Next.js Route Handlers
- Vitest is the test runner; Playwright for E2E

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3"] },
    { "id": 2, "tasks": ["2.1", "2.2"] },
    { "id": 3, "tasks": ["2.3", "4.1"] },
    { "id": 4, "tasks": ["4.2", "4.3"] },
    { "id": 5, "tasks": ["4.4", "4.5"] },
    { "id": 6, "tasks": ["4.6", "5.1"] },
    { "id": 7, "tasks": ["5.2", "5.3"] },
    { "id": 8, "tasks": ["5.4", "6.1", "6.2"] },
    { "id": 9, "tasks": ["6.3", "6.4"] },
    { "id": 10, "tasks": ["8.1", "8.2", "9.1"] },
    { "id": 11, "tasks": ["8.3", "8.4", "9.2"] },
    { "id": 12, "tasks": ["10.1", "11.1"] },
    { "id": 13, "tasks": ["10.2", "12.1"] },
    { "id": 14, "tasks": ["12.2"] }
  ]
}
```
