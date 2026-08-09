# PROVENANCE.md — trix-icons

## Purpose

This document defines how trix-icons tracks the origin, ownership, and licensing of all icons.

Provenance records exist to:

1. Protect users of the library from unknowing copyright infringement
2. Protect brand owners whose marks are used in good faith for identification
3. Protect the project from misrepresenting ownership
4. Make licensing audits tractable

Every public icon has a provenance record in its `meta.json`. No exceptions.

---

## Categories of Provenance

### `source: "original"`

The artwork was created from scratch for trix-icons.

The project owns the animation and the geometry.

```json
"provenance": {
  "source": "original",
  "license": "MIT",
  "trademark": false,
  "attribution": null,
  "notes": null
}
```

### `source: "modified-third-party"`

The base artwork comes from a third-party open-source project and has been modified.

The original project's license must be respected (e.g., attribution, license retention).

```json
"provenance": {
  "source": "modified-third-party",
  "originalSource": "https://github.com/lucide-icons/lucide",
  "originalLicense": "ISC",
  "license": "ISC",
  "trademark": false,
  "attribution": "Based on Lucide Icons (ISC License). Geometry modified for trix-icons.",
  "notes": "Original path simplified and redrawn. Animation is original."
}
```

### `source: "third-party"`

The artwork reproduces a third-party mark as-is, typically for brand icon identification.

This is the category for all brand icons (GitHub, LeetCode, etc.).

The project does not own this mark. The animation treatment may be original, but the underlying mark belongs to its owner.

```json
"provenance": {
  "source": "third-party",
  "license": "unknown",
  "trademark": true,
  "trademarkOwner": "GitHub, Inc.",
  "trademarkContext": "Used for identification of the GitHub platform. This project has no affiliation with GitHub, Inc.",
  "attribution": "GitHub mark is a trademark of GitHub, Inc. All rights reserved.",
  "animationAuthor": "trix-icons",
  "animationLicense": "MIT",
  "reviewRequired": true,
  "notes": "License status pending. Do not redistribute commercially without legal review."
}
```

---

## Critical Rules

### Rule 1: Never state a trademark is "free to use"

Do not write, generate, or allow this in any documentation or metadata:

```
❌ "This logo is free to use."
❌ "No attribution required."
❌ "Open source."
```

Unless you have verified, specific legal documentation stating this. "I think it's fine" is not evidence.

### Rule 2: `license: "unknown"` is correct when the license is not verified

Do not guess a license. Do not assume MIT because the website looks open.

Set `license: "unknown"` and set `reviewRequired: true`.

The icon may be used internally and in experimental status, but must not be marked `"status": "stable"` until licensing is resolved.

### Rule 3: Brand icon animation is a separate matter from brand ownership

trix-icons creates original animation treatments for brand marks.

The animation code and choreography are original work by trix-icons (MIT License).

The underlying mark, geometry, and brand identity belong to the brand owner.

These must be clearly separated in the metadata:

```json
"animationAuthor": "trix-icons",
"animationLicense": "MIT"
```

This does not make the icon free to use in all contexts. The underlying mark still has its own rules.

### Rule 4: `reviewRequired: true` means a human must review before publishing

Any icon with `"reviewRequired": true` in its provenance:

- Must not be included in a public registry release
- Must not be marked `"status": "stable"`
- Must be reviewed by a human who has verified the licensing situation

Agents must not autonomously remove `reviewRequired: true`. Only a human may do this.

### Rule 5: Do not delete or modify provenance records without human review

Provenance records may only be updated when:

1. A human has verified the new information
2. The change is documented (what changed and why)
3. The icon's version is incremented

---

## Adding a Brand Icon

Before adding any brand icon:

1. Identify the brand's official logo usage guidelines.
2. Document the URL where you found those guidelines.
3. Record the license if one is explicitly stated.
4. If no explicit license exists, set `license: "unknown"` and `reviewRequired: true`.
5. Record the trademark owner.
6. Set `trademarkContext` to explain the use case (identification, not endorsement).
7. Set `"status": "experimental"` until licensing is resolved.

Examples of things that do not constitute a license:

- The logo appears on a publicly accessible website
- The company's product is open-source
- "Everyone uses the logo this way"
- The GitHub repository has an MIT license on the code (not the logo)
- The logo has been widely used in other icon libraries

---

## Provenance in the Registry

The generated `registry/icons.json` includes a summary of provenance for every icon:

```json
{
  "name": "github",
  "provenance": {
    "source": "third-party",
    "trademark": true,
    "trademarkOwner": "GitHub, Inc.",
    "reviewRequired": true,
    "license": "unknown"
  }
}
```

This allows the CLI to warn users when they install a brand icon with unresolved licensing.

---

## Provenance for Modified Open-Source Icons

When modifying an existing open-source icon:

1. Record the original source URL.
2. Record the original license (SPDX identifier).
3. Describe what was modified in `notes`.
4. If the original license requires attribution or license retention, preserve it.
5. The derivative license must be compatible with the original.

Common open-source icon licenses and their requirements:

| License | Attribution required | License retention |
|---------|---------------------|-------------------|
| MIT | Recommended, not required | No |
| ISC | Recommended, not required | No |
| Apache 2.0 | Yes | Yes |
| CC BY 4.0 | Yes | No (compatible derivatives OK) |
| CC BY-SA 4.0 | Yes | Yes (must use same license) |
| CC0 | No | No |

---

## What This Library Claims to Own

trix-icons owns:

1. Original UI icon geometry created for this project
2. Animation choreography and code for all icons
3. The registry schema
4. The CLI tool
5. The documentation

trix-icons does not claim to own:

1. Third-party brand marks or logos
2. Artwork derived from licensed third-party sources (original license applies)
3. The underlying trademarks of any represented company

---

## Template for New Brand Icon Provenance

Copy this into `meta.json` when starting a new brand icon:

```json
"provenance": {
  "source": "third-party",
  "license": "unknown",
  "trademark": true,
  "trademarkOwner": "BRAND OWNER NAME",
  "trademarkContext": "Used for identification of the BRAND NAME platform. This project has no affiliation with BRAND OWNER.",
  "attribution": "BRAND NAME mark is a trademark of BRAND OWNER. All rights reserved.",
  "logoGuidelinesUrl": "URL TO OFFICIAL BRAND GUIDELINES (if available)",
  "animationAuthor": "trix-icons",
  "animationLicense": "MIT",
  "reviewRequired": true,
  "notes": "License status: pending human review. Do not mark stable until reviewed."
}
```

---

## SPDX License Identifiers

Use SPDX identifiers in all license fields:

| License | SPDX identifier |
|---------|----------------|
| MIT | `MIT` |
| ISC | `ISC` |
| Apache 2.0 | `Apache-2.0` |
| CC BY 4.0 | `CC-BY-4.0` |
| CC BY-SA 4.0 | `CC-BY-SA-4.0` |
| CC0 | `CC0-1.0` |
| Unknown | `unknown` |
| Proprietary | `proprietary` |
