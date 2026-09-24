# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- `MenuIcon` (navigation) — dismiss-and-draw animation: menu items dismiss top-first, then a close X writes itself stroke by stroke.
- `SettingsIcon` (system) — mechanical detent rotation: partial turn, hold, release.
- `ThemeIcon` (system) — dusk-falls ray absorption: rays withdraw inward in staggered waves, the core dims, and the crescent rises from the fading light.
- `PlayPauseIcon` (media) — play triangle morphs into pause bars via matched M-L-L command structure.
- `VisibilityIcon` (system) — blinks shut for show/hide toggles: pupil shrinks away as a lash line draws across the intact eye.
- `CloseIcon` (navigation) — re-crossing: strokes unwrite then rewrite in sequence.
- `ArrowLeftIcon` / `ArrowRightIcon` (navigation) — pointing nudge in the direction of travel.
- `ChevronDownIcon` (navigation) — downward dip toward hidden content.
- `PlusIcon` (actions) — vertical bar inscribes itself top to bottom via path-drawing over the fixed horizontal bar.
- `MinusIcon` (actions) — bar sweeps in from the left.
- `FlameIcon` (system) — ignition: thermal-expansion flare pivoting at the base while two embers break off and rise. 56×56 grid deviation documented (settings/1024 precedent).
- `StarIcon` (actions) — celebration: anticipation squash, twist burst, and settle while three sparkles break off in staggered directions. 1024×1024 grid deviation documented.
- `BookmarkIcon` (actions) — pocketing it: jump, stretch, and squash onto the ground pivoting at the base, with an effort bubble and twin impact dust at the hit. 16×16 grid deviation documented.
- `ShareIcon` (actions) — broadcast: wind-up, packets firing along both arms, and impact ripples from the receiving nodes. 1024×1024 grid deviation documented; base path source unconfirmed (Ant Design share-alt lead, UNVERIFIED).

### Changed
- `DownloadIcon` / `UploadIcon` are now hold-to-loop: hovering repeats the transfer cycle for as long as the cursor stays (justified as transfer/progress semantics); press, focus, or manual plays a single cycle; leaving stops and resets to rest.
- Toggle icons (theme, play-pause, visibility, menu, home) now commit their state on click: hover previews the alternate state transiently; clicking locks it until clicked again.
- `HomeIcon` simplified: door mechanics and roof lift removed — the roofline alone unwrites and retraces itself while the house stands still.
- Website inspector unified: opening an icon resets any click-committed toggle state so card and modal never disagree; the modal demonstrates each icon once on open; Esc closes and ←/→ step through the filtered set; gallery shows a live result count. Showcase copy corrected to match actual behavior (call, upload, download).
- Removed the hero icon ribbon: it duplicated a stale subset of the gallery (19 of 26 icons, hover-only, no search or install) with no unique function; the showcase sections and gallery remain the single places icons are displayed.
- `SettingsIcon` base artwork now based on the Ant Design "setting" icon (MIT), documented as `modified-third-party` provenance with 1024×1024 viewBox deviation.
- `RefreshIcon` animation redesigned: the two arcs now redraw themselves in sequence (stroke path-drawing) instead of rotating, eliminating an off-axis rotation wobble.
- `HomeIcon` redesigned as a stroke-based house consistent with the UI icon family; the front door now swings open on its hinge instead of sliding into the floor.
- Documentation command references aligned with the published binary: `npx trix add` → `npx trix-icons add` across website and docs.
- `MenuIcon`, `SettingsIcon`, `ThemeIcon`, and remaining new icons remain `experimental` pending human visual QA and status review.

### Fixed
- `LeetcodeIcon` now renders the canonical LeetCode mark from `icons/brands/leetcode/icon.svg` (component previously drew a non-canonical approximation).
- Website installation commands corrected from `npx trix add` to the published `npx trix-icons add` everywhere (hero, showcase sections, developer example, icon modal).
- Website gallery preview for `play-pause`: component map key mismatched the registry slug (`playpause` vs `play-pause`), showing "No preview".
- `MailIcon`: the rising letter no longer collides with the envelope's top wall stroke — letter lines are anchored at their opened position inside the interior.

## [0.1.0] - 2026-08-14

### Added
- Initial release of `trix-icons` source-distribution CLI.
- `@trix/icons` React component library featuring 14 motion-story icons:
  - `BellIcon`, `CallIcon`, `CheckIcon`, `CopyIcon`, `DeleteIcon`, `DownloadIcon`, `HeartIcon`, `HomeIcon`, `LeetcodeIcon`, `MailIcon`, `MediumIcon`, `RefreshIcon`, `SearchIcon`, `UploadIcon`.
- `@trix/core` shared animation contracts and motion vocabulary tokens (`EASE_SETTLE`, `EASE_DRAW`, `EASE_BOUNCE`, `EASE_STANDARD`, `DURATION_MICRO`, `DURATION_NORMAL`, `DURATION_STORY`).
- `@trix/registry` schema, validation scripts, and generated icon metadata index.
- Single-command CLI installation (`npx trix add <icon-name>`).
