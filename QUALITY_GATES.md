# QUALITY_GATES.md — trix-icons

## Purpose

This document defines the conditions an icon must meet before it can be marked `"status": "stable"` and included in the public registry.

These are gates, not guidelines. An icon that does not pass every applicable gate is not ready.

---

## Gate 1: Type Safety

**Command:** `npm run typecheck`

### Requirements

- The component compiles without TypeScript errors
- `AnimatedIconProps` is fully implemented (no missing required props)
- `AnimatedIconHandle` is exposed via `forwardRef` with all three methods
- No `any` types in the component's public interface
- Props that accept only specific values are typed as union types, not `string`

### Failure means

The component is rejected until it compiles cleanly.

---

## Gate 2: SVG Validity

**Command:** `npm run icons:validate`

### Requirements

- `icons/<category>/<name>/icon.svg` exists
- The SVG has a `viewBox="0 0 24 24"` attribute (or deviation is documented)
- No `width` or `height` attributes on the root `<svg>`
- No hardcoded color values (no `#000`, `#ffffff`, `black`, `white`) — must use `currentColor`
- Paths are valid (no malformed `d` attributes)
- No empty `<g>` groups
- No inline `style` attributes

### Failure means

The SVG source is corrected before the icon is registered.

---

## Gate 3: Metadata Completeness

**Command:** `npm run icons:validate`

### Requirements

All fields in the `meta.json` schema are present.

Required fields:

| Field | Requirement |
|-------|------------|
| `name` | Non-empty string, matches directory name |
| `slug` | Non-empty, lowercase, hyphenated, unique in registry |
| `category` | One of the defined categories |
| `description` | Non-empty, describes the icon's meaning (not just its shape) |
| `keywords` | Array with at least 2 entries |
| `version` | Valid semver |
| `provenance.source` | One of: "original", "modified-third-party", "third-party" |
| `provenance.license` | Valid SPDX identifier or "unknown" |
| `provenance.trademark` | Boolean |
| `animation.technique` | Non-empty string |
| `animation.description` | Non-empty string |
| `animation.reducedMotion` | One of: "static", "minimal", "essential" |
| `accessibility.defaultLabel` | Non-empty string |
| `status` | One of: "stable", "experimental", "deprecated" |

### Failure means

The metadata is completed before the icon is registered.

---

## Gate 4: Provenance Resolution

**Automatic check:** `npm run registry:build`

### Requirements

- `status: "stable"` is only permitted when `provenance.reviewRequired` is not `true`
- Brand icons (`provenance.trademark: true`) must have `trademarkOwner` set
- `license: "unknown"` prevents `status: "stable"`
- If `provenance.source` is `"modified-third-party"`, `originalSource` and `originalLicense` must be present

### Failure means

The icon stays `"status": "experimental"` until a human resolves the provenance. No automated process may resolve it.

---

## Gate 5: Component Behavior

**Automated where possible; manual verification required**

### Requirements

**Rendering:**
- The component renders without throwing
- It renders correctly in a React 18 tree
- It applies the `size` prop correctly
- It applies the `color` prop (via `currentColor` or directly)
- It applies the `strokeWidth` prop (for stroke-based icons)
- It applies `className` without overriding required internal styles

**Animation:**
- `trigger="hover"` starts the animation on `mouseenter`
- `trigger="hover"` reverses the animation on `mouseleave`
- `trigger="focus"` starts the animation on `focus`
- `trigger="press"` starts the animation on `mousedown`/`pointerdown`
- `trigger="none"` renders in the initial state with no animation
- `trigger="manual"` does nothing until the ref is used

**Imperative API:**
- `ref.current.startAnimation()` starts the animation
- `ref.current.stopAnimation()` stops the animation at its current frame
- `ref.current.resetAnimation()` returns to the initial visual state

**Reduced motion:**
- When `prefers-reduced-motion: reduce` is active, the animation is suppressed or minimized as declared in `meta.json`
- The icon's static state is still visually correct under reduced motion

**Error states:**
- Invalid `size` values do not crash the component (but may log a warning)
- `disabled={true}` renders the icon without triggering animations

### Failure means

The component behavior is corrected before the icon is registered.

---

## Gate 6: Visual QA

**Manual verification — cannot be automated**

Test the icon in the dev environment at the following sizes:

| Size | Pass |
|------|------|
| 16px | Icon is recognizable |
| 20px | Icon is recognizable |
| 24px | Icon is correct at default size |
| 32px | Icon looks correct at larger size |
| 48px | Icon looks correct at illustration size |

For each size, verify:

- [ ] The icon silhouette is correct
- [ ] Stroke widths are appropriate (not too thin, not too heavy)
- [ ] No elements are clipped
- [ ] Elements are optically balanced
- [ ] The animation plays as described in `meta.json`
- [ ] The animation resets correctly
- [ ] Reduced motion suppresses or minimizes the animation

For brand icons, additionally verify:

- [ ] The geometry matches the official brand mark
- [ ] The animation does not distort the mark
- [ ] The mark is recognizable during the animation

### Failure means

The animation or geometry is revised.

---

## Gate 7: Registry Integration

**Command:** `npm run registry:build && npm run registry:validate`

### Requirements

- The icon appears in `registry/icons.json`
- The `slug` is unique
- The referenced `files.component` path resolves to an existing file
- The referenced `files.svg` path resolves to an existing file
- No duplicate slugs exist

### Failure means

The registry build reports the specific error. Fix it before proceeding.

---

## Gate 8: Regression Check

When a new icon is added, the existing icons must not be affected.

**Command:** `npm run typecheck && npm run test`

### Requirements

- All existing components still compile
- All existing tests still pass
- The registry build still succeeds

If a new icon requires changes to `packages/core` types:

1. Document the change
2. Verify backward compatibility
3. Get human review before merging

---

## Summary Table

| Gate | Command | Manual? |
|------|---------|---------|
| Type safety | `npm run typecheck` | No |
| SVG validity | `npm run icons:validate` | No |
| Metadata completeness | `npm run icons:validate` | No |
| Provenance resolution | `npm run registry:build` | Human required |
| Component behavior | `npm run test` + manual | Partially |
| Visual QA | Dev environment | Yes |
| Registry integration | `npm run registry:validate` | No |
| Regression check | `npm run typecheck && npm run test` | No |

---

## Who May Mark an Icon as Stable

Only a human may change `"status"` from `"experimental"` to `"stable"`.

An AI agent may propose the change and run all automated gates, but must not set the status without human confirmation.

This exists because visual QA and provenance review cannot be fully automated.
