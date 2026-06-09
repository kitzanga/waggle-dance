# Waggle Dance — Product Requirements Document

## Brand Note

The working name for this app is **Waggle Dance**. The name comes from the way bees communicate direction, distance, and value through a patterned signal that helps the hive understand where to go and why it matters. That metaphor is central to the product — this app helps leaders translate complex, unfamiliar, or resistance-prone ideas into emotionally resonant signals that people can quickly grasp and act on.

The name should be interpreted as intelligent, memorable, and human — not whimsical, childish, or overly literal. Bee references should be used sparingly. The core brand ideas are **signal, direction, resonance, movement, and shared understanding**.

---

## What We Are Building

A web application that helps leaders communicate complex, unfamiliar, or resistance-prone ideas to their teams, peers, and stakeholders — not through briefings or white papers, but through original short-form stories told in the spirit of a children's parable.

The app has two modes: **creator** and **reader**. A leader uses the creator flow to shape and generate a story. They share it with an audience who experiences it as a paced, visual reading journey inside the app, or receives it as a beautifully designed exported document.

The stories are not generic AI output. They are crafted by an engine that understands storytelling science — drawing from a rich repository of frameworks including but not limited to Campbell's hero journey, Yamada's emotional fable form, Heath's Made to Stick and Switch principles, Aesop's fable structure, Pixar's story spine, narrative transportation theory, the cautionary tale, the allegory, the trickster archetype, Cialdini's influence principles, and Kahneman's System 1 thinking. The engine selects and blends the right approaches invisibly, based on what the creator's inputs reveal about their topic, their audience, and the resistance they are navigating. The creator never sees the framework. They only feel the result.

---

## The Problem This Solves

Leaders are expected to move people on ideas that are unfamiliar, threatening to the status quo, or simply outside the current planning horizon. The tools they have — decks, briefs, reports — are built for minds that are already engaged. Story reaches people before their defenses are up. This app gives leaders a way to create that kind of communication without being a writer.

Waggle Dance is built around a simple belief: **explanation is often not enough**. Leaders need a way to turn complexity into signal — something people can feel, orient around, and carry forward. The app helps them do that through crafted stories that create understanding before resistance fully forms.

---

## Core Product Principles

1. **The story does the work** — the leader's job is to shape it, not write it.
2. **Invisible craft** — the frameworks and storytelling science never surface to the user.
3. **Felt before understood** — emotional resonance precedes intellectual clarity.
4. **Creator ownership** — the inputs make the creator feel they shaped the output, because they did.
5. **Minimum viable friction** — a leader with only a topic and a vague sense of urgency should still get a powerful story.
6. **Document world aware** — in-app experience and export are equally important, not a hierarchy.
7. **Recipient involvement is designed for** — not built in v1, but the architecture anticipates it.
8. **Signal over ornament** — the product should feel crafted, warm, and memorable, but never cute, gimmicky, or overly thematic.

---

## First User

An AI Experience Strategist trying to move executives and teams on unfamiliar, complex topics (e.g., quantum computing awareness, AI transformation). The resistance pattern is absence — topics aren't on people's radar yet, not active pushback. Success means the reader finishes the story and immediately wants to meet, share with others, take action.

---

## The Intake Experience (Discovery Interview)

This is the most important flow in the product. It must feel like a conversation with a thoughtful consultant, not a form.

The intake is a constrained conversational AI interview. The AI has a hidden checklist of what it needs to gather. It moves through that checklist conversationally, adapts its questioning style based on how the creator is responding, and closes when it has enough signal — never when the form is complete.

### What the Engine Needs to Gather

| Signal | Description |
|--------|-------------|
| Topic | What is this story about |
| Tension | What does the audience currently believe, ignore, or misunderstand |
| Audience Portrait | Who these people are in human terms, not titles |
| Resistance | What they will push back on or tune out |
| Stakes | What changes if this lands, what is lost if it doesn't |
| Desired Shift | The one thing the creator wants the audience to do or feel differently |

### Interview Modes

The AI shifts fluidly between these:

- **Conversational** — open questions when the creator is articulate and flowing
- **Continuum** — "Is this more about X, or Y?" One question, high signal.
- **Structured choice** — when the creator is stuck. Offer 3 short human portraits. The creator recognizes rather than constructs.
- **Inference and confirm** — when the engine has enough to guess, surface that guess for quick confirm/correct rather than asking another question.

### Minimum Viable Intake

The interview has a floor: **topic + desired shift**. If a creator can only provide those, the engine infers the rest and generates a story that is less personalized but still more effective than a white paper. The engine never stalls waiting for answers it can reasonably infer.

### The Intake as a Thinking Tool

The intake doubles as a clarification tool for the creator. They should walk away feeling they clarified their own thinking — even before the story exists.

---

## Document Upload (Optional, v1)

A creator may have an existing white paper, briefing, or deck. Document upload is supported as an optional affordance at the start of the intake — a quiet, unprompted option, not a fork in the road.

