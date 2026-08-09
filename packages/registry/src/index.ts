/**
 * @trix/registry — public exports
 */

export type {
  ProvenanceSource,
  ProvenanceMetadata,
  AnimationMetadata,
  AccessibilityMetadata,
  IconStatus,
  IconMetadata,
  RegistryEntry,
  GeneratedRegistry,
  ReducedMotionBehavior,
} from "./schema.js";

export {
  validateIconMetadata,
  validateSlugUniqueness,
} from "./validate.js";

export type { ValidationError, ValidationResult } from "./validate.js";
