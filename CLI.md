# CLI.md — trix-icons

## Purpose

The trix CLI installs icon components from the trix-icons registry directly into a developer's project.

The installed code is owned by the developer. They can inspect it, modify it, and adapt it without restrictions.

---

## Core Command

```bash
npx trix-icons add <icon-name>
npx trix-icons add <icon-name> [icon-name...]
```

Example:

```bash
npx trix-icons add download
npx trix-icons add github search mail
```

---

## Planned Commands

| Command | Description | Phase |
|---------|-------------|-------|
| `npx trix-icons add <name>` | Install one or more icons | Phase 3 |
| `npx trix-icons list` | List all available icons | Phase 3 |
| `npx trix-icons search <query>` | Search icons by name, keyword, description | Phase 3 |
| `npx trix-icons info <name>` | Show provenance, license, and animation info for an icon | Phase 3 |
| `npx trix-icons update <name>` | Update an installed icon to the latest version | Phase 4 |
| `npx trix-icons update --all` | Update all installed icons | Phase 4 |

Do not implement commands that are not needed yet. Document them here and wait.

---

## Installation Model

When a user runs `npx trix-icons add download`:

1. The CLI reads the registry (local bundle or fetched)
2. It finds the entry for `download`
3. It validates the entry is `status: "stable"`
4. It determines the target directory in the user's project (see Target Detection)
5. It checks whether the icon is already installed (see Idempotency)
6. It copies the component source file to the target directory
7. It reports any npm dependencies the user must install

The CLI does not install npm dependencies automatically. It reports them clearly:

```
✓ Installed: components/icons/DownloadIcon.tsx
  
  This icon requires the following npm package:
  → motion

  Install it with:
  → npm install motion
```

---

## Target Detection

The CLI attempts to detect the user's project structure.

Detection priority:

1. Explicit `--output` flag: use the specified path
2. Presence of `src/components/icons/` → install there
3. Presence of `components/icons/` → install there
4. Presence of `src/components/` → install to `src/components/icons/`
5. Presence of `components/` → install to `components/icons/`
6. Default: prompt the user to specify a path

The CLI must not silently guess wrong. If detection is ambiguous, it prompts.

The output path can always be overridden:

```bash
npx trix-icons add download --output src/ui/icons/
```

---

## Idempotency

Running the same command twice must produce a predictable result.

```bash
npx trix-icons add download
npx trix-icons add download   # second run
```

On the second run, the CLI checks whether the file already exists and whether it has been modified.

| Scenario | Behavior |
|----------|----------|
| File does not exist | Install normally |
| File exists and matches registry version | Report "already installed", skip |
| File exists but content differs from registry | Warn: file has been modified. Ask: `overwrite? [y/N]` |
| File exists with newer registry version available | Report: "update available". Ask: `update? [y/N]` |

The CLI must never silently overwrite a file the user may have modified.

---

## Overwrite Behavior

When a conflict is detected, the CLI asks:

```
DownloadIcon.tsx already exists and has been modified.

Overwrite? [y/N]:
```

Default is No.

If `--force` is passed, overwrite without asking.

```bash
npx trix-icons add download --force
```

---

## Error Behavior

The CLI must fail loudly when something is wrong.

| Scenario | Behavior |
|----------|----------|
| Unknown icon name | `Error: Icon "xyz" not found in registry.\n  Run 'npx trix-icons list' to see available icons.` |
| Icon is not stable | `Error: Icon "xyz" is experimental and not yet available for installation.` |
| Registry is unavailable | `Error: Could not load registry. Check your connection or try again.` |
| Target directory cannot be created | `Error: Could not create directory "path/to/dir": [OS error message]` |
| Icon has unresolved provenance | `Warning: This icon has unresolved licensing. [details]. Continue? [y/N]` |
| Invalid CLI flag | `Error: Unknown option "--xyz". Run 'npx trix-icons --help' for usage.` |

Do not silently use defaults for unknown flags. Fail clearly.

---

## Brand Icon Warning

When installing a brand icon with `provenance.reviewRequired: true`:

```
Warning: github has unresolved licensing status.
  
  The GitHub mark is a trademark of GitHub, Inc.
  License status: unknown
  
  The animation code is MIT-licensed. The underlying mark is not.
  Verify that your use case is permitted before proceeding.
  
  See: trix-icons.dev/provenance/github (or check meta.json)
  
  Continue? [y/N]:
```

This warning cannot be suppressed without `--force`. Even `--force` should log the warning to stdout.

---

## Registry Source

At Phase 3, the CLI bundles `registry/icons.json` with the CLI package.

This means the CLI works offline but requires a new CLI version to access new icons.

A future Phase 4 option: the CLI fetches from a hosted registry URL, with a local fallback.

Do not implement the hosted fetch until the registry URL is stable and the failure behavior is designed.

---

## Versioning

Icon versions are tracked in `meta.json`. The registry records the version.

When a user installs an icon, the CLI writes a `.trixrc.json` (or similar) in their project root recording:

```json
{
  "icons": {
    "download": "0.1.0",
    "github": "0.1.0"
  }
}
```

This allows `npx trix-icons update` to detect stale versions.

The exact format of `.trixrc.json` will be defined in Phase 3.

---

## Offline Behavior

The bundled registry model supports full offline use.

The CLI must not fail with a cryptic error if there is no network connection.

If a registry fetch is ever introduced, the failure message must be:

```
Error: Could not reach the trix registry at <url>.
  
  You appear to be offline.
  
  Using bundled registry (version <date>).
  Note: this may not include icons added after that date.
```

---

## `--help` Output

The CLI must provide useful help output.

```
Usage: npx trix-icons <command> [options]

Commands:
  add <name...>    Install one or more icons into your project
  list             List all available icons
  search <query>   Search icons by name or keyword
  info <name>      Show details about a specific icon

Options:
  --output <path>  Target directory for installed files
  --force          Overwrite existing files without prompting
  --help           Show this help
  --version        Show CLI version

Examples:
  npx trix-icons add download
  npx trix-icons add github search mail --output src/components/icons/
  npx trix-icons list
  npx trix-icons search arrow
```

---

## What the CLI Is Not

- Not a package manager
- Not a bundler
- Not a code transformer
- Not a style injector
- Not a runtime dependency

The CLI copies source files. The rest is the developer's responsibility.

---

## Implementation Notes (Phase 3)

The CLI will be implemented in `apps/cli/`.

Technology choices (to be decided at Phase 3):

- Node.js with no framework (preferred for simplicity)
- Possibly `commander` for argument parsing (small, stable)
- No build step required if the CLI uses native Node.js ESM

Do not use a heavy CLI framework that introduces large dependencies.
