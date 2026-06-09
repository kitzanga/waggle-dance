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

## Color Tokens

Inspired by Apple's neutral-cool dark mode with warm accent.

```
/* Backgrounds — layered depth system */
--color-bg-base: #000000;           /* True black canvas, like Apple TV */
--color-bg-primary: #0d0d0d;        /* Main content area */
--color-bg-secondary: #1a1a1c;      /* Sidebar, elevated panels */
--color-bg-tertiary: #2c2c2e;       /* Cards, hover states */
--color-bg-elevated: #3a3a3c;       /* Modals, popovers, active states */

/* Text — hierarchy through opacity and weight */
--color-text-primary: #f5f5f7;      /* Headlines, body copy */
--color-text-secondary: #a1a1a6;    /* Descriptions, metadata */
--color-text-tertiary: #636366;     /* Placeholders, disabled */
--color-text-quaternary: #48484a;   /* Extremely subtle labels */

/* Accent — warm amber, used sparingly */
--color-accent: #ff9f0a;            /* Primary actions, active indicators */
--color-accent-hover: #ffb340;      /* Hover state */
--color-accent-subtle: rgba(255, 159, 10, 0.12);  /* Background tint */

/* Semantic */
--color-error: #ff453a;
--color-success: #30d158;
--color-warning: #ffd60a;

/* Borders and separators */
--color-separator: rgba(255, 255, 255, 0.08);
--color-separator-opaque: #38383a;

/* Vibrancy / blur backgrounds */
--color-vibrancy: rgba(30, 30, 32, 0.72);
```

## Typography

System font stack matching Apple's SF Pro aesthetic. Serif for reading/editorial content.

```
--font-system: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, sans-serif;
--font-reading: 'New York', 'Iowan Old Style', Georgia, serif;
--font-mono: 'SF Mono', 'Fira Code', monospace;

/* Scale — Apple-like sizing */
--text-xs: 11px;        /* Metadata, timestamps */
--text-sm: 13px;        /* Secondary labels, captions */
--text-base: 15px;      /* Body, UI text */
--text-lg: 17px;        /* Emphasized body */
--text-xl: 20px;        /* Section titles */
--text-2xl: 24px;       /* Page headings */
--text-3xl: 34px;       /* Hero headings */
--text-4xl: 48px;       /* Display, landing */

/* Weight */
--font-regular: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* Line height */
--leading-tight: 1.2;
--leading-normal: 1.47;  /* Apple's standard body leading */
--leading-reading: 1.7;  /* Long-form reading */
```

## Spacing

Based on Apple's 4px grid with common intervals.

```
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
```

## Layout

```
/* Sidebar */
--sidebar-width: 240px;
--sidebar-collapsed-width: 0px;     /* Hidden on mobile */

/* Content */
--content-max-width: 720px;         /* Reading, intake conversation */
--content-wide-max-width: 1080px;   /* Dashboard grid */

/* Radius — Apple uses larger radii */
--radius-sm: 6px;
--radius-md: 10px;
--radius-lg: 14px;
--radius-xl: 20px;
--radius-full: 9999px;

/* Breakpoints */
--bp-mobile: 768px;
--bp-tablet: 1024px;
--bp-desktop: 1280px;
```

## Motion

All transitions use Apple's standard easing curves.

```
/* Duration */
--duration-fast: 150ms;
--duration-normal: 250ms;
--duration-slow: 450ms;
--duration-chapter: 800ms;          /* Chapter reveal transitions */

/* Easing — Apple's spring-like curves */
--ease-default: cubic-bezier(0.25, 0.1, 0.25, 1);
--ease-in: cubic-bezier(0.42, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.58, 1);
--ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
```

## Component Patterns

### Sidebar (Apple Music / Photos style)

- Fixed left panel, 240px wide
- True black or very dark bg (`--color-bg-secondary`)
- Navigation items: 13px medium weight, 32px row height, 8px left padding with rounded selection indicator
- Active item: subtle accent background tint + accent text color
- Grouped with section headers in uppercase 11px semibold tertiary color
- Collapses to hidden on mobile with hamburger

### Cards (Dashboard)

- No visible border in default state
- Background: `--color-bg-tertiary`
- Radius: `--radius-lg` (14px)
- Padding: 16px–20px
- Hover: lighten background to `--color-bg-elevated`, subtle scale (1.01)
- Transition: `--duration-normal` with `--ease-default`

### Buttons

- Primary: Accent color background, dark text, `--radius-full` (pill shape)
- Secondary: `--color-bg-tertiary` background, primary text
- Ghost: Transparent, secondary text, hover shows tertiary background
- All buttons: min-height 34px (compact), 44px (touch), center-aligned text
- Font: `--text-base` medium weight

### Input Fields

- Background: `--color-bg-tertiary`
- Border: none (Apple style — no border, relies on background contrast)
- Radius: `--radius-md`
- Padding: 10px 14px
- Placeholder: `--color-text-tertiary`
- Focus: subtle ring with accent color at 30% opacity

### The Intake Conversation

- Single-panel centered layout (max-width 640px)
- No chat bubbles — instead, alternating blocks with subtle visual distinction
- AI responses: left-aligned, full width, `--color-text-primary`
- User responses: left-aligned, full width, slightly muted or indented
- Separator between exchanges: `--color-separator` line
- Input at bottom: large textarea, no border, just background contrast
- Feels like a focused document being written, not a chat app

### Reading Experience (Full Bleed)

- True black background (`--color-bg-base`)
- Content centered, max-width 720px
- Reading font at `--text-lg` with `--leading-reading`
- Chapter transitions: fade + subtle vertical movement
- No visible UI except a minimal "continue" prompt between chapters
- Option to toggle text-focus mode: removes images, increases font size slightly, pure reading

### Reader Text-Focus Mode

- Background shifts to `--color-bg-primary` (slightly lighter than full-bleed)
- Font size bumps to `--text-xl`
- Line length constrained to 65ch
- All images hidden
- Minimal, distraction-free typography

## Shadows and Depth

Apple uses very subtle shadows in dark mode — most depth comes from layered backgrounds.

```
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
--shadow-lg: 0 12px 40px rgba(0, 0, 0, 0.5);
--shadow-elevated: 0 20px 60px rgba(0, 0, 0, 0.6);  /* Modals */
```

## Iconography

- SF Symbols style: 1.5px stroke weight, rounded caps
- Size: 16px for inline, 20px for navigation, 24px for primary actions
- Color: inherits text color (secondary by default, primary on hover/active)

## Z-Index Scale

```
--z-sidebar: 40;
--z-header: 50;
--z-modal-backdrop: 60;
--z-modal: 70;
--z-toast: 80;
```

## Accessibility Notes

- All interactive elements minimum 44×44px touch target on mobile
- Focus indicators: 2px accent ring with 3px offset
- Contrast: meets WCAG AA (4.5:1 minimum for body text against backgrounds)
- `--color-text-primary` on `--color-bg-primary` = 15.4:1 ✓
- `--color-text-secondary` on `--color-bg-primary` = 7.2:1 ✓
- Reduced motion: respect `prefers-reduced-motion` — skip animations, use instant transitions