- **Supported formats**: PDF, PowerPoint (.pptx), Word (.docx), up to 20MB
- **How it works**: The document is passed to the engine as source material. The intake interview then compresses — skipping topic/tension gathering — and focuses on the human layer: audience, resistance, desired shift.
- **What the document is not**: The story will not reproduce, summarize, or reformat the source document. It uses it as raw material to find the lateral metaphor and emotional entry point.

---

## The Storytelling Engine

This is the AI layer that transforms intake signals into a story. It is not a template filler. It is a system of significant sophistication that:

- Reads the intake signals to understand topic, audience, resistance, and desired shift
- Selects the right storytelling approach or blend from its repository of frameworks
- Generates a story with a protagonist, a journey, a metaphor, and a resolution that embodies the topic without explaining it
- Calibrates length, tone, chapter structure, and emotional register to the situation
- Generates image prompts per scene that maintain visual consistency across the story

### Narrative Modes

The engine does not default to a single tone. It selects the right narrative mode based on the topic, audience, resistance pattern, and desired shift:

- **Gentle emotional-fable mode** — when warmth and metaphorical clarity are needed. Simple but not simplistic, emotionally clear, able to make an adult feel something through a surface that is accessible without being juvenile.
- **Brisk, graphic, momentum-driven mode** — when the idea needs more pace, sharper movement, or a more modern and kinetic feel. Direct, visual, contemporary, explicit in its directional energy.
- **Allegory, cautionary tale, oral-tradition simplicity, or other forms** — when the communication challenge calls for something else entirely.

