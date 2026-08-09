# DESIGN_PRINCIPLES.md — trix-icons

## Visual Language

trix-icons is a developer tool. Its visual language should reflect this: precise, clear, purposeful.

The five values in order of priority:

```
1. Clarity
2. Meaning
3. Restraint
4. Motion
5. Consistency
```

Clarity comes first because an icon that isn't immediately recognizable fails at its job, regardless of how elegant the animation is.

Meaning comes second because icons communicate. The shape communicates the concept. The motion amplifies that communication.

Restraint comes third because icons are not the subject of an interface — they support the interface. They should never compete for attention.

Motion comes fourth — not last, but not first. Motion without meaning is decoration. Motion with meaning is communication.

Consistency comes fifth because it governs the system, not the individual. Icons should feel like they belong to the same family without animating identically.

---

## Icon Geometry

### Grid

All icons are designed on a 24×24 viewBox with a content area of 20×20 (2px padding on each side).

Exceptions must be documented in `meta.json`.

### Stroke

The default stroke width is 2px. Components accept a `strokeWidth` prop.

Stroke-based icons are preferred for UI icons because:
- They scale more gracefully
- They respect `currentColor` naturally
- They animate cleanly with `pathLength`
- They remain readable at smaller sizes

Brand icons may use fills where the original mark requires it.

### Optical balance

Geometric balance is not always optical balance. Icons should appear balanced to the human eye, which sometimes means slight asymmetry in measured terms.

Do not center every icon element mathematically. Verify it visually.

### Caps and joins

Use `stroke-linecap="round"` and `stroke-linejoin="round"` for UI icons.

This creates a softer, modern feel. Square caps are used only when the geometry explicitly requires it.

---

## Color

Icons use `currentColor` for strokes and fills. They inherit color from their parent.

The library does not define a color palette for icons. Color is the consuming developer's concern.

### Exceptions

Brand icons may have branded color variants. When provided, they are additional props (`variant="color"`) and not the default. The default remains `currentColor`.

---

## Size

The `size` prop accepts a number (px) or a CSS string. Default is 24.

The icon must be readable at:
- 16px (compact interfaces, dense lists)
- 20px
- 24px (standard)
- 32px
- 48px (illustration/marketing use)

Do not create icons that only work at one size.

---

## Spacing and Layout

Icons do not control their own margin or padding.

The consuming component handles layout. The icon renders its SVG inside a fixed size container.

---

## Animation as Identity

The animation style is part of the library's identity.

This does not mean every icon animates identically.

It means the collection of animations should feel like they were made by the same designer, with the same values:

- Considered, not frantic
- Communicative, not decorative
- Responsive to interaction, not playing on a timer
- Confident at small sizes

If an animation would embarrass a professional designer, it does not belong here.

---

## Typography (for the website)

The documentation website uses a single typeface family for all UI text.

Hierarchy through weight and size, not multiple typefaces.

The icons themselves contain no text.

---

## What the Website Should Not Look Like

The documentation website is a developer tool, not a SaaS landing page.

Specifically, do not:

- Use a giant gradient hero section with glowing background
- Use floating blobs or bokeh effects
- Use excessive glass cards for navigation
- Use "Bring your UI to life" or similar copy
- Put the icon library's animation on the website's own UI elements (they compete with the icons)
- Use heavy decorative typography for section headers

The icons are the content. The website exists to show them clearly and make them easy to install.

---

## What the Website Should Look Like

- Dense, information-rich icon grid
- Clear typography (probably Inter or similar)
- Simple dark mode that doesn't compete with icon rendering
- Icon previews on a neutral background
- Direct installation commands
- Source code readable without login
- Fast

The benchmark is not a design portfolio. The benchmark is: does a developer find what they need quickly?

---

## Interaction States for Icons

Icons in different semantic contexts have different expected states:

| Context | Expected states |
|---------|----------------|
| Standalone decorative | default, (reduced-motion default) |
| Standalone informative | default, (reduced-motion default) |
| Interactive (button) | default, hover, focus, active, disabled |
| Status indicator | default, error, success, loading |

The icon component handles animation states. The consuming component handles semantic states (disabled, error, etc.).

Do not build semantic state management (loading, error, success) into the icon component unless the icon is semantically a status indicator.

---

## Accessibility Principles

Icons should never make accessibility worse.

Rules:

1. Do not add `aria-label` to SVG elements blindly. The consuming component provides semantic context.
2. When an icon is the only content in a button, the button needs a label. The icon does not.
3. Decorative icons should have `aria-hidden="true"`.
4. Informative icons used standalone need `role="img"` and a `title` element.
5. The component accepts an `aria-label` prop for the standalone informative case.
6. Motion must respect `prefers-reduced-motion`. See ANIMATION_GUIDELINES.md.

The default rendered by the component should be `aria-hidden="true"`. The consuming developer opts into accessibility labels for their use case.

---

## Naming

### Icon names

Icon names are lowercase, hyphenated, descriptive of the concept, not the shape.

- `download` not `arrow-down-line`
- `mail` not `envelope`
- `settings` not `gear`
- `trash` not `bin`

For brand icons: use the brand's common developer name.

- `github` not `github-mark`
- `leetcode` not `leet-code`

### Component names

PascalCase, suffixed with `Icon`.

- `DownloadIcon`
- `MailIcon`
- `GithubIcon`

### File names

Match the component name.

- `DownloadIcon.tsx`
- `MailIcon.tsx`
- `GithubIcon.tsx`

---

## What Consistency Means

Consistent:
- All components implement the same `AnimatedIconProps` interface
- All components accept and respect `prefers-reduced-motion`
- All components render at the correct `size`
- All icons share the same grid (24×24 viewBox)
- All UI icons use the same stroke conventions

Not consistent (and should not be):
- Duration (different icons have different natural timing)
- Easing (different icons have different physical character)
- Animation choreography (each icon animates according to its meaning)

Do not enforce choreography consistency. Enforce API and rendering consistency.
