# trix-icons

An animated React icon system built on a source-distribution model. Every icon embodies a tiny, intentional interaction story.

## Overview

`trix-icons` provides animated SVG icon components where motion derives from semantic meaning.

You install individual component source files directly into your project via the CLI (`npx trix-icons add <icon-name>`). You receive full ownership and control of the installed source code.

## Quick Start

### Source-Distribution via CLI

Install component source files directly into your codebase:

```bash
# Install an animated icon component into your project
npx trix-icons add search

# Install multiple icons at once
npx trix-icons add bell mail call search

# Target a custom folder
npx trix-icons add download --output src/ui/icons/

# Force overwrite existing files
npx trix-icons add search --force
```

### Available CLI Commands

```bash
npx trix-icons add <icon...>
npx trix-icons list
npx trix-icons search <query>
npx trix-icons info <icon>
```

## Packages in Monorepo

| Package | Description | Version |
| --- | --- | --- |
| `trix-icons` | Source-distribution CLI binary | `0.1.0` |
| `@trix/icons` | React animated icon components | `0.1.0` |
| `@trix/core` | Shared animation contracts & tokens | `0.1.0` |
| `@trix/registry` | Registry schema & metadata index | `0.1.0` |

## Requirements

Generated icon components require the following peer dependency:

- `motion` (`framer-motion` / `motion/react` >=11.0.0)
- `react` (>=18.0.0)

Install in your project with:

```bash
npm install motion
```

## License

MIT License.
