# ARCHITECTURE.md — trix-icons

## Project Description

trix-icons is an animated icon and component library distributed via source code rather than compiled packages.

The central developer experience is:

```bash
npx trix add github
npx trix add download upload mail
```

This copies the icon component source directly into the developer's project. They own the code and can modify it freely.

---

## Repository Assessment (Initialization)

The repository was initialized as a greenfield project (only `.git` existed).

No prior framework, build config, or component code was present. All architectural decisions in this document are made from scratch.

---

## Architecture Decision: Monorepo

**Decision: Yes, use a monorepo with npm workspaces.**

**Reasoning:**

The project has four distinct concerns that will grow independently:

1. The icon component implementations (`packages/icons`)
2. The shared contracts and types (`packages/core`)
3. The CLI tool (`apps/cli`)
4. The documentation website (`apps/web`)

These concerns share type definitions and the registry schema. A monorepo with npm workspaces enables this sharing without publishing packages prematurely. It also keeps the tooling simple — no Nx or Lerna overhead, just npm workspaces with Turbo for task orchestration.

**Why not a single package?**
The CLI and web app have meaningfully different dependency requirements. Mixing them in a single package would create unnecessary coupling. The CLI should be installable as a standalone binary without dragging in React and animation dependencies.

**Why npm workspaces over pnpm?**
npm workspaces are sufficient for this size. If the project grows substantially, migrating to pnpm workspaces is straightforward.

**Why Turbo?**
Turbo provides caching and task dependency management across workspace packages. It keeps `build`, `typecheck`, `lint`, and `test` commands consistent. It adds minimal overhead.

---

## Directory Structure

```
trix-icons/
│
├── apps/
│   ├── web/                    # Documentation + icon browser (Next.js, Phase 4)
│   └── cli/                    # Installation CLI (Phase 3)
│
├── packages/
│   ├── core/                   # Shared types, contracts, utilities
│   │   └── src/
│   │       ├── types.ts        # AnimatedIconProps, AnimatedIconHandle, etc.
│   │       └── index.ts
│   │
│   ├── icons/                  # React component implementations
│   │   └── src/
│   │       ├── actions/
│   │       ├── navigation/
│   │       ├── communication/
│   │       ├── media/
│   │       ├── system/
│   │       └── brands/
│   │
│   ├── registry/               # Registry schema + generation
│   │   └── src/
│   │       ├── schema.ts       # Registry entry types
│   │       ├── validate.ts     # Validation logic
│   │       └── index.ts
│   │
│   └── config/                 # Shared tsconfig, eslint, build config
│
├── icons/                      # CANONICAL SOURCE: SVG + metadata
│   ├── ui/                     # General UI icons
│   ├── actions/                # Action icons (download, upload, copy, etc.)
│   ├── navigation/             # Navigation icons (menu, back, close, etc.)
│   ├── communication/          # Communication icons (mail, bell, chat, etc.)
│   ├── media/                  # Media icons (play, pause, volume, etc.)
│   ├── system/                 # System icons (settings, trash, lock, etc.)
│   ├── brands/                 # Brand icons with animated treatments
│   └── experimental/           # Icons in development, not yet in registry
│
├── registry/
│   ├── icons.json              # GENERATED — do not edit manually
│   └── generated/              # Additional generated manifests
│
├── scripts/
│   ├── build-registry.js       # Reads icons/, writes registry/icons.json
│   ├── validate-icons.js       # Validates icon structure and metadata
│   └── validate-animations.js  # Animation-specific validation
│
├── docs/                       # Additional documentation assets
├── .github/
│   └── workflows/              # CI/CD pipelines
│
├── AGENTS.md
├── ARCHITECTURE.md
├── ANIMATION_GUIDELINES.md
├── CONTRIBUTING.md
├── DESIGN_PRINCIPLES.md
├── ICON_AUTHORING.md
├── CLI.md
├── PROVENANCE.md
├── QUALITY_GATES.md
├── REGISTRY.md
├── ROADMAP.md
└── README.md
```

---

## Source of Truth

