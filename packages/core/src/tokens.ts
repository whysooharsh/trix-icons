/**
 * @trix/core — Shared motion tokens and vocabulary
 *
 * Core animation durations and easings for the trix-icons motion system.
 */

export const EASE_SETTLE = [0.22, 1, 0.36, 1] as const;
export const EASE_DRAW = [0.65, 0, 0.35, 1] as const;
export const EASE_BOUNCE = [0.34, 1.56, 0.64, 1] as const;
export const EASE_STANDARD = 'easeInOut' as const;

export const DURATION_MICRO = 0.2;
export const DURATION_NORMAL = 0.35;
export const DURATION_STORY = 0.6;
