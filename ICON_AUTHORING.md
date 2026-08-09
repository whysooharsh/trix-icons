# ICON_AUTHORING.md — trix-icons

## Purpose

This document defines the process for adding a new icon to trix-icons.

Every icon must be authored with design intent. Icons are not generated in bulk.
A small collection of excellent icons is better than a large collection of mediocre ones.

---

## Before You Begin

Read ANIMATION_GUIDELINES.md completely.
Read PROVENANCE.md if the icon involves any third-party artwork.

Do not start implementing until you can answer all questions in the Design Brief below.

---

## Icon Categories

| Category | Description | Examples |
|----------|-------------|---------|
| `actions` | Verbs — things users do | download, upload, copy, delete, refresh |
| `navigation` | Moving through space or structure | menu, close, back, arrow, chevron |
| `communication` | Information exchange | mail, bell, chat, send |
| `media` | Audio/video control | play, pause, volume, mute |
| `system` | System state and settings | settings, lock, unlock, trash, eye |
| `brands` | Third-party logo/mark with animated treatment | github, leetcode |
| `experimental` | In-development, not yet public | — |

An icon belongs in exactly one category.

---

## Directory Structure for a New Icon

```
icons/<category>/<name>/
├── icon.svg     ← canonical SVG source
└── meta.json    ← canonical metadata
```

And the React component:

```
packages/icons/src/<category>/<Name>Icon.tsx
```

### icon.svg Requirements

- ViewBox: `0 0 24 24` (standard) — document any deviation in meta.json
- Stroke-based preferred over fill-based for UI icons (enables strokeWidth prop)
- No hardcoded colors in the SVG — use `currentColor`
- No `width` or `height` attributes on the root `<svg>` element — controlled via props
- Paths cleaned and optimized (no unnecessary transforms, matrices, or redundant nodes)
- Named layers/groups removed

For brand icons: preserve the brand's geometric accuracy. Do not simplify marks that are recognizable by their specific geometry.

---

## The Design Brief

Every icon must have a completed design brief before implementation begins.
If any question cannot be answered, the icon is not ready.

---

### 1. What does this icon represent?

Be specific. Not "file" but "a file that can be downloaded." Not "settings" but "application configuration."

The answer shapes the animation.

---

### 2. What part of its geometry should move?

Identify the specific SVG element(s) that will animate. Describe their movement in plain English before writing any code.

Example (download icon):
> The arrow shaft and arrowhead translate downward. The horizontal bar at the bottom remains stationary, acting as the surface the arrow arrives at. The downward direction is the semantic signal.

---

### 3. Why does that motion communicate meaning?

This question rejects decorative animation.

The answer must connect the motion to the icon's semantic meaning. If the connection requires explanation, the animation may be wrong.

Example (download icon):
> Downloading moves data toward the user. The downward arrow physically enacts this direction. When the animation plays, the user's eye reads "moving down" and maps it to "receiving."

---

### 4. What happens on hover?

Define the exact animation:
- Which elements move
- Direction and distance
- Duration
- Easing
- Whether it loops, plays once, or holds

---

### 5. What happens on focus?

Define the keyboard-focus state:
- Is it the same as hover, or a distinct animation?
- What is the focus indicator? (SVG-based or CSS outline?)

---

### 6. What happens on touch?

Since touch devices have no hover state:
- Does the icon animate on tap?
- Does it animate on press?
- Or is it static on touch?

---

### 7. What happens with reduced motion?

Choose one:
- Static: the icon does not animate
- Minimal: a brief opacity transition communicates state without motion
- Essential motion only: the animation is semantically critical and retained, but reduced in intensity

State which choice and why.

---

### 8. Can the animation be interrupted?

If the user moves their cursor off the icon mid-animation:
- Does the animation complete, then reverse?
- Does it immediately reverse?
- Does it continue to a stable state?

---

### 9. Can it return to its initial state?

Verify that `resetAnimation()` returns the icon to its exact initial visual state.

If any element's position, opacity, or path depends on animation state, describe how reset is handled.

---

### 10. Does it remain recognizable at small sizes?

Test at 16px. Test at 20px.

If the icon loses its identity at 16px:
- Adjust the geometry (thicker strokes, simpler paths)
- OR document that 16px is not a supported size for this icon

---

### 11. Where did the base SVG come from?

Provide a specific answer. One of:

| Source type | Example |
|-------------|---------|
| Original artwork | "Drawn from scratch for trix-icons" |
| Modified open-source | "Based on Lucide's download icon (MIT License), significantly modified" |
| Third-party mark | "GitHub's official logo mark" |

