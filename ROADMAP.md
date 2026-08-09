# ROADMAP.md — trix-icons

This roadmap reflects the current state of planning. It is honest about what is done and what is not.

It will be updated as the project evolves.

---

## Phase 1 — Foundation (Current)

**Goal:** Establish architecture, contracts, and quality standards before building components.

- [x] Repository structure
- [x] Monorepo with npm workspaces
- [x] AGENTS.md — AI agent instructions
- [x] ARCHITECTURE.md — architecture decisions
- [x] ANIMATION_GUIDELINES.md — motion system
- [x] DESIGN_PRINCIPLES.md — visual language
- [x] ICON_AUTHORING.md — authoring process
- [x] PROVENANCE.md — ownership and licensing model
- [x] REGISTRY.md — registry architecture
- [x] CLI.md — CLI design
- [x] QUALITY_GATES.md — validation requirements
- [x] CONTRIBUTING.md — contribution process
- [x] ROADMAP.md — this file
- [x] README.md — project description
- [x] `packages/core` — shared types and contracts
- [x] `packages/registry` — registry schema and validation
- [ ] turbo.json — task orchestration
- [ ] tsconfig base — TypeScript configuration
- [ ] ESLint base configuration

---

## Phase 2 — Core Icon Set

**Goal:** Build a small set of high-quality icons that demonstrate different animation techniques.

**Target: 12–15 icons across all non-brand categories.**

The initial set should cover distinct animation techniques rather than maximize count.

Candidate icons (subject to design brief review):

| Icon | Category | Technique |
|------|----------|-----------|
| download | actions | directional translate |
| upload | actions | directional translate (reverse) |
| copy | actions | layered offset |
| trash | system | lid morph/rotation |
| refresh | actions | full rotation |
| check | system | stroke path-drawing |
| search | actions | handle translate + scale |
| settings/gear | system | rotation |
| mail | communication | flap opening |
| bell | communication | physical swing |
| menu → close | navigation | structural transform |
| play → pause | media | path morph |
| lock | system | shackle animation |
| arrow-down | navigation | bounce translate |

These are candidates. Each must pass a design brief before implementation.

- [ ] Design brief for each candidate icon
- [ ] SVG source for each icon
- [ ] Component implementation for each icon
- [ ] Visual QA at all sizes
- [ ] All quality gates passing

---

## Phase 3 — Registry and CLI

**Goal:** Working `npx trix add <icon>` command that installs a component into a real project.

- [ ] `packages/registry` — full schema implementation and validation
- [ ] `scripts/build-registry.js` — deterministic registry generation
- [ ] `scripts/validate-icons.js` — icon source validation
- [ ] `scripts/validate-registry.js` — registry output validation
- [ ] `apps/cli` — initial CLI implementation
  - [ ] `npx trix add <name>` — install command
  - [ ] `npx trix list` — list command
  - [ ] `npx trix info <name>` — info command
  - [ ] Target directory detection
  - [ ] Idempotency (no silent overwrites)
  - [ ] Brand icon provenance warnings
  - [ ] Error messages (see CLI.md)
- [ ] CLI integration test: clean Next.js project fixture
- [ ] CLI integration test: clean Vite project fixture

---

## Phase 4 — Documentation Website

**Goal:** A browsable, searchable interface for discovering and installing icons.

- [ ] `apps/web` — Next.js application
- [ ] Icon grid (browse all icons)
- [ ] Icon detail page (animation preview, installation command, source code, provenance)
- [ ] Search (client-side, local, metadata-based)
- [ ] Installation command copied to clipboard
- [ ] Source code viewer
- [ ] Provenance disclosure on brand icons
- [ ] Dark mode (default)
- [ ] Responsive layout

The website is a discovery tool. It does not own the icon list or registry.

---

## Phase 5 — Public Release

**Goal:** A stable, public v1.0 that developers can rely on.

- [ ] All Phase 2–4 work reviewed
- [ ] Brand icon provenance fully resolved or experimental flagged
- [ ] Documentation complete and accurate
- [ ] CLI tested against real projects
- [ ] No known regressions
- [ ] Changelog established
- [ ] Release notes

---

## Phase 6 — Expansion (Only If Justified)

The following are contingent on actual demand and engineering capacity.
Do not build them speculatively.

- **npm package distribution** (`npm install @trix/icons`) — only if CLI model proves insufficient for adoption
- **Vue adapter** — only if Vue-based projects demonstrate significant interest
- **Svelte adapter** — same condition
- **React Native adapter** — significant different engineering; only if demanded
- **Design tool integration** (Figma plugin) — only if the icon system stabilizes and demand exists
- **Contributor ecosystem** — as the project grows
- **Playground (live animation editor)** — Phase 4 may include basic preview; editor is Phase 6

---

## What Is Explicitly Not on the Roadmap

- CSS-only animation variants (motion/react is the engine; CSS animations are a different product)
- Icon generator (quality cannot be automated)
- AI-generated icon batch imports
- Icon packs in non-web formats (iOS SF Symbols equivalent, etc.)
- Self-hosted registry server
- White-label version
- Enterprise license

These may be revisited if demand demonstrates they're needed. They are not included because they might be useful.

---

## Versioning

The project follows semantic versioning.

| Change | Version bump |
|--------|-------------|
| New icon (backward compatible) | Minor |
| Breaking change to `AnimatedIconProps` | Major |
| Breaking change to CLI behavior | Major |
| Breaking change to registry schema | Major |
| Animation change to existing icon | Minor (not breaking) |
| Bug fix | Patch |
| Documentation only | Patch or none |

The first public release targets **v1.0.0**. Pre-release work is `v0.x.x`.
