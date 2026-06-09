# Technical Design Document

## Overview

Waggle Dance is a Next.js application that combines a conversational AI intake system with a story generation engine to produce short-form narrative content. The architecture separates three concerns: the creator experience (auth, intake, refinement, management), the AI layer (streaming intake conversations and story generation via Claude), and the reader experience (public, SSR-rendered story pages with paced chapter reveal).

## Architecture

### High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Vercel (Hosting)                            │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                   Next.js Application                        │   │
│  │                                                             │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐   │   │
│  │  │  Creator UI  │  │  Reader UI   │  │   Auth Pages   │   │   │
│  │  │  (protected) │  │  (public)    │  │   (public)     │   │   │
│  │  └──────┬───────┘  └──────┬───────┘  └────────┬───────┘   │   │
│  │         │                  │                    │           │   │
│  │  ┌──────┴──────────────────┴────────────────────┴───────┐  │   │
│  │  │              API Routes (Route Handlers)              │  │   │
│  │  │                                                       │  │   │
│  │  │  /api/intake/chat     - Streaming intake conversation │  │   │
│  │  │  /api/stories/generate - Streaming story generation   │  │   │
│  │  │  /api/stories/refine   - Chapter refinement           │  │   │
│  │  │  /api/stories/[id]     - CRUD operations              │  │   │
│  │  │  /api/documents/upload - Document processing          │  │   │
│  │  │  /api/export/pdf       - PDF generation               │  │   │
│  │  └──────────────────────────┬────────────────────────────┘  │   │
│  └─────────────────────────────┼───────────────────────────────┘   │
│                                │                                    │
└────────────────────────────────┼────────────────────────────────────┘
                                 │
                    ┌────────────┼────────────────┐
                    │            │                 │
           ┌───────▼───────┐ ┌──▼──────────┐ ┌───▼──────────┐
           │   Supabase    │ │  Anthropic   │ │  Image API   │
           │               │ │  Claude API  │ │  (stubbed)   │
           │  - Auth       │ │              │ │              │
           │  - Postgres   │ │  claude-     │ │  Replicate   │
           │  - Storage    │ │  sonnet-4-5  │ │  or OpenAI   │
           └───────────────┘ └─────────────┘ └──────────────┘
```

### Application Routes

```
/                           → Landing page (public)
/auth/login                 → Sign in (public)
/auth/callback              → OAuth callback handler
/dashboard                  → Story list/management (protected)
/stories/new                → Intake interview flow (protected)
/stories/[id]               → Story view with refinement (protected)
/stories/[id]/export        → PDF export trigger (protected)
/read/[shareToken]          → Public reader experience (public, SSR)
```

### Component Architecture

```
src/
├── app/
│   ├── layout.tsx                    # Root layout with providers
│   ├── page.tsx                      # Landing page
│   ├── auth/
│   │   ├── login/page.tsx            # Login page
│   │   └── callback/route.ts        # OAuth callback
│   ├── dashboard/
│   │   ├── layout.tsx                # Protected layout wrapper
│   │   └── page.tsx                  # Story list
│   ├── stories/
│   │   ├── new/page.tsx              # Intake flow container
│   │   └── [id]/
│   │       ├── page.tsx              # Story view + refinement
│   │       └── export/route.ts       # PDF generation endpoint
│   ├── read/
│   │   └── [shareToken]/page.tsx     # Public reader (SSR)
│   └── api/
│       ├── intake/
│       │   └── chat/route.ts         # Streaming intake conversation
│       ├── stories/
│       │   ├── generate/route.ts     # Streaming story generation
│       │   └── refine/route.ts       # Chapter refinement
│       ├── documents/
│       │   └── upload/route.ts       # Document upload + extraction
│       └── export/
│           └── pdf/route.ts          # PDF generation
├── components/
│   ├── intake/
│   │   ├── IntakeChat.tsx            # Chat interface for intake
│   │   ├── IntakeMessage.tsx         # Individual message bubble
│   │   ├── DocumentUpload.tsx        # File upload affordance
│   │   └── IntakeProgress.tsx        # Signal completion indicator
│   ├── story/
│   │   ├── StoryView.tsx             # Full story display
│   │   ├── ChapterCard.tsx           # Individual chapter with refinement
│   │   ├── RefinementChat.tsx        # Chapter refinement interface
│   │   ├── GenerationTransition.tsx  # Transition animation state
│   │   └── StyleSelector.tsx         # Visual style picker
│   ├── reader/
│   │   ├── ReaderExperience.tsx      # Paced reading container
│   │   ├── ChapterReveal.tsx         # Animated chapter display
│   │   └── ChapterTransition.tsx     # Between-chapter moment
│   ├── dashboard/
│   │   ├── StoryList.tsx             # Story cards grid
│   │   ├── StoryCard.tsx             # Individual story preview
│   │   └── EmptyState.tsx            # First-story prompt
│   ├── shared/
│   │   ├── ShareControls.tsx         # Share link management
│   │   └── ExportButton.tsx          # PDF export trigger
│   └── ui/
│       ├── Button.tsx                # Base button
│       ├── Input.tsx                 # Text input
│       └── Modal.tsx                 # Confirmation dialogs
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # Browser Supabase client
│   │   ├── server.ts                 # Server Supabase client
│   │   └── middleware.ts             # Auth middleware
│   ├── ai/
│   │   ├── intake-prompt.ts          # Intake system prompt
│   │   ├── story-prompt.ts           # Story generation system prompt
│   │   ├── refinement-prompt.ts      # Chapter refinement prompt
│   │   └── stream.ts                 # Streaming response utilities
│   ├── documents/
│   │   ├── extract.ts               # PDF/DOCX/PPTX text extraction
│   │   └── parse.ts                 # Signal extraction from doc text
│   └── export/
│       └── pdf.ts                    # PDF generation logic
├── hooks/
│   ├── useIntake.ts                  # Intake conversation state
│   ├── useStoryGeneration.ts         # Generation streaming hook
│   └── useChapterRefinement.ts       # Refinement streaming hook
└── types/
    ├── story.ts                      # Story, Chapter, IntakeSignals types
    ├── intake.ts                     # Intake message, mode types
    └── database.ts                   # Supabase generated types
