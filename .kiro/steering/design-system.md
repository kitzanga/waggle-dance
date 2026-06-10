---
inclusion: auto
---

# Waggle Dance Design System

This document defines the visual language, tokens, and component patterns for Waggle Dance. The design is inspired by Apple's desktop media apps (Music, TV, Photos, Games) — immersive, content-forward, minimal chrome, smooth transitions, editorial typography.

## Design Philosophy

- **Content is the interface** — stories, conversations, and reading are the hero; UI recedes
- **Depth through layering** — surfaces stack with subtle separation, not borders
- **Motion with purpose** — transitions communicate state changes, never decorative
- **Quiet until needed** — controls appear contextually, not persistently
- **Precision over decoration** — every pixel serves function or breathing room
- **Two distinct worlds** — the intake experience is light and cognitive; the reading experience is dark and cinematic. This contrast is intentional and meaningful.

---

## Color Tokens

### Light mode — intake, library, story management

```css
--color-bg-page: #f7f6f2;           /* Warm off-white canvas */
--color-bg-card: #ffffff;           /* Card surfaces */
--color-bg-input: #ffffff;          /* Input fields — pure white */
--color-bg-bar: transparent;        /* Input bar inherits page surface */

--color-text-primary: #111111;
--color-text-secondary: rgba(0, 0, 0, 0.5);
--color-text-muted: rgba(0, 0, 0, 0.32);
--color-text-placeholder: rgba(0, 0, 0, 0.25);

--color-border-default: rgba(0, 0, 0, 0.08);
--color-border-input: rgba(0, 0, 0, 0.14);
--color-border-input-focus: rgba(0, 0, 0, 0.3);
--color-separator: rgba(0, 0, 0, 0.08);

/* Amber — darkened for WCAG AA on white */
--color-accent: #c47a00;
--color-accent-bg: rgba(180, 108, 0, 0.08);
--color-accent-border: rgba(180, 108, 0, 0.2);

--color-progress-done: rgba(180, 108, 0, 0.35);
--color-progress-active: #c47a00;
--color-progress-empty: rgba(0, 0, 0, 0.1);
```

### Dark mode — reading experience, generation transition

```css
--color-bg-base: #000000;           /* True black canvas */
--color-bg-primary: #0d0d0d;        /* Elevated surface */
--color-bg-secondary: #1a1a1c;      /* Cards, inputs */
--color-bg-tertiary: #2c2c2e;       /* Hover states */
--color-bg-elevated: #3a3a3c;       /* Modals, popovers */

--color-text-primary-dark: #f5f5f7;
--color-text-secondary-dark: rgba(255, 255, 255, 0.5);
--color-text-muted-dark: rgba(255, 255, 255, 0.32);
--color-text-placeholder-dark: rgba(255, 255, 255, 0.22);

--color-border-default-dark: rgba(255, 255, 255, 0.07);
--color-border-input-dark: rgba(255, 255, 255, 0.12);
--color-border-input-focus-dark: rgba(255, 159, 10, 0.3);
--color-separator-dark: rgba(255, 255, 255, 0.08);

/* Amber — full brightness on dark */
--color-accent-dark: #ff9f0a;
--color-accent-hover-dark: #ffb340;
--color-accent-bg-dark: rgba(255, 159, 10, 0.08);
--color-accent-border-dark: rgba(255, 159, 10, 0.2);

--color-progress-done-dark: rgba(255, 159, 10, 0.5);
--color-progress-active-dark: #ff9f0a;
--color-progress-empty-dark: rgba(255, 255, 255, 0.1);

/* Semantic */
--color-error: #ff453a;
--color-success: #30d158;
--color-warning: #ffd60a;
```

---

## Typography

```css
--font-system: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', system-ui, sans-serif;
--font-reading: 'New York', 'Iowan Old Style', Georgia, serif;
--font-mono: 'SF Mono', 'Fira Code', monospace;

/* Scale */
--text-xs: 11px;        /* Metadata, timestamps */
--text-sm: 13px;        /* Secondary labels, creator answers in intake */
--text-base: 15px;      /* Body, UI text */
--text-md: 17px;        /* Emphasized body */
--text-lg: 20px;        /* Current AI question in intake */
--text-xl: 24px;        /* Page headings, opening question */
--text-2xl: 30px;       /* Hero headings */
--text-3xl: 34px;       /* Display */
--text-4xl: 48px;       /* Landing */

/* Weight */
--font-regular: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* Line height */
--leading-tight: 1.2;
--leading-normal: 1.47;
--leading-reading: 1.7;

/* Intake question specific */
--text-question-size: 20px;
--text-question-weight: 400;
--text-question-leading: 1.45;
--text-question-tracking: -0.015em;
```

