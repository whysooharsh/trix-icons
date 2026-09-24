# trix-icons CLI

Command-line installer for `trix-icons` — animated React icon components built on a source-distribution model.

Developers install individual icon components directly into their projects. You receive ownership and control of the installed source code to inspect, modify, and restyle without restrictions.

## Installation & Usage

No permanent installation is required. Run directly using `npx`:

```bash
# Add an animated icon to your project
npx trix-icons add search

# Add multiple icons at once
npx trix-icons add bell mail call search

# Target a specific output directory
npx trix-icons add download --output src/components/icons/

# Overwrite existing files
npx trix-icons add search --force
```

## Available Commands

| Command | Description |
| --- | --- |
| `npx trix-icons add <name...>` | Install one or more icons into your project |
| `npx trix-icons list` | List all available icons in the registry |
| `npx trix-icons search <query>` | Search icons by name, category, or keyword |
| `npx trix-icons info <name>` | Display metadata, provenance, and motion story details |
| `npx trix-icons --help` | Show command usage and CLI options |
| `npx trix-icons --version` | Show CLI version |

## Target Directory Auto-Detection

The CLI automatically detects your project's component folder:

1. `--output <path>` (explicit override)
2. `src/components/icons/`
3. `components/icons/`
4. `src/components/` → installs to `src/components/icons/`
5. `components/` → installs to `components/icons/`

## Requirements

Installed components require the following peer dependency:

- `motion` (`framer-motion` / `motion/react` >=11.0.0)
- `react` (>=18.0.0)

Install peer dependencies with:

```bash
npm install motion
```

## License

MIT License.
