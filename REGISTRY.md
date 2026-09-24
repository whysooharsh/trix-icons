# REGISTRY.md — trix-icons

## What the Registry Is

The registry is a machine-readable manifest of every public icon in trix-icons.

It is used by:

- The CLI (`npx trix-icons add <icon>`) to resolve which files to copy
- The website to render the icon browser and search
- Validation scripts to check for completeness

The registry is **generated**. It is not the source of truth. The source of truth is `icons/<category>/<name>/`.

---

## Registry Location

```
registry/
├── icons.json      ← the full public registry
└── generated/      ← optional split manifests (by category, etc.)
```

`registry/icons.json` is the primary file consumed by the CLI and website.

Do not edit `registry/icons.json` manually. It is overwritten by `npm run registry:build`.

---

## Registry Generation

```bash
npm run registry:build
```

This runs `scripts/build-registry.js`, which:

1. Reads every `icons/<category>/<name>/meta.json`
2. Validates each `meta.json` against the schema in `packages/registry/src/schema.ts`
3. Resolves the corresponding component file path in `packages/icons/src/`
4. Outputs `registry/icons.json`

The generation is deterministic. Running it twice with unchanged source produces equivalent output.

Generated files include a header comment indicating they should not be edited manually:

```json
{
  "_generated": true,
  "_generatedAt": "...",
  "_generatedBy": "scripts/build-registry.js",
  "icons": [...]
}
```

---

## Registry Entry Schema

```ts
// packages/registry/src/schema.ts

interface RegistryEntry {
  name: string;           // "download"
  slug: string;           // "download" (URL-safe, unique)
  category: IconCategory; // "actions"
  description: string;    // Human-readable description
  keywords: string[];     // Search terms
  version: string;        // "0.1.0"
  status: "stable" | "experimental" | "deprecated";

  files: {
    component: string;    // Relative path to the component source
    svg: string;          // Relative path to the SVG source
  };

  dependencies: {
    npm: string[];        // npm packages the component requires (e.g., ["motion"])
    registry: string[];   // Other trix-icons icons this one depends on (usually empty)
  };

  provenance: {
    source: "original" | "modified-third-party" | "third-party";
    license: string;      // SPDX identifier or "unknown"
    trademark: boolean;
    trademarkOwner?: string;
    reviewRequired?: boolean;
    attribution?: string;
    animationAuthor?: string;
    animationLicense?: string;
  };

  animation: {
    technique: string;    // "directional-translate" | "path-drawing" | etc.
    description: string;
    reducedMotion: "static" | "minimal" | "essential";
  };

  accessibility: {
    defaultLabel: string;
    notes?: string;
  };

  meta: {
    addedAt: string;      // ISO date
    updatedAt: string;    // ISO date
  };
}
```

---

## Registry Validation Rules

The registry build script rejects an icon if:

| Rule | Failure |
|------|---------|
| `meta.json` is missing required fields | Build fails with field name |
| `slug` is not unique | Build fails with conflict report |
| `status: "stable"` but `reviewRequired: true` | Build fails |
| Component file referenced in `files.component` does not exist | Build fails |
| SVG file referenced in `files.svg` does not exist | Build fails |
| `license` is not a valid SPDX identifier or "unknown" | Build fails |
| `keywords` is empty | Build warns (not fatal) |

The build must fail loudly. A registry with incomplete data is worse than no registry.

---

## Icon Status Levels

| Status | Meaning |
|--------|---------|
| `stable` | Fully reviewed, passes all quality gates, provenance resolved |
| `experimental` | Under development; may be included in registry for testing but not in public CLI |
| `deprecated` | No longer maintained; still in registry for backward compatibility |

Only `stable` icons are included in the public CLI's registry.

---

## Registry Search Index

The website uses the registry to power its search.

Search is client-side and local. No search server required at current scale.

The search index is built from: `name`, `slug`, `keywords`, `description`.

Ranking is simple:
1. Exact name match
2. Name prefix match
3. Keyword match
4. Description contains match

---

## CLI and the Registry

The CLI reads `registry/icons.json` to resolve installation requests.

When the user runs:

```bash
npx trix-icons add github
```

The CLI:

1. Reads `registry/icons.json`
2. Finds the entry with `slug: "github"`
3. Checks `status` — only installs `stable` icons
4. If `provenance.reviewRequired: true`, warns the user and asks confirmation
5. Reads `files.component` to find the source file to copy
6. Reads `dependencies.npm` to identify packages the user must install
7. Copies the component to the user's project
8. Reports installed dependencies the user must add

The CLI does not need to be online if the registry is bundled with it.

At Phase 3, the decision of whether to bundle or fetch the registry will be documented in `CLI.md`.

---

## Extending the Registry

To add a new icon to the registry:

1. Create `icons/<category>/<name>/meta.json` with complete metadata
2. Create `icons/<category>/<name>/icon.svg`
3. Create `packages/icons/src/<category>/<Name>Icon.tsx`
4. Run `npm run registry:build`
5. Verify the entry appears in `registry/icons.json`
6. Run `npm run registry:validate`

Do not add entries to `registry/icons.json` directly.

---

## Registry File Identifier

All generated registry files begin with:

```json
{
  "_generated": true,
  "_source": "icons/",
  "_schema": "packages/registry/src/schema.ts",
  ...
}
```

Any file with `"_generated": true` must not be edited manually.