"I don't know" is not acceptable. Trace it.

---

### 12. What license applies to the base artwork?

Provide a specific SPDX license identifier or "unknown."

If unknown: flag for human review. Do not publish until resolved.

For brand icons: the license applies to the animation treatment. The underlying trademark belongs to the brand owner and must be documented separately.

---

### 13. Is the mark a trademark?

For brand icons: yes. State the trademark owner and the context in which the mark is being used.

For original UI icons: no. State "original artwork."

---

## meta.json Schema

Every icon must have a `meta.json` file. The schema is defined in `packages/registry/src/schema.ts`.

### Example — Original UI Icon

```json
{
  "name": "download",
  "slug": "download",
  "category": "actions",
  "description": "Represents a file or data download action. The arrow moves downward toward a surface.",
  "keywords": ["download", "save", "export", "arrow-down", "file"],
  "version": "0.1.0",
  "provenance": {
    "source": "original",
    "license": "MIT",
    "trademark": false,
    "attribution": null,
    "notes": null
  },
  "animation": {
    "technique": "directional-translate",
    "description": "Arrow shaft and head translate downward. Base line is stationary.",
    "reducedMotion": "static"
  },
  "accessibility": {
    "defaultLabel": "Download",
    "notes": "Consuming component should provide a meaningful label for the action context."
  },
  "status": "stable"
}
```

### Example — Brand Icon

```json
{
  "name": "github",
  "slug": "github",
  "category": "brands",
  "description": "GitHub logo mark with an animated octocat treatment.",
  "keywords": ["github", "git", "version-control", "open-source"],
  "version": "0.1.0",
  "provenance": {
    "source": "third-party",
    "license": "unknown",
    "trademark": true,
    "trademarkOwner": "GitHub, Inc.",
    "trademarkContext": "Used for identification purposes only. This project has no affiliation with GitHub.",
    "attribution": "GitHub mark is a trademark of GitHub, Inc.",
    "animationAuthor": "trix-icons",
    "animationLicense": "MIT",
    "notes": "The GitHub logo guidelines must be reviewed before any redistribution. License status: pending human review.",
    "reviewRequired": true
  },
  "animation": {
    "technique": "path-drawing",
    "description": "The octocat tentacles draw in sequentially on hover.",
    "reducedMotion": "static"
  },
  "accessibility": {
    "defaultLabel": "GitHub",
    "notes": "When used as a link to a GitHub profile or repository, the parent element should provide context."
  },
  "status": "experimental"
}
```

---

## Implementation Checklist

Before marking an icon as `"status": "stable"`:

- [ ] Design brief is complete
- [ ] `icons/<category>/<name>/icon.svg` exists and meets SVG requirements
- [ ] `icons/<category>/<name>/meta.json` exists and is valid
- [ ] `packages/icons/src/<category>/<Name>Icon.tsx` implements `AnimatedIconProps`
- [ ] `AnimatedIconHandle` ref is implemented (`startAnimation`, `stopAnimation`, `resetAnimation`)
- [ ] Animation derives from the icon's meaning (see Design Brief Q2, Q3)
- [ ] `prefers-reduced-motion` is handled
- [ ] Hover behavior is correct
- [ ] Reset behavior is correct
- [ ] Icon is readable at 16px and 24px
- [ ] TypeScript compiles without errors
- [ ] Registry entry generated (run `npm run registry:build`)
- [ ] Passes `npm run icons:validate`

---

## What Does Not Qualify as a Complete Icon

- An SVG file without a `meta.json`
- A component that does not implement `AnimatedIconHandle`
- An animation that ignores `prefers-reduced-motion`
- A brand icon without a `trademarkOwner` and `reviewRequired: true`
- A component that silently fails when props are invalid
- An icon with `status: "stable"` that fails the implementation checklist
- A placeholder animation (e.g., a generic spin or bounce) standing in for a real design

---

## Style Guide for Icon SVG

### Stroke-based UI icons (preferred)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <path
    d="..."
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    fill="none"
  />
</svg>
```

### Fill-based brand icons

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <path d="..." fill="currentColor" />
</svg>
```

### What to avoid in SVG source

- `width`, `height` on the root `<svg>`
- Hardcoded color values (`#000000`, `black`)
- Unnecessary `<g>` wrapper groups
- Redundant `transform` attributes
- Inline styles
- `<title>` or `<desc>` in the source SVG (these are added at component level with the correct context)
