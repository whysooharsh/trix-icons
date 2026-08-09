/**
 * Validation logic for icon metadata.
 *
 * These functions are used by scripts/validate-icons.js and scripts/build-registry.js.
 * They throw descriptive errors — do not silently ignore validation failures.
 */

import type { IconMetadata, IconStatus } from "./schema.js";

// ─── Constants ───────────────────────────────────────────────────────────────

const VALID_CATEGORIES = new Set([
  "actions",
  "navigation",
  "communication",
  "media",
  "system",
  "brands",
  "experimental",
]);

const VALID_STATUSES = new Set<IconStatus>(["stable", "experimental", "deprecated"]);

const VALID_PROVENANCE_SOURCES = new Set([
  "original",
  "modified-third-party",
  "third-party",
]);

const VALID_REDUCED_MOTION = new Set(["static", "minimal", "essential"]);

// ─── Validation result ────────────────────────────────────────────────────────

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: string[];
}

// ─── Validators ──────────────────────────────────────────────────────────────

/**
 * Validates an icon's meta.json content.
 *
 * Returns all errors found, not just the first one.
 * The build script uses this to give a complete picture of what needs fixing.
 */
export function validateIconMetadata(
  meta: unknown,
  source: string
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];

  if (typeof meta !== "object" || meta === null) {
    return {
      valid: false,
      errors: [{ field: "root", message: `${source}: meta.json must be a JSON object` }],
      warnings: [],
    };
  }

  const m = meta as Record<string, unknown>;

  // Required string fields
  const requiredStrings: (keyof IconMetadata)[] = [
    "name",
    "slug",
    "category",
    "description",
    "version",
  ];

  for (const field of requiredStrings) {
    if (typeof m[field] !== "string" || (m[field] as string).trim() === "") {
      errors.push({ field, message: `${source}: "${field}" must be a non-empty string` });
    }
  }

  // Category
  if (typeof m.category === "string" && !VALID_CATEGORIES.has(m.category)) {
    errors.push({
      field: "category",
      message: `${source}: "${m.category}" is not a valid category. Valid: ${[...VALID_CATEGORIES].join(", ")}`,
    });
  }

  // Status
  if (typeof m.status !== "string" || !VALID_STATUSES.has(m.status as IconStatus)) {
    errors.push({
      field: "status",
      message: `${source}: "status" must be one of: ${[...VALID_STATUSES].join(", ")}`,
    });
  }

  // Keywords
  if (!Array.isArray(m.keywords) || m.keywords.length < 2) {
    warnings.push(`${source}: "keywords" should have at least 2 entries for better searchability`);
  }

  // Slug format
  if (typeof m.slug === "string" && !/^[a-z0-9-]+$/.test(m.slug)) {
    errors.push({
      field: "slug",
      message: `${source}: "slug" must be lowercase alphanumeric with hyphens only. Got: "${m.slug}"`,
    });
  }

  // Provenance
  if (typeof m.provenance !== "object" || m.provenance === null) {
    errors.push({ field: "provenance", message: `${source}: "provenance" object is required` });
  } else {
    const p = m.provenance as Record<string, unknown>;

    if (!VALID_PROVENANCE_SOURCES.has(p.source as string)) {
      errors.push({
        field: "provenance.source",
        message: `${source}: "provenance.source" must be one of: ${[...VALID_PROVENANCE_SOURCES].join(", ")}`,
      });
    }

    if (typeof p.license !== "string" || p.license.trim() === "") {
      errors.push({
        field: "provenance.license",
        message: `${source}: "provenance.license" must be a non-empty string (use "unknown" if not verified)`,
      });
    }

    if (typeof p.trademark !== "boolean") {
      errors.push({
        field: "provenance.trademark",
        message: `${source}: "provenance.trademark" must be a boolean`,
      });
    }

    // Brand icon requirements
    if (p.trademark === true) {
      if (typeof p.trademarkOwner !== "string" || p.trademarkOwner.trim() === "") {
        errors.push({
          field: "provenance.trademarkOwner",
          message: `${source}: "provenance.trademarkOwner" is required when trademark is true`,
        });
      }
    }

    // modified-third-party requirements
    if (p.source === "modified-third-party") {
      if (typeof p.originalSource !== "string" || p.originalSource.trim() === "") {
        errors.push({
          field: "provenance.originalSource",
          message: `${source}: "provenance.originalSource" is required when source is "modified-third-party"`,
        });
      }
      if (typeof p.originalLicense !== "string" || p.originalLicense.trim() === "") {
        errors.push({
          field: "provenance.originalLicense",
          message: `${source}: "provenance.originalLicense" is required when source is "modified-third-party"`,
        });
      }
    }
  }

  // Animation
  if (typeof m.animation !== "object" || m.animation === null) {
    errors.push({ field: "animation", message: `${source}: "animation" object is required` });
  } else {
    const a = m.animation as Record<string, unknown>;

    if (typeof a.technique !== "string" || a.technique.trim() === "") {
      errors.push({
        field: "animation.technique",
        message: `${source}: "animation.technique" must be a non-empty string`,
      });
    }

    if (typeof a.description !== "string" || a.description.trim() === "") {
      errors.push({
        field: "animation.description",
        message: `${source}: "animation.description" must be a non-empty string`,
      });
    }

    if (!VALID_REDUCED_MOTION.has(a.reducedMotion as string)) {
      errors.push({
        field: "animation.reducedMotion",
        message: `${source}: "animation.reducedMotion" must be one of: ${[...VALID_REDUCED_MOTION].join(", ")}`,
      });
    }
  }

  // Accessibility
  if (typeof m.accessibility !== "object" || m.accessibility === null) {
    errors.push({ field: "accessibility", message: `${source}: "accessibility" object is required` });
  } else {
    const a = m.accessibility as Record<string, unknown>;
    if (typeof a.defaultLabel !== "string" || a.defaultLabel.trim() === "") {
      errors.push({
        field: "accessibility.defaultLabel",
        message: `${source}: "accessibility.defaultLabel" must be a non-empty string`,
      });
    }
  }

  // Gate: stable status requires provenance to be resolved
  if (m.status === "stable") {
    const p = m.provenance as Record<string, unknown> | undefined;
    if (p?.reviewRequired === true) {
      errors.push({
        field: "status",
        message: `${source}: Cannot set status "stable" when provenance.reviewRequired is true`,
      });
    }
    if (typeof p?.license === "string" && p.license === "unknown") {
      errors.push({
        field: "status",
        message: `${source}: Cannot set status "stable" when provenance.license is "unknown"`,
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Checks whether a slug is unique within a list of existing slugs.
 * Returns an error if the slug is already in use.
 */
export function validateSlugUniqueness(
  slug: string,
  existingSlugs: Set<string>,
  source: string
): ValidationError | null {
  if (existingSlugs.has(slug)) {
    return {
      field: "slug",
      message: `${source}: Duplicate slug "${slug}". Each icon must have a unique slug.`,
    };
  }
  return null;
}
