# ANIMATION_GUIDELINES.md — trix-icons

## The Guiding Principle

> Motion should reinforce meaning.

An animation is correct when it communicates the icon's purpose more clearly.
An animation is wrong when it is present merely because animation is technically possible.

Every animation decision starts with the question:

> What does the geometry of this icon tell us about how it should move?

---

## Motion Vocabulary

trix-icons uses a small, deliberate set of motion primitives:

| Primitive | When to use |
|-----------|-------------|
| **Path drawing** (stroke `pathLength`) | Icons where a stroke completing communicates action (check, search arc) |
| **Directional translate** | Icons where direction communicates meaning (download → down, upload → up) |
| **Rotation** | Icons with rotational semantics (refresh, spinner, gear) |
| **Structural transform** | Icons that change state (menu → close, play → pause) |
| **Physical swing** | Icons that mimic physical objects (bell, pendulum) |
| **Scale** | Used sparingly, only when size change communicates meaning (copy → layered duplication) |
| **Opacity** | Supporting transitions; not a standalone animation |
| **Morph** (path interpolation) | Reserved for semantic state changes; use with restraint |

### What is not in the vocabulary

- Arbitrary bounce on every icon
- scale(1 → 1.1) + slight rotate applied uniformly
- translateY(-2px) + shadow elevation on hover
- Generic spring on every interaction

These are decoration, not animation. They make every icon feel the same.

---

## Duration Guidance

Do not use a single duration for all icons. Duration should feel natural for the motion being described.

**Categories:**

| Category | Range | Examples |
|----------|-------|---------|
| Instant feedback | 80–120ms | State indicator changes |
| Quick action | 150–250ms | Simple direction/draw |
| Standard | 250–400ms | Most interactive hover animations |
| Deliberate | 400–600ms | Structural transformations (menu → close) |
| Emphasis | 600–900ms | Physical simulations (bell swing) |

**Rules:**

- Do not use duration < 80ms. The human eye cannot process it.
- Do not use duration > 1000ms for a hover-triggered animation. It will feel broken.
- Sequences within a single icon may sum to longer durations, but individual steps should remain perceptible.

---

## Easing Guidance

| Easing | Use | Avoid |
|--------|-----|-------|
| `easeOut` | Most interactive animations. Fast start, gentle arrival. | —  |
| `easeInOut` | Structural transformations. Smooth in both directions. | Hover animations (too slow to start) |
| `spring` | Physical simulations (bell swing, bounce back). Characterize with real mass/stiffness values. | Applying to all icons indiscriminately |
| `linear` | Continuous rotation (spinner). Nothing else. | — |
| `easeIn` | Exit animations (element leaving). | Entry animations (feels slow to start) |

**Rule:** If you reach for `spring()` with default parameters, stop. Default springs look similar on everything. If `spring` is correct for an icon, configure it explicitly for that icon's physical context.

---

## Transform Rules

- Prefer transforms (`translate`, `rotate`, `scale`) over layout-affecting properties.
- Animate `transform-origin` deliberately. A rotation that pivots from the wrong point is wrong.
- Do not animate `width`, `height`, `margin`, or `padding` in SVG animations.
- For stroke animations, use `pathLength` (0 → 1) via `motion.path`, not manual `strokeDashoffset`.

---

## Stroke Animation Rules

Stroke animations are one of the primary techniques in this library.

```tsx
// Correct pattern for stroke-drawing animation
<motion.path
  d="..."
  strokeWidth={strokeWidth}
  stroke={color}
  fill="none"
  initial={{ pathLength: 0 }}
  animate={{ pathLength: 1 }}
  transition={{ duration: 0.3, ease: "easeOut" }}
/>
```

Rules:
- Use `pathLength` not `strokeDashoffset`.
- Set `fill="none"` explicitly on animated paths unless the fill itself animates.
- The starting state (pathLength: 0) must be visually meaningful, not just an animation artifact.

---

## Opacity Rules

- Opacity is a supporting tool, not a primary animation.
- Acceptable: fading in a secondary element that appears mid-animation.
- Not acceptable: `opacity: 0 → 1` as the entire animation for a non-decorative icon.
- An icon that simply fades in has no motion derived from its meaning.

---

## Morphing Rules

Path morphing is powerful and dangerous.

Rules:
- Only morph paths that have the same number of points and curve commands. Otherwise the morph is a distortion.
- Document explicitly why morphing was chosen over a structural transform + opacity approach.
- Test the morph at 16px. If it becomes unreadable, choose a different approach.
- Morphing is not a default. It is an exception for specific icons (e.g., play → pause where the geometry is close).

