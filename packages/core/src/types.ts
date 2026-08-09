/**
 * @trix/core — Shared types and contracts for trix-icons
 *
 * This file defines the public API contract for all animated icon components.
 * Changes to these types are breaking changes. Do not modify without human review.
 */

import type { ComponentPropsWithoutRef, ForwardRefExoticComponent, RefAttributes } from "react";

// ─── Trigger ────────────────────────────────────────────────────────────────

/**
 * Defines what interaction triggers the icon's animation.
 *
 * - "hover"  → animates on mouseenter, reverses on mouseleave
 * - "focus"  → animates on focus, reverses on blur
 * - "press"  → animates on pointerdown, reverses on pointerup
 * - "manual" → only responds to the AnimatedIconHandle ref methods
 * - "none"   → renders in initial state, no interaction
 */
export type AnimatedIconTrigger = "hover" | "focus" | "press" | "manual" | "none";

// ─── Props ───────────────────────────────────────────────────────────────────

/**
 * Base props shared by all animated icon components.
 *
 * Icons extend this interface with any icon-specific props.
 * Icons must not add required props — all icon-specific props must have defaults.
 */
export interface AnimatedIconProps {
  /**
   * Size of the icon in pixels, or any valid CSS length string.
   * Controls both width and height of the SVG.
   * @default 24
   */
  size?: number | string;

  /**
   * Icon color. Applied via CSS currentColor by default.
   * For stroke-based icons, this sets the stroke color.
   * For fill-based icons, this sets the fill color.
   * @default "currentColor"
   */
  color?: string;

  /**
   * Stroke width for stroke-based icons.
   * Has no effect on fill-based icons.
   * @default 2
   */
  strokeWidth?: number;

  /**
   * Additional CSS class names applied to the root SVG element.
   */
  className?: string;

  /**
   * What interaction triggers the animation.
   * @default "hover"
   */
  trigger?: AnimatedIconTrigger;

  /**
   * When true, animations are suppressed and pointer events are removed.
   * The icon renders in its initial static state.
   * @default false
   */
  disabled?: boolean;

  /**
   * Accessible label for standalone informative icons.
   *
   * When provided, sets role="img" and aria-label on the SVG.
   * When not provided, the icon renders with aria-hidden="true"
   * (correct for decorative icons inside buttons/links with their own labels).
   *
   * Do not set this blindly on every icon. The consuming component
   * provides semantic context in most cases.
   */
  "aria-label"?: string;
}

// ─── Handle ──────────────────────────────────────────────────────────────────

/**
 * Imperative handle for programmatic animation control.
 *
 * Used via React.forwardRef when trigger="manual" or when
 * animation needs to be controlled from outside the icon.
 *
 * @example
 * const ref = useRef<AnimatedIconHandle>(null);
 * <DownloadIcon ref={ref} trigger="manual" />
 * ref.current?.startAnimation();
 */
export interface AnimatedIconHandle {
  /**
   * Starts the icon's animation from its initial state.
   * If the animation is already running, behavior is icon-specific
   * (typically: restarts from the beginning or has no effect).
   */
  startAnimation(): void;

  /**
   * Stops the animation at its current frame.
   * The icon remains in whatever visual state it was in when stopped.
   */
  stopAnimation(): void;

  /**
   * Returns the icon to its initial visual state immediately.
   * Any running animation is cancelled.
   */
  resetAnimation(): void;
}

// ─── Component type ──────────────────────────────────────────────────────────

/**
 * The type of an animated icon component.
 *
 * All animated icon components conform to this type.
 * Use this for generic icon slots:
 *
 * @example
 * interface ButtonProps {
 *   icon?: AnimatedIconComponent;
 * }
 */
export type AnimatedIconComponent = ForwardRefExoticComponent<
  AnimatedIconProps & RefAttributes<AnimatedIconHandle>
>;

// ─── Icon category ───────────────────────────────────────────────────────────

/**
 * Valid icon categories in the trix-icons system.
 * Matches the directory structure in icons/.
 */
export type IconCategory =
  | "actions"
  | "navigation"
  | "communication"
  | "media"
  | "system"
  | "brands"
  | "experimental";