There is one source of truth for every icon:

```
icons/<category>/<name>/
├── icon.svg       ← the canonical SVG geometry
└── meta.json      ← canonical metadata (provenance, license, description, keywords)
```

Everything else is derived:

```
icons/ (source)
    ↓
scripts/build-registry.js
    ↓
registry/icons.json (generated)
    ↓
apps/web   → icon browser, search, documentation
apps/cli   → installation commands
```

**The website does not own the icon list. The CLI does not own the icon list. The registry owns the icon list. The `icons/` directory is the source of the registry.**

---

## Package Contracts

### packages/core

Contains only shared TypeScript types and contracts. No UI code. No animation code.

This package is the public API contract. Changes to it are breaking changes.

### packages/icons

Contains React component implementations. These are the actual animated icon components.

Each component must implement the `AnimatedIconProps` interface from `packages/core`.

This package is an internal concern. Users do not install it — they receive copies of individual components via the CLI.

### packages/registry

Contains the registry schema definition, validation logic, and generation utilities.

The CLI uses this to resolve which files to copy into the user's project.

### apps/cli

The user-facing installation tool. At Phase 3, this becomes `npx trix`.

It reads `registry/icons.json`, resolves the requested icon's files, and copies them into the target project.

It has no runtime dependency on the hosted website.

### apps/web

The documentation website. At Phase 4, this becomes the primary discovery interface.

It reads `registry/icons.json` at build time. It renders icon previews and installation instructions.

It does not write to the registry. It does not define the icon list.

---

## Animation Engine Decision

**Decision: `motion/react` (formerly Framer Motion) is the canonical animation engine.**

**Reasoning:**

- `motion/react` offers first-class SVG path animation with the `pathLength` API, which maps cleanly to stroke-drawing animations
- It supports the `AnimatePresence` pattern for exit animations
- Its `useAnimation()` and `useAnimate()` hooks support the imperative control required by `AnimatedIconHandle`
- It is widely adopted and well-maintained
- It does not require a build plugin or global provider for basic use

**Constraints:**

- No icon component may import a different animation library
- If a specific animation genuinely cannot be achieved with `motion/react`, document the case and propose a specific exception before implementing it

---

## Framework Decision

**Decision: The icon components target React 18+ as the initial framework.**

**Reasoning:**

The source-distribution model means framework support is a deliberate authoring decision for each component, not a runtime adapter. React is the correct initial target because:

- The distribution tooling (registry/CLI) is most mature for React
- The motion/react library targets React
- React remains the dominant framework for component library consumption

Vue, Svelte, and other adapters are in ROADMAP.md as Phase 6 considerations, not current obligations.

---

## Build Tooling Decision

**Decision: TypeScript + tsup for package builds. Next.js for the web app.**

- `tsup` produces clean ESM + CJS dual output for packages with zero config overhead
- Next.js handles the web app with App Router for future route-based icon pages
- The CLI uses Node.js directly with no bundler required initially

---

## What This Architecture Deliberately Does Not Include

The following were considered and excluded at this phase:

- **Plugin system** — no current requirement
- **Design tool integration** — no current requirement
- **Runtime CDN delivery** — source distribution is the primary model
- **Multi-framework adapters** — deferred to Phase 6
- **Global animation provider** — icons manage their own state; no global context required
- **Icon factory/generator** — each icon is authored individually; automated generation produces poor quality
- **Storybook** — visual QA uses a lightweight dev page inside `packages/icons` at Phase 2; Storybook adds overhead not justified by the current icon count

---

## Open Architecture Questions (Requires Human Decision)

1. **Package name**: Should the CLI be published as `trix`, `@trix/cli`, or another scoped name? This affects the `npx trix add` command.
2. **npm package distribution**: Should `packages/icons` eventually be published so developers can `npm install @trix/icons` in addition to using the CLI? This is a distribution model question with tradeoffs.
3. **Registry hosting**: Should `registry/icons.json` be served from a hosted URL or bundled with the CLI? A hosted registry allows the CLI to fetch updates without reinstalling; a bundled registry works offline.