---

## Sequencing

When an animation has multiple steps:

1. Identify the primary semantic moment (the moment the icon "completes" its action).
2. Other elements should support this moment, not compete with it.
3. Stagger supporting elements only if they have distinct semantic meaning.
4. Maximum two or three sequential steps for a hover animation.

**Anti-pattern:** Five elements animating in sequence with no semantic reason for the order. This is complexity for visual richness, not meaning.

---

## Interruption Behavior

Every animation must define what happens if the trigger is removed mid-animation.

Default behavior (unless the icon's design requires otherwise):
- If the trigger ends mid-animation, the animation reverses to the initial state.
- The reverse should feel natural — typically the same easing and a proportional duration.

For structural transforms (menu → close):
- If a toggle, the animation continues to completion before allowing reversal.
- This prevents a half-transformed icon state.

---

## Reset Behavior

The `resetAnimation()` method on `AnimatedIconHandle` must:
- Return the icon to its visual state at `trigger="none"`.
- Do so immediately (no transition), unless a gentle reset is semantically correct for the icon.
- Not leave any intermediate animation state visible.

---

## Hover Behavior

Hover animations must:
- Trigger on `mouseenter`
- Begin resetting on `mouseleave` (not on a timer)
- Complete their cycle in a perceptible but not attention-demanding duration (150–400ms typical)
- Not loop while hovered unless the icon is semantically a loader or progress indicator

---

## Focus Behavior

Focus animations serve an accessibility purpose: indicating keyboard navigation state.

Rules:
- Focus animation may be subtler than hover animation
- It must not be absent entirely (use CSS `outline` or an SVG-based focus indicator)
- The focus indicator must meet WCAG 2.1 contrast requirements
- Do not make the focus animation identical to hover — they serve different purposes

---

## Press Behavior

Press (click/tap) animations are brief and confirmatory.

Rules:
- Duration: 80–150ms for the press, 100–200ms for the release
- Direction: typically a small scale down (0.92–0.96) or a directional "push"
- The press animation must not interfere with the icon's hover state

---

## Manual Control

When `trigger="manual"`, the animation does not respond to interaction.
It is controlled exclusively via the `AnimatedIconHandle` ref:

```tsx
const ref = useRef<AnimatedIconHandle>(null);

ref.current?.startAnimation();
ref.current?.stopAnimation();
ref.current?.resetAnimation();
```

An icon with `trigger="manual"` must be in its default (initial) visual state until `startAnimation()` is called.

---

## Reduced Motion

This is not optional.

Every icon must respond to `prefers-reduced-motion: reduce`.

**Preferred approach:** The component detects the media query and removes or minimizes motion.

```tsx
const prefersReducedMotion = useReducedMotion(); // from motion/react
```

**What "reduced motion" means for this library:**

- Animations that communicate state transitions: reduce to an instant opacity change or no animation at all.
- Animations that are purely decorative: remove entirely.
- Animations that are the icon's primary semantic signal (e.g., a spinner): keep with reduced speed.

Do not fake reduced motion compliance by making the animation "a little slower." Reduced motion means users with vestibular disorders are harmed by motion. Take it seriously.

---

## Touch Behavior

Touch devices do not have hover. Design for this.

Rules:
- Hover-only animations must degrade gracefully on touch (typically, no animation on touch devices unless the user taps)
- Press animations remain valid on touch
- The `trigger="hover"` behavior on a touch device defaults to `trigger="press"` behavior unless the component explicitly handles it differently

---

## What This Library Is Not Trying to Do

- Compete on "most complex animation"
- Demonstrate every motion technique
- Apply the same animation to every icon
- Achieve a looping screen-saver feel
- Look like a design portfolio piece

The goal is: a developer uses an icon in their product. The icon feels right. The motion makes the interface better.

---

## Animation Review Checklist

Before marking an animation complete:

- [ ] The animation derives from the icon's meaning, not from aesthetic preference
- [ ] The duration feels natural for the motion (not too fast, not too slow)
- [ ] The easing matches the physical character of the motion
- [ ] `prefers-reduced-motion` is handled
- [ ] The animation resets correctly on `mouseleave` / `trigger` removal
- [ ] `resetAnimation()` returns to the initial state cleanly
- [ ] The icon is readable mid-animation at 16px
- [ ] The animation does not loop unless semantically required
- [ ] No intermediate state is visually stuck
