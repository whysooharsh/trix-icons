/**
 * @trix/registry — Registry schema types
 *
 * Defines the shape of meta.json files and the generated registry/icons.json.
 * The schema here is the source of truth for validation.
 *
 * Do not modify without updating:
 * - REGISTRY.md
 * - scripts/validate-icons.js
 * - scripts/build-registry.js
 */

import type { IconCategory } from "@trix/core";

// ─── Provenance ──────────────────────────────────────────────────────────────

export type ProvenanceSource = "original" | "modified-third-party" | "third-party";

export interface ProvenanceMetadata {
  /** Where the base artwork originated. */
  source: ProvenanceSource;

  /**
   * SPDX license identifier for the base artwork.
   * Use "unknown" when the license has not been verified.
   * Never guess — if unsure, use "unknown" and set reviewRequired: true.
   */
  license: string;

  /** Whether this icon's base artwork is a registered trademark. */
  trademark: boolean;

  /** The trademark owner. Required when trademark is true. */
  trademarkOwner?: string;

  /**
   * Explains the context in which the trademark is being used.
   * Should clarify this is for identification, not endorsement.
   */
  trademarkContext?: string;

  /**
   * Attribution string required by the original license, or stating trademark ownership.
   * Include even when not strictly legally required — it is the right thing to do.
   */
  attribution?: string | null;

  /**
   * URL to the official brand/logo usage guidelines, if available.
   * Required for brand icons.
   */
  logoGuidelinesUrl?: string;

  /**
   * For modified-third-party icons: the URL of the original source.
   */
  originalSource?: string;

  /**
   * For modified-third-party icons: the SPDX license of the original source.
   */
  originalLicense?: string;

  /**
   * Who authored the animation treatment.
   * Typically "trix-icons" for brand icons where the base mark is third-party.
   */
  animationAuthor?: string;

  /**
   * SPDX license identifier for the animation treatment.
   * Typically "MIT" for original animations.
   */
  animationLicense?: string;

  /**
   * When true, a human must review this icon before it can be marked stable.
   * Must not be removed by an automated process.
   */
  reviewRequired?: boolean;

  /** Additional notes about the provenance situation. */
  notes?: string | null;
}

// ─── Animation metadata ──────────────────────────────────────────────────────

export type ReducedMotionBehavior = "static" | "minimal" | "essential";

export interface AnimationMetadata {
  /**
   * The primary animation technique used.
   * Examples: "directional-translate", "path-drawing", "rotation",
   *           "structural-transform", "physical-swing", "path-morph"
   */
  technique: string;

  /** Human-readable description of what animates and why. */
  description: string;

  /** How this icon behaves when prefers-reduced-motion is active. */
  reducedMotion: ReducedMotionBehavior;
}

// ─── Accessibility metadata ──────────────────────────────────────────────────

export interface AccessibilityMetadata {
  /**
   * The default accessible label for this icon.
   * Used when aria-label is not provided by the consumer.
   * Note: the component renders aria-hidden by default; this is documentation
   * for consumers who need to use the icon in a standalone informative context.
   */
  defaultLabel: string;

  /** Additional accessibility notes for consumers. */
  notes?: string;
}

// ─── Icon status ─────────────────────────────────────────────────────────────

export type IconStatus = "stable" | "experimental" | "deprecated";

// ─── Meta.json schema ────────────────────────────────────────────────────────

/**
 * The schema for icons/<category>/<name>/meta.json
 *
 * All fields are required unless marked optional.
 * Validation will fail on any missing required field.
 */
export interface IconMetadata {
  /** Icon name (matches directory name, lowercase hyphenated) */
  name: string;

  /**
   * URL-safe slug. Must be unique across the entire registry.
   * Usually the same as name.
   */
  slug: string;

  /** Which category this icon belongs to */
  category: IconCategory;

  /**
   * Human-readable description.
   * Must describe the icon's meaning, not just its shape.
   * Bad: "A downward-pointing arrow"
   * Good: "Represents a file or data download action. The arrow moves downward toward a surface."
   */
  description: string;

  /** Search keywords. Minimum 2 entries. */
  keywords: string[];

  /** Semantic version */
  version: string;

  provenance: ProvenanceMetadata;
  animation: AnimationMetadata;
  accessibility: AccessibilityMetadata;

  status: IconStatus;
}

// ─── Registry entry (generated) ──────────────────────────────────────────────

/**
 * A single entry in registry/icons.json.
 * Generated from IconMetadata + file resolution.
 */
export interface RegistryEntry extends IconMetadata {
  files: {
    /** Path to the React component, relative to the package root */
    component: string;
    /** Path to the SVG source, relative to the repository root */
    svg: string;
  };

  dependencies: {
    /** npm packages the component imports */
    npm: string[];
    /** Other trix-icons slugs this component depends on (usually empty) */
    registry: string[];
  };

  meta: {
    /** ISO 8601 date when this icon was added */
    addedAt: string;
    /** ISO 8601 date when this icon was last updated */
    updatedAt: string;
  };
}

// ─── Generated registry file ─────────────────────────────────────────────────

/**
 * The shape of registry/icons.json.
 * Do not create or edit this file manually.
 */
export interface GeneratedRegistry {
  _generated: true;
  _generatedAt: string;
  _generatedBy: string;
  _schema: string;
  icons: RegistryEntry[];
}
