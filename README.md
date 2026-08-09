# trix-icons

An animated icon system where motion is intentional, source code is yours, and APIs are predictable.

---

## What it is

trix-icons is a library of animated SVG icon components for React.

The defining characteristic is the distribution model: you install individual component source files directly into your project using the CLI. You own the code. You can read it, modify it, and adapt it without forking a library.

```bash
npx trix add download
npx trix add github search mail
```

Each icon has a single animation that derives from the icon's meaning. A download icon moves downward. A bell swings. A check mark draws its stroke. Motion is not applied uniformly — it is designed per icon.

---

## Status

Phase 1 complete: architecture, contracts, documentation, quality gates.

Phase 2 in progress: initial icon set (12–15 icons).

The CLI and website are not yet available. See [ROADMAP.md](./ROADMAP.md) for current status.

---

## Project Structure

```
trix-icons/
├── packages/
│   ├── core/        Shared types and contracts
│   ├── icons/       React component implementations
│   └── registry/    Registry schema and validation
├── apps/
│   ├── web/         Documentation website (Phase 4)
│   └── cli/         Installation CLI (Phase 3)
├── icons/           Canonical SVG source + metadata
└── registry/        Generated icon manifest
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full architecture and design decisions.

---

## Design Principles

1. Motion derives from meaning, not aesthetic preference
2. Source code ownership over hosted runtime dependency
3. One source of truth: `icons/` → registry → website + CLI
4. Fail loudly when something is wrong
5. Brand icons are documented as brand assets, not original artwork

See [DESIGN_PRINCIPLES.md](./DESIGN_PRINCIPLES.md) and [ANIMATION_GUIDELINES.md](./ANIMATION_GUIDELINES.md).

---

## Animation

Each icon animation is designed individually.

| Icon | Animation |
|------|-----------|
| download | Arrow translates downward toward a surface |
| upload | Arrow translates upward from a surface |
| mail | Envelope flap opens |
| bell | Physical pendulum swing |
| check | Stroke path draws |
| refresh | Full rotation |
| menu | Lines transform into close (×) |
| play | Shapes transition toward pause state |
| trash | Lid rotates open |
| lock | Shackle moves |
| search | Handle shifts with arc accent |
| copy | Second layer offsets to suggest duplication |

See [ANIMATION_GUIDELINES.md](./ANIMATION_GUIDELINES.md) for the full motion system.

---

## Icon Categories

| Category | Contents |
|----------|---------|
| `actions` | download, upload, copy, refresh, search |
| `navigation` | menu, close, back, arrow |
| `communication` | mail, bell, chat, send |
| `media` | play, pause, volume, mute |
| `system` | trash, settings, lock, eye, check |
| `brands` | github, leetcode, and others — see provenance notes |
| `experimental` | Icons in development, not yet stable |

---

## Brand Icons

Brand icons are animated treatments of third-party marks.

The animation code is original work by trix-icons (MIT License).
The underlying marks belong to their respective trademark owners.

All brand icons include explicit provenance metadata. See [PROVENANCE.md](./PROVENANCE.md).

---

## Component API

```tsx
import { DownloadIcon } from "./components/icons/DownloadIcon";

// Default: animates on hover
<DownloadIcon />

// Custom size and trigger
<DownloadIcon size={32} trigger="hover" />

// Programmatic control
const ref = useRef<AnimatedIconHandle>(null);
<DownloadIcon ref={ref} trigger="manual" />
ref.current?.startAnimation();
ref.current?.resetAnimation();
```

### Props

```ts
interface AnimatedIconProps {
  size?: number | string;      // Default: 24
  color?: string;              // Default: "currentColor"
  strokeWidth?: number;        // Default: 2 (stroke-based icons)
  className?: string;
  trigger?: "hover" | "focus" | "press" | "manual" | "none";
  disabled?: boolean;
  "aria-label"?: string;       // Required for standalone informative use
}
```

### Ref handle

```ts
interface AnimatedIconHandle {
  startAnimation(): void;
  stopAnimation(): void;
  resetAnimation(): void;
}
```

---

## Contributing

Read [CONTRIBUTING.md](./CONTRIBUTING.md).

Read [ICON_AUTHORING.md](./ICON_AUTHORING.md) before adding an icon.

Icons are accepted one at a time with a completed design brief. Large batches of AI-generated icons without individual review are not accepted.

---

## License

MIT — for original animations and library code.

Brand marks are trademarks of their respective owners. See [PROVENANCE.md](./PROVENANCE.md) for per-icon attribution.

---

## For AI Agents

Read [AGENTS.md](./AGENTS.md) before taking any action in this repository.