```

## Data Models

### Database Schema

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Stories table
CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  topic TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'intake' 
    CHECK (status IN ('intake', 'generating', 'complete', 'error')),
  
  -- Source document
  source_document_url TEXT,
  source_document_type TEXT CHECK (source_document_type IN ('pdf', 'pptx', 'docx')),
  
  -- Intake data
  intake_transcript JSONB DEFAULT '[]'::jsonb,
  intake_signals JSONB DEFAULT '{}'::jsonb,
  
  -- Engine internals (never exposed to UI)
  framework_selected TEXT[],
  
  -- Story content
  story_content JSONB DEFAULT '[]'::jsonb,
  -- Each element: { title: string, body: string, image_prompt: string, image_url: string | null }
  
  -- Version history for revert
  previous_versions JSONB DEFAULT '[]'::jsonb,
  
  -- Visual style
  visual_style TEXT NOT NULL DEFAULT 'watercolor'
    CHECK (visual_style IN ('watercolor', 'manga', 'flat', 'ink_sketch')),
  style_prompt TEXT,
  visuals_enabled BOOLEAN NOT NULL DEFAULT true,
  
  -- Sharing
  share_token UUID UNIQUE DEFAULT uuid_generate_v4(),
  share_active BOOLEAN NOT NULL DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User profiles (extends Supabase auth.users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_stories_user_id ON stories(user_id);
CREATE INDEX idx_stories_share_token ON stories(share_token) WHERE share_active = true;
CREATE INDEX idx_stories_updated_at ON stories(user_id, updated_at DESC);

-- Row Level Security
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies: Creator can CRUD their own stories
CREATE POLICY "Users can view own stories" ON stories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stories" ON stories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stories" ON stories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own stories" ON stories
  FOR DELETE USING (auth.uid() = user_id);

-- Policy: Public read access via share token (for reader view)
CREATE POLICY "Public can read shared stories" ON stories
  FOR SELECT USING (share_active = true);

-- User profiles policies
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Trigger: auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER stories_updated_at
  BEFORE UPDATE ON stories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Trigger: auto-create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

### TypeScript Types

```typescript
// types/story.ts

export interface IntakeSignals {
  topic: string;
  tension: string | null;
  audiencePortrait: string | null;
  resistancePattern: string | null;
  stakes: string | null;
  desiredShift: string | null;
}