(Benchmarks include Kobi Yamada's emotional-fable sensibility and the fast-paced, graphic energy of *The Adventures of Johnny Bunko*.)

The standard is not "sounds like a children's book." The standard is **"helps the audience feel the idea before they resist it."** The storytelling is emotionally resonant, metaphorically intelligent, and strategically crafted — but never defaults to a juvenile, whimsical, or one-note tone.

### Story Structure Principles

- The topic is never explained. It is embodied in character and situation.
- The protagonist can be anyone or anything — a child, an animal, a humanized object, an abstract force given form. The engine chooses based on what will make the metaphor land hardest. Character type is an engine decision, never a creator decision.
- The protagonist does not need to resemble the audience. They need to make the audience feel something the audience recognizes.
- The metaphor is lateral, not literal. Quantum computing is not a computer. An annuity is a health club membership.
- The resolution plants a seed. It does not close the argument. It opens a door.
- The ending is felt before it is understood.

### Story Specs

- 3–5 chapters
- 800–1200 words total
- ~5-minute reading time
- Emotional motivation precedes rational clarity (the elephant moves first, the rider follows)

### Framework Repository

The engine draws from but is not limited to:

- Campbell's hero journey
- Yamada's emotional fable form
- Heath's Made to Stick — SUCCESs framework
- Heath's Switch — Rider / Elephant / Path
- Aesop's fable structure
- Pixar's story spine
- The cautionary tale form
- The allegory
- The trickster archetype
- The underdog narrative
- Freytag's dramatic arc
- Narrative transportation theory (Green & Brock)
- Cialdini's influence principles
- Kahneman's System 1
- Jonathan Gottschall's work on story and belief change
- The oral tradition form

The engine selects and blends. The user never sees the selection.

---

## Story Refinement

The creator can refine stories conversationally:

- **Chapter-level refinement**: Natural language direction (e.g., "make chapter 3 hit harder, the stakes feel too abstract") — the engine rewrites only that chapter while maintaining coherence with the rest.
- **Full regeneration**: When the whole direction is wrong, regenerate using the same intake signals. Previous version is preserved for revert.

---

## Visual Style

Visual style is one of the few output parameters the creator controls.

| Style | Description |
|-------|-------------|
| Watercolor (default) | Warm light, soft edges, emotional expressiveness |
| Manga / Ink | Bold lines, high contrast, graphic energy |
| Flat Illustration | Clean, modern, geometric warmth |
| Ink Sketch | Loose, gestural, hand-drawn feeling |

### Style Locking

Once a style is chosen, a style prompt is locked for that story and held constant across all image generation calls. Same character design, same palette, same world across every chapter.

### Development Approach

Visuals are architecturally present from day one — schema includes image_prompt and image_url fields per chapter, the style locking concept is built in. However, **image generation is stubbed with placeholders during early development**. Image prompts are always generated by the story engine. Actual rendering is wired in once the story engine and reading experience are stable.

---

## The Reading Experience

The app is the storyteller, not just the display surface.

- Stories are revealed in paced chapters — not all at once
- Each chapter transition is a deliberate moment, not a page turn
- Framer Motion animations (600–1200ms transitions)
- Visuals appear at the right moment within each chapter
- Dark, warm, editorial aesthetic
- Mobile-first but beautiful on desktop
- Maximum content width of 720px
- No navigation chrome, no account prompts in the reader view

---

## Sharing

- Creator shares via link to the in-app reading experience
- Recipient receives a clean, uncluttered reading view with no creator controls visible
- Share link is server-side rendered for fast load and Open Graph metadata (rich previews in Slack, email, etc.)
- Invalid or deactivated share links show a non-specific "unavailable" message (no information leakage)
- Recipient involvement (answering questions that personalize the story further) is deferred to v2, but the schema anticipates it

---

## PDF Export

Export is a **primary delivery mode**, not an afterthought.

- A4 page dimensions with 20mm+ margins
- Designed booklet aesthetic — someone could print this and leave it on a desk
- Serif/editorial typeface consistent with in-app reading experience
- Light background with dark text (optimized for print, independent of dark in-app theme)
- Each chapter starts on a new page
- Story title on the first page as a cover
- Includes images when visuals are enabled and available

---

## Story Management

- Dashboard showing all creator's stories sorted by last updated
- Story card: title, topic, dates, status, share status
- Empty state with prompt to create first story
- Delete with confirmation
- Access to refinement, sharing, and export from story detail

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 |
| Backend / Auth / DB / Storage | Supabase |
| AI Engine | Anthropic Claude (claude-sonnet-4-5) via streaming API routes |
| Animations | Framer Motion |
| Image Generation | Stubbed in v1 (Replicate or OpenAI when wired) |
| PDF Export | Print-optimized HTML (Puppeteer for production) |
| Hosting | Vercel |
| Auth Middleware | Next.js proxy (route protection) |
| Test Runner | Vitest |
| E2E | Playwright |

---

## Database Schema

### stories

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| user_id | UUID | FK to auth.users |
| title | TEXT | Generated or creator-named |
| topic | TEXT | Raw topic input |
| status | TEXT | intake, generating, complete, error |
| source_document_url | TEXT | Nullable; storage URL |
| source_document_type | TEXT | pdf, pptx, docx |
| intake_transcript | JSONB | Full conversation |
| intake_signals | JSONB | Structured signals |
| framework_selected | TEXT[] | Engine's chosen approach (internal) |
| story_content | JSONB | Chapters array [{title, body, image_prompt, image_url}] |
| previous_versions | JSONB | Version history for revert |
| visual_style | TEXT | watercolor, manga, flat, ink_sketch |
| style_prompt | TEXT | Locked image style prompt |
| visuals_enabled | BOOLEAN | Creator choice |
| share_token | UUID | Unique, auto-generated |
| share_active | BOOLEAN | Default false |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | Auto-updated |

### user_profiles

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| user_id | UUID | Unique FK to auth.users |
| display_name | TEXT | |
| created_at | TIMESTAMPTZ | |

---

## What Is Decided — Do Not Reopen

- The app name is Waggle Dance.
- The intake is a conversational AI interview, not a form.
- The storytelling framework is invisible to the user — always.
- The engine selects from a rich repository of approaches based on intake signals.
- Minimum viable intake is topic + desired shift — everything else can be inferred.
- Document upload (PDF, PPTX, DOCX) is supported in v1 as an optional intake affordance.
- When a document is present, the interview compresses topic/tension gathering and focuses on the human layer.
- In-app paced reading experience and export are both primary — not a hierarchy.
- Recipient involvement is v2 — but schema anticipates it.
- Visual style is a creator choice — watercolor is default, not the only option.
- Visual style is locked per story for consistency across all chapters.
- Visuals are architecturally present from day one but stubbed during early development.
- Creator can choose to include or exclude visuals before sharing.
- Protagonist type is an engine decision — can be human, animal, object, or abstract force.
- Stack: Next.js + TypeScript, Supabase, Vercel, Anthropic API.
- Dark, warm, editorial aesthetic — not a SaaS dashboard.
- Mobile-first.
- The Waggle Dance metaphor should be treated as signal, direction, and shared understanding — not as a cute thematic layer.

---

## What Is Open — Co-Created During Build

- Exact system prompts for intake and story engine (drafted, iterating)
- Image generation integration specifics (deferred until engine is stable)
- Full PDF generation (HTML template done, Puppeteer wiring for production)
- Onboarding experience for new creators
- Whether the Waggle Dance metaphor appears anywhere in product UI
- The product shorthand used in UX copy

---

## What This Is Not

- Not a children's-parable generator — the engine can use fable-like warmth when appropriate, but also brisk graphic energy, allegory, cautionary weight, or oral-tradition simplicity. It matches mode to situation.
- Not an education platform in the instructional sense — but the story absolutely educates. The difference is the path: feeling and metaphor precede explanation, always.
- Not a content marketing tool
- Not a children's book generator
- Not a template filler
- Not a chatbot
- Not a SaaS dashboard with charts and tables
- Not a product where the AI frameworks are visible or selectable by the user
- Not a bee-themed novelty experience
- Not a whimsical mascot product
- Not a place where the brand metaphor overwhelms the seriousness of the communication challenge
- Not a product that defaults to a juvenile, whimsical, or one-note tone

---

## Success Criteria

A story succeeds when the reader finishes it in ~5 minutes at their desktop, feels emotionally motivated to act (the elephant moves), gains rational clarity (the rider follows), and immediately wants to meet with the creator or share the story with others.
