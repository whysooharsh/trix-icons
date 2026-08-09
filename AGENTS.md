# AGENTS.md — Instructions for AI Agents Working in This Repository

> This file is the primary instruction source for any AI coding agent operating in the trix-icons repository.
> Read it completely before taking any action.

---

## What This Project Is

trix-icons is an animated icon and component library built on a source-distribution model.

Developers install individual icon components directly into their projects using a CLI.
They receive ownership and control of the installed source code.
They can inspect, modify, restyle, and extend each icon without forking a library.

The two icon categories are:

1. **UI icons** — original artwork created for this project (actions, navigation, communication, system, media)
2. **Brand icons** — animated treatments of third-party logos (e.g., GitHub, LeetCode)

Brand icons involve trademarks the project does not own. See PROVENANCE.md before touching them.

---

## What This Project Is Not

- A Lucide clone
- An icon-count competition
- A generic animation library
- A SaaS landing page generator
- A design system
- A Lottie/JSON animation player
- A hosted service

---

## Decision Hierarchy

When you are uncertain about an implementation decision, use this hierarchy in order:

1. **Existing repository code and conventions** — the strongest signal
2. **ARCHITECTURE.md** — the documented structural decisions
3. **DESIGN_PRINCIPLES.md, ANIMATION_GUIDELINES.md, ICON_AUTHORING.md** — design rules
4. **PROVENANCE.md** — for any asset with licensing or trademark concerns
5. **QUALITY_GATES.md** — for validation and testing requirements
6. **Reasonable engineering judgment** with documentation of the decision
7. **Ask for clarification** — only when the decision materially affects architecture or provenance

Do not guess. Do not invent. If you cannot determine the correct answer from the above sources, document the question and stop.

**Never invent an architectural decision when existing project context can answer it.**

**Never silently replace an existing design decision merely because a generated alternative appears cleaner.**

---

## Agent Lifecycle

Do not jump from request → code.

```
UNDERSTAND  → read the relevant files, understand the current state
INVESTIGATE → identify affected files, APIs, constraints, potential regressions
PLAN        → describe what you will change and why, before changing it
IMPLEMENT   → make the smallest appropriate change
REVIEW      → re-read the diff you produced; check for regressions
TEST        → run the relevant checks; do not skip them
VERIFY      → confirm the change behaves as described
DOCUMENT    → update relevant docs if behavior changed
```

---

## Before Modifying Any Existing System

1. Read the relevant source files.
2. Understand the current behavior.
3. Identify what the change affects.
4. Identify potential regressions.
5. Make the smallest appropriate change.
6. Test it.
7. Review the output.

Do not rewrite working code merely because a generated alternative is more stylistically familiar to you.

---

## Architecture Rules

- `packages/core` contains shared types, contracts, and utilities. No icon implementations.
- `packages/icons` contains the icon component implementations.
- `packages/registry` contains registry schema and generation logic.
- `apps/web` is the documentation and browsing website. It consumes the registry; it is not the source.
- `apps/cli` is the installation CLI. It reads the registry; it does not maintain its own icon list.
- `icons/` contains SVG source files and metadata JSON files. This is the canonical source for all icons.
- `registry/icons.json` is generated from `icons/`. Do not edit it manually.

The dependency direction is:

```
icons/ (source)
    ↓
registry/ (generated)
    ↓
packages/icons (components)
    ↓
apps/web + apps/cli (consumers)
```

Do not create circular dependencies. Do not make apps/ the source of truth for anything.

---

## Icon Rules

Every icon must have:
- A source SVG file in `icons/<category>/<name>/`
- A `meta.json` file in the same directory
- A component implementation in `packages/icons/src/<category>/`
- A registry entry (generated, not hand-written)

Before adding an icon, answer the questions in ICON_AUTHORING.md.
If any answer is missing, the icon is not ready.

---

## Animation Rules

Read ANIMATION_GUIDELINES.md before implementing any animation.

The rules that must never be violated:

1. Every animation must derive from the meaning and geometry of the icon. Motion for motion's sake is rejected.
2. Every animated icon must respect `prefers-reduced-motion`. There are no exceptions.
3. The animation engine is `motion/react`. Do not introduce a second animation library.
4. Do not create continuous/looping animations unless the icon semantically requires it (e.g., a spinner).
5. Reject: scale(1→1.1) + rotate(5deg) + spring() applied universally. This is not animation; it is decoration.

---

## Provenance Rules

Read PROVENANCE.md before touching any brand icon.

Critical rules:

- Never state that a third-party logo is "free to use" without verified license information.
- Never set `license: "MIT"` or similar on a brand icon unless you have verified the source.
- If license is unknown, set `license: "unknown"` and flag for human review.
- Do not delete or modify provenance metadata without human review.
- Do not create brand icons that reproduce trademark marks without documenting the source.

---

## What Requires Human Review

The following must never be done autonomously. Stop and flag for human review:

- Setting or changing the license field on brand icons
- Removing a provenance record
- Adding a new brand icon without a documented source
- Making a claim about trademark permissions
- Changing the public component API contract (AnimatedIconProps, AnimatedIconHandle)
- Changing the registry schema
- Adding a new npm dependency to any public-facing package
- Changing the CLI's installation behavior (overwrite, idempotency, conflict handling)
- Releasing a new version

---

## What Must Not Be Generated Without Review

- Large batches of icons without individual design justification
- Generic animations applied uniformly across multiple icons
- Documentation containing claims about performance, bundle size, or adoption without measurement
- Marketing copy (see NO_AI_SLOP section below)
- Fake API implementations (CLI that prints "installed" without installing)
- Placeholder metadata presented as complete

---

## Error Handling Rules

Do not swallow errors.

```ts
// WRONG — do not do this
try {
  doSomething();
} catch {
  // ignore
}

// RIGHT — handle specifically or let it propagate
try {
  doSomething();
} catch (error) {
  if (error instanceof KnownErrorType) {
    throw new UserFacingError(`Specific message: ${error.message}`);
  }
  throw error; // unexpected errors must remain visible
}
```

Error messages must include:
1. What went wrong
2. Why it went wrong
3. What to do next

---

## No-Slop Rules

Do not generate:

- Unnecessary abstractions (generic icon factory, generic animation factory, plugin buses)
- Excessive comments that restate what the code does
- Duplicate logic across files
- Silent error swallowing
- Magic numbers without names
- Fake implementations that appear to work but don't
- "Future-proofing" without a concrete current requirement
- Speculative architecture
- Generic marketing copy
- Copied patterns from other libraries without documented reason

If a simple solution is sufficient, use the simple solution.

---

## Testing Requirements

Before submitting any icon implementation:

1. TypeScript compiles without errors (`typecheck`)
2. The component renders without throwing
3. The animation starts on trigger
4. The animation resets correctly
5. `prefers-reduced-motion` is handled
6. The icon is readable at 16px and 24px
7. The registry entry exists

See QUALITY_GATES.md for the full validation checklist.

---

## Dependency Policy

Before adding any dependency:

1. State what problem it solves
2. State which components need it
3. State what it adds to install/bundle size
4. State whether it could be implemented simply instead
5. State whether it affects CLI installation behavior

Do not add a dependency for a single icon's convenience.

---

## How to Handle Uncertainty

If you are uncertain whether a decision is safe:

1. Check the existing code first.
2. Check the relevant documentation files.
3. If still uncertain, make the most conservative change possible.
4. Document the uncertainty inline.
5. Flag it for human review.

Do not guess and proceed as if correct.
