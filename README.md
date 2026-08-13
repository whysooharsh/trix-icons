# trix-icons

An animated React icon system built on a source-distribution model. Every icon embodies a tiny, intentional interaction story.

## Overview

`trix-icons` provides animated SVG icon components where motion derives from semantic meaning.

You can install individual component source files directly into your project via the CLI (`npx trix add <icon-name>`) or consume the package directly via `@trix/icons`.

## Quick Start

### 1. Source-Distribution via CLI

Install component source files directly into your codebase:

```bash
# Install an animated icon component into your project
npx trix add search

# Install multiple icons
npx trix add bell mail call search

# Target a custom folder
npx trix add download --output src/ui/icons/
```

### 2. Standard NPM Import

Alternatively, import React components directly from `@trix/icons`:

```bash
npm install @trix/icons motion react
```

```tsx
import { SearchIcon, BellIcon, MailIcon } from '@trix/icons';

export function Header() {
  return (
    <nav>
      <SearchIcon size={24} trigger="hover" />
      <BellIcon size={24} trigger="hover" />
      <MailIcon size={24} trigger="hover" />
    </nav>
  );
}
```

## Packages in Monorepo

| Package | Description | Version |
| --- | --- | --- |
| `trix-icons` (`apps/cli`) | Source-distribution CLI binary | `0.1.0` |
| `@trix/icons` (`packages/icons`) | React animated icon components | `0.1.0` |
| `@trix/core` (`packages/core`) | Shared contracts and motion tokens | `0.1.0` |
| `@trix/registry` (`packages/registry`) | Registry schema and metadata index | `0.1.0` |

## Available Icons (14 Total)

- **Actions**: `copy`, `delete`, `download`, `heart`, `refresh`, `search`, `upload`
- **Communication**: `bell`, `call`, `mail`
- **Navigation**: `home`
- **System**: `check`
- **Brands**: `medium`, `leetcode`

## Governance & Security

- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [Security Policy](./SECURITY.md)
- [Changelog](./CHANGELOG.md)
- [License](./LICENSE)

## License

MIT License.