---

## Spacing

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
--space-20: 80px;

--content-max: 600px;       /* Intake conversation column */
--content-reading: 720px;   /* Story reading experience */
--content-wide: 1080px;     /* Dashboard grid */
```

---

## Layout

```css
--radius-sm: 6px;
--radius-md: 10px;
--radius-lg: 14px;
--radius-xl: 20px;
--radius-full: 9999px;

--bp-mobile: 768px;
--bp-tablet: 1024px;
--bp-desktop: 1280px;
```

---

## Motion

```css
--duration-fast: 150ms;
--duration-base: 250ms;
--duration-slow: 400ms;
--duration-chapter: 800ms;

--ease-default: cubic-bezier(0.25, 0.1, 0.25, 1);
--ease-in: cubic-bezier(0.42, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.58, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
```

---

## Navigation — Top Bar (replaces sidebar)

**The sidebar is removed entirely.** There is no collapsed sidebar, no hamburger, no drawer. Navigation is a single top bar.

```
Height: 48px
Background: inherits current screen surface — no independent background color
Border-bottom: 1px solid var(--color-border-default) on light screens
              1px solid var(--color-border-default-dark) on dark screens
Padding: 0 24px mobile / 0 40px desktop
Layout: flex, space-between, vertically centered
```

**Left:** Wordmark only — "Waggle Dance", 14px, weight 500. No logo. No icon.
- Light screens: `--color-text-primary`
- Dark screens: `--color-text-primary-dark`

**Right:** Two elements, 8px gap.
- "Library" — ghost button, 13px, no border, no background
- "+ New" — pill button, 12px, border-radius 20px, padding 4px 12px
  - Uses accent color and accent-bg/border tokens for current mode

**Sign out:** Removed from nav. Belongs in a future profile/settings menu.

**Reading experience:** No nav bar at all. Truly chrome-free.

---

## Component Patterns

### Intake Screen (light surface)

The intake screen uses the light mode tokens throughout. It is a focused single-panel conversation — not a chat app, not a form.

**Surface:** `--color-bg-page` (#f7f6f2), full viewport. No panels, no split layout.

**Opening state (no exchanges yet):**
- Question centered vertically and horizontally in the conversation area
- "What's the idea?" at `--text-xl`, weight 400, tracking -0.02em
- Subtitle at `--text-sm`, color `--color-text-muted`, margin-top 10px
- Animates out on first submission: opacity → 0, translateY → -8px, 200ms

**Exchange layout (after first submission):**

Exchanges grow upward from the input bar. Most recent AI question is always the visual hero.

Each exchange:
```
[Creator answer — muted text]
[1px hairline divider — var(--color-separator)]
[AI question — prominent text]
[24px gap]
[next exchange...]
```

Creator answer:
- `--text-sm`, color `--color-text-secondary`, line-height 1.65
- Supports multiple lines — no truncation, no max-height
- No label, no avatar, no "You:" prefix

AI question — current (most recent):
- `--text-question-size` (20px), weight `--text-question-weight` (400)
- Color `--color-text-primary`
- This is the hero element — nothing competes with it

AI question — receded (all previous):
- `--text-sm`, color `--color-text-muted`
- Animates from hero to receded when new exchange arrives: font-size 20px → 13px, color transition, 300ms ease-default

**Entrance animation for new AI question:**
1. Previous exchange recedes: question shrinks 20px → 13px, color fades to muted. 300ms.
2. New exchange enters: opacity 0 → 1, translateY 12px → 0. 350ms, 50ms delay. Use Framer Motion AnimatePresence.

**Progress indicator:**
- 4 equal pill segments above input bar
- Height 2px, border-radius 2px, gap 4px
- Max-width `--content-max`, centered, padding 0 24px
- Hidden until first exchange
- States: done / active / empty using progress color tokens
- Animates active segment on each new question

### Input Bar (light mode)

The input bar has no independent background color — it is part of the page surface. One hairline top border is the only separator.

```
Border-top: 1px solid var(--color-border-default)
Background: transparent (inherits --color-bg-page)
Padding: 12px 24px 20px
```

Inner layout (max-width `--content-max`, centered, flex row, align flex-end, gap 8px):

**Attach button:**
- 34×34px circle, no background
- Border: 0.5px solid `--color-border-input`
- Icon: paperclip, 15px, color `--color-text-muted`
- No text label — icon only
- Opens file picker: PDF, PPTX, DOCX, max 20MB

**Input field:**
- Background: `--color-bg-input` (pure white)
- Border: 0.5px solid `--color-border-input`
- Border-radius: 18px
- Padding: 9px 14px
- Auto-expanding textarea: 1 line minimum, 5 lines maximum, then internal scroll
- No fixed height
- Send on Enter. New line on Shift+Enter.
- Focus: border-color → `--color-border-input-focus`. No fill change. No amber. No glow.
- Placeholder: "Your answer…"

**Send button:**
- 34×34px circle
- Background: `--color-accent` (#c47a00 light / #ff9f0a dark)
- Icon: arrow-up, 14px, color white
- Disabled (empty input): opacity 0.35
- Active: scale(0.94), 100ms

### Reflection + Generate Trigger

After the fourth intake answer the AI surfaces a reflection — not a summary. A single short paragraph that names the shape of the challenge, not a list of what was said. Written in the AI's voice. Serif font, centered, generous leading.

Below it, a single CTA button:

**Label:** "Find the story"
**Style:** Primary pill button, accent background, full-width on mobile, centered on desktop
**No other actions on this screen**

### Generation Waiting Screen

This is the first appearance of the dark surface — a transition from light intake to dark cinematic. Background animates from `--color-bg-page` to `--color-bg-base` (true black) over 600ms.

No spinner. No progress bar. No percentage.

A single phrase centered on screen, serif font, white, cycling through with slow crossfades (~4-5 seconds each):

1. *Mapping the gap…*
2. *Finding the tension…*
3. *Locating the metaphor…*
4. *Building the world…*
5. *Writing the story…*

Sequence does not loop. Final phrase fades out as the first chapter fades in — no intermediate "ready" state.

### Reading Experience (dark, full bleed)

- True black background (`--color-bg-base`)
- No nav bar, no chrome, no account prompts
- Content centered, max-width `--content-reading` (720px)
- Reading font (`--font-reading`) at `--text-md` (17px), `--leading-reading` (1.7)
- Chapters revealed one at a time
- Chapter transitions: fade + subtle vertical movement, `--duration-chapter` (800ms)
- Minimal "continue" prompt between chapters

**Text-focus mode toggle:**
- Background shifts to `--color-bg-primary`
- Font size → `--text-lg` (20px)
- Line length constrained to 65ch
- Images hidden
- Pure typography, no distractions

### Dashboard / Library (light surface)

- Uses light mode tokens
- Story cards on `--color-bg-card` (white) with subtle border
- Sorted by updated_at DESC
- Empty state with prompt to create first story
- Card hover: subtle background lift, scale 1.01, `--duration-base`

### Cards

- Background: `--color-bg-card`
- Border: 0.5px solid `--color-border-default`
- Border-radius: `--radius-lg` (14px)
- Padding: 16px–20px
- Hover: background lightens, scale 1.01, `--duration-base`

### Buttons

- Primary: accent background, white text, `--radius-full` (pill)
- Secondary: `--color-bg-card` background, primary text, default border
- Ghost: transparent, muted text, hover shows subtle background
- Min height: 34px compact / 44px touch targets on mobile

---

## Intake AI Behavior — Conversation Rules

These rules govern the intake system prompt. They are product requirements, not suggestions.

**One question per turn. Always.** Never compound. Never append examples. Never say "for example" inside a question.

**Maximum 20 words per response.** The question is the entire response. No preamble, no affirmation, no summary.

**Never open with an affirmation.** "Got it," "Great," "Perfect," "Interesting" — all banned. Acknowledge what was heard through how the next question is framed.

**No markdown.** No asterisks, bold, bullets. Plain prose only.

**No em dashes in AI responses.** Use a comma or full stop instead.

**The four questions in order:**
1. "What's the idea?"
2. "What do you want them to do differently after they hear it?"
3. "Who are these people — in human terms, not titles?"
4. "What's their biggest reason for tuning this out?"

After four answers the engine generates. One inference-confirm allowed if a signal is unclear. Then generate regardless.

**Tone:** A sharp colleague who asks good questions and doesn't waste your time. Not a therapist. Not a chatbot. Not a workshop facilitator.

---

## Shadows

```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
--shadow-lg: 0 12px 40px rgba(0, 0, 0, 0.12);
--shadow-elevated: 0 20px 60px rgba(0, 0, 0, 0.5);  /* Dark mode modals */
```

---

## Z-Index Scale

```css
--z-header: 50;
--z-modal-backdrop: 60;
--z-modal: 70;
--z-toast: 80;
```

---

## Accessibility

- All interactive elements minimum 44×44px touch target on mobile
- Focus indicators: 2px accent ring with 3px offset
- WCAG AA minimum: 4.5:1 body text, 3:1 large text
- `prefers-reduced-motion`: skip animations, use instant transitions
- All icon-only buttons require aria-label
- Semantic HTML throughout: headings, landmarks, associated labels