export interface Chapter {
  title: string;
  body: string;
  imagePrompt: string;
  imageUrl: string | null;
}

export type VisualStyle = 'watercolor' | 'manga' | 'flat' | 'ink_sketch';

export type StoryStatus = 'intake' | 'generating' | 'complete' | 'error';

export interface Story {
  id: string;
  userId: string;
  title: string | null;
  topic: string;
  status: StoryStatus;
  sourceDocumentUrl: string | null;
  sourceDocumentType: 'pdf' | 'pptx' | 'docx' | null;
  intakeTranscript: IntakeMessage[];
  intakeSignals: IntakeSignals;
  frameworkSelected: string[];
  storyContent: Chapter[];
  previousVersions: Chapter[][];
  visualStyle: VisualStyle;
  stylePrompt: string | null;
  visualsEnabled: boolean;
  shareToken: string;
  shareActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// types/intake.ts

export type IntakeMode = 'conversational' | 'continuum' | 'structured_choice' | 'inference_confirm';

export interface IntakeMessage {
  role: 'assistant' | 'user';
  content: string;
  mode?: IntakeMode;
  signalTargeted?: keyof IntakeSignals;
  timestamp: string;
}

export interface IntakeState {
  storyId: string;
  messages: IntakeMessage[];
  signals: IntakeSignals;
  documentUploaded: boolean;
  readyToGenerate: boolean;
}
```

## API Design

### Intake Chat (Streaming)

```
POST /api/intake/chat
Content-Type: application/json

Request:
{
  "storyId": "uuid",
  "message": "string",
  "signals": IntakeSignals  // current state for context
}

Response: Server-Sent Events stream
data: {"type": "token", "content": "..."}
data: {"type": "signal_update", "signal": "topic", "value": "..."}
data: {"type": "ready_to_generate", "signals": IntakeSignals}
data: {"type": "done"}
```

### Story Generation (Streaming)

```
POST /api/stories/generate
Content-Type: application/json

Request:
{
  "storyId": "uuid",
  "signals": IntakeSignals,
  "visualStyle": VisualStyle,
  "documentContent": "string | null"
}

Response: Server-Sent Events stream
data: {"type": "transition", "message": "..."}
data: {"type": "chapter_start", "index": 0, "title": "..."}
data: {"type": "token", "content": "..."}
data: {"type": "chapter_complete", "index": 0, "imagePrompt": "..."}
data: {"type": "story_complete", "title": "...", "frameworkSelected": [...]}
data: {"type": "error", "message": "..."}
```

### Chapter Refinement (Streaming)

```
POST /api/stories/refine
Content-Type: application/json

Request:
{
  "storyId": "uuid",
  "chapterIndex": number,
  "direction": "string (max 500 chars)",
  "fullStory": Chapter[]  // all chapters for context
}

Response: Server-Sent Events stream
data: {"type": "token", "content": "..."}
data: {"type": "chapter_complete", "chapter": Chapter}
data: {"type": "error", "message": "..."}
```

### Document Upload

```
POST /api/documents/upload
Content-Type: multipart/form-data

Request:
  file: File (PDF, PPTX, DOCX, max 20MB)
  storyId: string

Response:
{
  "success": true,
  "documentUrl": "string",
  "extractedText": "string (truncated for intake context)",
  "inferredSignals": Partial<IntakeSignals>
}
```

### PDF Export

```
POST /api/export/pdf
Content-Type: application/json

Request:
{
  "storyId": "uuid"
}

Response: application/pdf (binary stream)
```

## Key Technical Decisions

### Streaming Architecture

Both intake and story generation use Server-Sent Events (SSE) via Next.js Route Handlers. The pattern:

1. Client sends a POST request
2. Server creates a `ReadableStream` with a `TransformStream`
3. Server calls Claude API with `stream: true`
4. Each token from Claude is written to the stream as an SSE event
5. Client reads the stream using `EventSource` or `fetch` with stream reading

```typescript
// lib/ai/stream.ts (pattern)
export function createStreamingResponse(
  claudeStream: AsyncIterable<StreamEvent>
): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      for await (const event of claudeStream) {
        const data = `data: ${JSON.stringify(event)}\n\n`;
        controller.enqueue(encoder.encode(data));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

### Auth Middleware Pattern

Using Next.js middleware with Supabase SSR helpers:

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Protected routes check
  const protectedPaths = ['/dashboard', '/stories'];
  const isProtected = protectedPaths.some(p => 
    request.nextUrl.pathname.startsWith(p)
  );

  if (isProtected) {
    const supabase = createServerClient(/* config */);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  return NextResponse.next();
}
```

### Reader View SSR

Share pages use Next.js server components for instant load and Open Graph metadata:

```typescript
// app/read/[shareToken]/page.tsx
import { Metadata } from 'next';

export async function generateMetadata({ params }): Promise<Metadata> {
  const story = await getStoryByShareToken(params.shareToken);
  if (!story) return { title: 'Story not available' };
  
  return {
    title: story.title,
    description: `A story about ${story.topic}`,
    openGraph: {
      title: story.title,
      description: `A story about ${story.topic}`,
      type: 'article',
    },
  };
}
```

### Document Text Extraction

Server-side extraction using established libraries:

- **PDF**: `pdf-parse` — extracts text content from PDF files
- **DOCX**: `mammoth` — converts DOCX to plain text
- **PPTX**: `officegen` or custom XML parsing of the Open XML format

The extracted text is passed to the intake system prompt as context, allowing Claude to identify signals already present in the document.

### PDF Export Approach

Using a print-optimized HTML template rendered to PDF via `puppeteer` or `@react-pdf/renderer`:

**Recommended approach**: Server-side HTML → PDF via Puppeteer (headless Chrome on Vercel):
1. Render a Next.js page with print-specific styles (light background, serif font, A4 dimensions)
2. Use Puppeteer to capture as PDF
3. Return the PDF binary

This ensures the designed typography and layout are preserved exactly as intended. The print template is a separate component with its own styling independent of the dark in-app theme.

### Version History for Revert

When a full regeneration is requested, the current `story_content` array is pushed to `previous_versions` before being replaced. This enables simple revert:

```typescript
// On regeneration:
await supabase.from('stories').update({
  previous_versions: [...story.previousVersions, story.storyContent],
  story_content: newStoryContent,
});
```

### Image Generation Stub

In v1, image generation is architecturally present but stubbed:

```typescript
// lib/ai/images.ts
export async function generateChapterImage(
  imagePrompt: string,
  stylePrompt: string
): Promise<string | null> {
  // STUB: Return null in v1
  // When wired in, this will call Replicate/OpenAI and return a URL
  return null;
}
```

The schema stores `image_prompt` (always generated) and `image_url` (null until image generation is wired in). The reader view conditionally renders images only when `image_url` is present.

## Sequence Diagrams

### Intake → Generation Flow

```
Creator          Next.js API         Claude API        Supabase
  │                  │                   │                │
  │─── New Story ───▶│                   │                │
  │                  │────── INSERT ─────────────────────▶│
  │                  │◀───── story id ───────────────────│
  │◀── Story ID ────│                   │                │
  │                  │                   │                │
  │─── Message ────▶│                   │                │
  │                  │─── Stream (intake prompt + msg) ──▶│
  │                  │◀── Token stream ──│                │
  │◀── SSE tokens ──│                   │                │
  │                  │                   │                │
  │  ... (3-10 exchanges) ...           │                │
  │                  │                   │                │
  │── "Generate" ──▶│                   │                │
  │                  │── UPDATE signals ─────────────────▶│
  │                  │                   │                │
  │◀─ Transition ───│                   │                │
  │                  │─── Stream (story prompt + signals)▶│
  │                  │◀── Token stream ──│                │
  │◀── SSE chapters─│                   │                │
  │                  │                   │                │
  │                  │── UPDATE story_content ──────────▶│
  │◀─ Complete ─────│                   │                │
```

### Share Link Reader Flow

```
Reader           Next.js (SSR)        Supabase
  │                  │                   │
  │── GET /read/abc ▶│                   │
  │                  │── SELECT by share_token ─────────▶│
  │                  │◀── story data ───────────────────│
  │                  │                   │
  │                  │── (check share_active) ──         │
  │                  │                   │
  │◀── SSR HTML ────│  (with OG metadata)               │
  │                  │                   │
  │── (hydrate, begin paced reading) ── │
```

## Infrastructure

### Environment Variables

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Anthropic
ANTHROPIC_API_KEY=

# Image Generation (stubbed in v1)
REPLICATE_API_TOKEN=

# App
NEXT_PUBLIC_APP_URL=
```

### Vercel Configuration

- **Runtime**: Node.js 20
- **Function timeout**: 60 seconds (Pro plan) for streaming generation
- **Edge functions**: Not used (Claude API calls require Node.js runtime for streaming)
- **Environment**: Production + Preview branches

### Supabase Configuration

- **Auth providers**: Email/password (v1), Google OAuth (optional)
- **Storage bucket**: `documents` — for uploaded source files
- **RLS**: Enabled on all tables
- **Realtime**: Not needed in v1

## Non-Functional Considerations

### Performance
- Reader view is server-side rendered for instant load (<1s TTFB)
- Streaming responses begin delivering content within 2 seconds
- Story list pagination if needed (deferred until >50 stories per user)

### Security
- All API routes validate auth via Supabase session
- Share token lookups only return story content, never creator data
- Document uploads are validated for file type and size before processing
- API keys are server-side only, never exposed to client

### Cost Estimation
- Claude API: ~$0.05-0.15 per story generation (claude-sonnet-4-5)
- Claude API: ~$0.01-0.03 per intake message
- Claude API: ~$0.03-0.08 per chapter refinement
- Supabase: Free tier during development, $25/month Pro
- Vercel: Free tier during development, $20/month Pro for 60s function timeout
- Total per-story cost: ~$0.10-0.30 including intake + generation + 1-2 refinements

## Components and Interfaces

### IntakeChat Component

**Purpose**: Manages the conversational intake interview between the Creator and the Intake_Engine.

**Interface**:
```typescript
interface IntakeChatProps {
  storyId: string;
  initialMessages?: IntakeMessage[];
  initialSignals?: IntakeSignals;
  onComplete: (signals: IntakeSignals) => void;
}
```

**Behavior**:
- Renders a chat interface with message bubbles and a text input
- Includes a subtle document upload affordance (not a prominent fork)
- Streams AI responses via the `/api/intake/chat` endpoint
- Tracks signal completion state and surfaces a "Generate Story" action when minimum viable intake (topic + desired shift) is met
- Persists messages to the story record on each exchange
- Handles session resumption if the Creator returns to an incomplete intake

### DocumentUpload Component

**Purpose**: Handles optional document upload during intake, with file validation and upload progress.

**Interface**:
```typescript
interface DocumentUploadProps {
  storyId: string;
  onUploadComplete: (result: { documentUrl: string; extractedText: string; inferredSignals: Partial<IntakeSignals> }) => void;
  onUploadError: (error: string) => void;
}
```

**Behavior**:
- Accepts PDF, PPTX, DOCX files up to 20MB
- Validates file type and size client-side before upload
- Uploads to Supabase Storage via the `/api/documents/upload` route
- Displays upload progress and acknowledgment message on success
- Returns extracted text and inferred signals to the parent intake flow

### GenerationTransition Component

**Purpose**: Renders the visually distinct transition moment between intake completion and story streaming.

**Interface**:
```typescript
interface GenerationTransitionProps {
  isActive: boolean;
  onStreamStart: () => void;
}
```

**Behavior**:
- Displays an animated transition state (Framer Motion) lasting at least 2 seconds
- Communicates that the story is being crafted (editorial copy, not a spinner)
- Transitions seamlessly into the streaming story view when tokens begin arriving

### StoryView Component

**Purpose**: Displays the complete generated story with chapter cards, refinement access, and sharing/export controls.

**Interface**:
```typescript
interface StoryViewProps {
  story: Story;
  onRefineChapter: (chapterIndex: number, direction: string) => void;
  onRegenerate: () => void;
  onStyleChange: (style: VisualStyle) => void;
}
```

**Behavior**:
- Renders all chapters with their titles and bodies
- Each chapter has a refinement affordance (opens conversational refinement)
- Displays visual style selector and visuals toggle
- Provides share link management and PDF export actions
- Shows streaming content during generation/refinement

### RefinementChat Component

**Purpose**: Provides a conversational interface for chapter-level refinement directions.

**Interface**:
```typescript
interface RefinementChatProps {
  storyId: string;
  chapterIndex: number;
  currentChapter: Chapter;
  allChapters: Chapter[];
  onRefinementComplete: (revisedChapter: Chapter) => void;
}
```

**Behavior**:
- Accepts natural language direction (max 500 characters)
- Streams the revised chapter via `/api/stories/refine`
- Shows the revised chapter alongside the original for comparison
- Allows the Creator to accept, request further refinement, or revert

### ReaderExperience Component

**Purpose**: The paced, immersive reading container for shared stories.

**Interface**:
```typescript
interface ReaderExperienceProps {
  story: Story;
}
```

**Behavior**:
- Reveals one chapter at a time with Framer Motion transitions (600-1200ms)
- Provides a visible prompt to advance between chapters
- Renders with dark background, warm palette, serif typeface
- Conditionally shows images when `imageUrl` is present and `visualsEnabled` is true
- Maximum content width of 720px, no navigation chrome
- No creator controls, no account prompts, no branding

### ChapterReveal Component

**Purpose**: Handles the animated reveal of a single chapter within the reading experience.

**Interface**:
```typescript
interface ChapterRevealProps {
  chapter: Chapter;
  isActive: boolean;
  showVisuals: boolean;
  onComplete: () => void;
}
```

**Behavior**:
- Fades in the chapter title, then body text
- If an image is available and visuals are enabled, reveals it within the chapter body flow
- Calls `onComplete` when the reader signals they're ready to advance

### StoryList Component

**Purpose**: Displays the Creator's stories in their dashboard, sorted by last updated.

**Interface**:
```typescript
interface StoryListProps {
  stories: Story[];
  onSelect: (storyId: string) => void;
  onDelete: (storyId: string) => void;
  onToggleShare: (storyId: string, active: boolean) => void;
}
```

**Behavior**:
- Renders stories as cards with title, topic, dates, and share status
- Sorted by `updatedAt` descending
- Displays empty state with prompt to create first story when list is empty
- Delete action requires confirmation before proceeding

### StyleSelector Component

**Purpose**: Presents the four visual style options for the Creator to choose from.

**Interface**:
```typescript
interface StyleSelectorProps {
  currentStyle: VisualStyle;
  onChange: (style: VisualStyle) => void;
  disabled?: boolean;
}
```

**Behavior**:
- Shows four options: watercolor, manga, flat, ink sketch
- Each option has a visual preview swatch or icon
- Highlights the current selection
- Warns if changing style post-generation will trigger image prompt regeneration

### ShareControls Component

**Purpose**: Manages share link activation, deactivation, and URL copying.

**Interface**:
```typescript
interface ShareControlsProps {
  storyId: string;
  shareToken: string;
  shareActive: boolean;
  onToggle: (active: boolean) => void;
}
```

**Behavior**:
- Toggle to activate/deactivate sharing
- Displays and allows copying of the share URL when active
- Confirms deactivation with a note that existing links will stop working

## Error Handling

### API Route Error Handling

All API routes follow a consistent error response pattern:

```typescript
interface ApiError {
  error: string;
  code: 'AUTH_REQUIRED' | 'NOT_FOUND' | 'VALIDATION_ERROR' | 'GENERATION_FAILED' | 'UPLOAD_FAILED' | 'RATE_LIMITED';
  details?: string;
}
```

**Authentication errors**: Return 401 with `AUTH_REQUIRED` code. Client redirects to login.

**Validation errors**: Return 400 with `VALIDATION_ERROR` code and specific field details.

**Generation failures**: 
- If streaming has not begun: return 500 with `GENERATION_FAILED` code
- If streaming has begun: send an error SSE event (`{"type": "error", "message": "..."}`) and close the stream
- Any chapters already fully generated are preserved in the database

**Document upload failures**:
- File too large (>20MB): return 413 with size limit message
- Invalid format: return 415 with accepted formats message  
- Extraction failure: return 200 with `extractedText: null` and an indication that processing failed (interview continues without document context)

**Rate limiting**: Claude API failures due to rate limits return 429 with retry-after guidance.

### Client-Side Error Recovery

- **Intake session loss**: Messages are persisted to Supabase on each exchange. On reconnect, the intake resumes from the last saved state.
- **Generation timeout**: If no SSE events arrive for 60 seconds, the client displays an error and offers retry.
- **Network disconnection during streaming**: The client detects stream closure, preserves any content received, and offers to resume or retry.
- **PDF generation failure**: Client displays error toast with retry option. No partial PDF is delivered.

## Correctness Properties

### Property 1: Story Integrity Invariants

**Validates: Requirements 4.1, 4.7, 5.2, 6.1, 6.3**

1. A story's `story_content` array always contains between 0 chapters (pre-generation) and 5 chapters (post-generation). It never exceeds 5.
2. Every chapter in `story_content` has non-empty `title`, `body`, and `imagePrompt` fields once generation is complete.
3. The `visual_style` field always contains one of the four valid enum values. Default is `watercolor`.
4. A story's `status` follows the state machine: `intake` → `generating` → `complete` | `error`. It cannot regress (except `error` → `generating` on retry).
5. The `share_token` is unique across all stories and is never null (generated on story creation, not on share activation).
6. `previous_versions` accumulates but never loses entries — versions are append-only.

### Property 2: Intake Signal Invariants

**Validates: Requirements 2.3, 2.6, 2.8, 3.7**

1. A story cannot transition from `intake` to `generating` status unless `intake_signals` contains at minimum a non-empty `topic` value.
2. The `intake_transcript` is append-only during an active intake session — messages are never deleted or reordered.
3. If a document is uploaded, `source_document_url` and `source_document_type` are both set or both null.

### Property 3: Sharing Invariants

**Validates: Requirements 8.1, 8.2, 8.4, 8.5**

1. A reader can only access a story via share token when `share_active = true`. Deactivating sharing immediately blocks access.
2. The share URL path (`/read/[shareToken]`) never reveals the story ID or creator identity.
3. Invalid or non-existent share tokens produce the same response as deactivated tokens (no information leakage).

### Property 4: Refinement Invariants

**Validates: Requirements 5.1, 5.2, 5.5**

1. When a chapter is refined, only that chapter's content changes. Other chapters' `body` and `title` fields remain byte-for-byte identical.
2. Before a full regeneration overwrites `story_content`, the current content is pushed to `previous_versions`.
3. A refinement cannot be applied to a story with status other than `complete`.

## Testing Strategy

### Unit Tests

**Location**: `__tests__/unit/`

- **Signal extraction logic** (`lib/documents/parse.ts`): Test that document text produces expected inferred signals
- **Stream utilities** (`lib/ai/stream.ts`): Test SSE formatting, error event injection, stream closure
- **Type validation**: Test that API request/response shapes match TypeScript interfaces
- **Story state machine**: Test valid/invalid status transitions

### Integration Tests

**Location**: `__tests__/integration/`

- **Intake API route**: Mock Claude responses, verify SSE stream format, signal updates, and database persistence
- **Generation API route**: Mock Claude responses, verify chapter parsing from stream, database write on completion
- **Refinement API route**: Mock Claude responses, verify single-chapter update, version preservation
- **Document upload route**: Test file validation, mock extraction, verify storage upload
- **Auth middleware**: Test protected route redirect, session persistence, public route passthrough
- **PDF export**: Verify PDF is generated with correct structure (chapter count, page count)

### End-to-End Tests

**Location**: `__tests__/e2e/`

**Framework**: Playwright

- **Full intake flow**: Sign in → new story → intake conversation → generate → view story
- **Refinement flow**: Open existing story → refine chapter → verify update
- **Share flow**: Activate sharing → open share link in incognito → verify reader experience
- **Export flow**: Generate story → export PDF → verify download
- **Auth flow**: Unauthenticated access → redirect → sign in → return to intended page
- **Reader experience**: Open share link → verify paced chapter reveal → navigate all chapters

### AI Output Quality Tests

**Location**: `__tests__/quality/` (run manually, not in CI)

- **Story structure**: Verify generated stories contain 3-5 chapters within word count bounds
- **Metaphor check**: Verify the topic is not literally named in story text
- **Framework invisibility**: Verify no framework names appear in output
- **Image prompt presence**: Verify each chapter has a non-empty image prompt
- **Emotional arc**: Manual review checklist for story quality (not automated)

### Test Infrastructure

- **Test runner**: Vitest (compatible with Next.js, fast, TypeScript-native)
- **E2E**: Playwright
- **Mocking**: MSW (Mock Service Worker) for API mocking in integration tests
- **Database**: Supabase local development via `supabase start` for integration tests
- **CI**: GitHub Actions running unit + integration on every PR, E2E on merge to main
