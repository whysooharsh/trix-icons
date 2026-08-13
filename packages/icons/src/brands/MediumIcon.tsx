'use client';

/**
 * Story: three brand mark elements assemble left-to-right via restrained stroke trace and fill fade → settles.
 *
 * Animation: staggered-stroke-draw-to-fill
 * Three shapes (circle, ellipse, pill) draw in left-to-right,
 * each crossfading from stroke to fill once drawn.
 *
 * Provenance: third-party trademark of A Medium Corporation.
 * Status: experimental — pending provenance review.
 * Do not change status to stable without human sign-off on provenance.
 */

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import { motion, useAnimation, useReducedMotion } from 'motion/react';
import type { AnimatedIconHandle, AnimatedIconProps } from '@trix/core';

// ─── Animation constants ──────────────────────────────────────────────────────
//
// These preserve the character of the original HTML experiment.
// Do not replace with generic values.
//
// Each shape draws for 700ms using this cubic-bezier.
// The curve (0.65,0,0.35,1) is a strong ease-in-out that gives each
// shape a deliberate, weighted quality as it traces itself.

const DRAW_DURATION = 0.7; // seconds per shape
const DRAW_EASE: [number, number, number, number] = [0.65, 0, 0.35, 1];

// Fill crossfade: each shape begins dissolving from stroke to fill
// 650ms into its own draw — 50ms before the draw completes.
// This slight overlap prevents a hard stop-then-transition.
const FILL_DURATION = 0.4; // seconds
const FILL_EASE = 'easeOut' as const;

// Per-shape timing (milliseconds from animation start).
// Left-to-right order follows natural reading direction.
// shape[0] = circle (leftmost), shape[1] = ellipse, shape[2] = pill (rightmost)
const SHAPE_TIMING = [
  { draw: 0,   fill: 650 },
  { draw: 150, fill: 800 },
  { draw: 280, fill: 930 },
] as const;

// ─── Shared animation states ──────────────────────────────────────────────────

/** The resting state: fully visible, filled. No stroke. */
const FILLED_STATE = {
  pathLength: 1,
  fillOpacity: 1,
  strokeOpacity: 0,
} as const;

/** The drawing start state: invisible fill, visible stroke, path not yet drawn. */
const STROKE_STATE = {
  pathLength: 0,
  fillOpacity: 0,
  strokeOpacity: 1,
} as const;

// ─── Component ───────────────────────────────────────────────────────────────

export const MediumIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  function MediumIcon(
    {
      size = 24,
      color = 'currentColor',
      // strokeWidth defaults to 1.2 for this icon (not the standard 2).
      // The Medium mark is defined by its shapes, not stroke weight.
      // 1.2 produces a fine tracing stroke appropriate to the geometry.
      strokeWidth = 1.2,
      className,
      trigger = 'hover',
      disabled = false,
      'aria-label': ariaLabel,
    },
    ref
  ) {
    // One AnimationControls instance per path element.
    // Using separate instances makes per-shape timing explicit and debuggable.
    const ctrl1 = useAnimation();
    const ctrl2 = useAnimation();
    const ctrl3 = useAnimation();

    const prefersReducedMotion = useReducedMotion();

    // Generation counter — incremented on every new play or cancel.
    // Timeout callbacks check this before running to detect invalidation.
    const generationRef = useRef(0);

    // All scheduled timeout IDs, cleared on every play or cancel.
    const timeoutIds = useRef<ReturnType<typeof setTimeout>[]>([]);

    // Cancel and clear all pending phase transitions.
    const clearTimeouts = useCallback(() => {
      timeoutIds.current.forEach(clearTimeout);
      timeoutIds.current = [];
    }, []);

    // Clean up on unmount: invalidate any running sequence.
    useEffect(() => {
      return () => {
        clearTimeouts();
        generationRef.current++;
      };
    }, [clearTimeouts]);

    // Schedule a future callback. Tracked for cleanup.
    function schedule(ms: number, fn: () => void): void {
      timeoutIds.current.push(setTimeout(fn, ms));
    }

    // Instantly snap all shapes to the filled resting state.
    // Used on hover-leave, focus-blur, and resetAnimation().
    const snapToFilled = useCallback(() => {
      clearTimeouts();
      generationRef.current++;
      ctrl1.set(FILLED_STATE);
      ctrl2.set(FILLED_STATE);
      ctrl3.set(FILLED_STATE);
    }, [clearTimeouts, ctrl1, ctrl2, ctrl3]);

    // Play the full animation sequence.
    const startAnimation = useCallback(() => {
      if (prefersReducedMotion || disabled) return;

      clearTimeouts();
      const gen = ++generationRef.current;

      // Phase 0: snap all shapes to the drawing start state (instant).
      // The icon disappears briefly before the draw begins.
      ctrl1.set(STROKE_STATE);
      ctrl2.set(STROKE_STATE);
      ctrl3.set(STROKE_STATE);

      // Phase 1: staggered stroke draw — left to right.
      // ctrl1 starts immediately; ctrl2 and ctrl3 are scheduled.
      ctrl1.start({
        pathLength: 1,
        transition: { duration: DRAW_DURATION, ease: DRAW_EASE },
      });

      schedule(SHAPE_TIMING[1].draw, () => {
        if (generationRef.current !== gen) return;
        ctrl2.start({
          pathLength: 1,
          transition: { duration: DRAW_DURATION, ease: DRAW_EASE },
        });
      });

      schedule(SHAPE_TIMING[2].draw, () => {
        if (generationRef.current !== gen) return;
        ctrl3.start({
          pathLength: 1,
          transition: { duration: DRAW_DURATION, ease: DRAW_EASE },
        });
      });

      // Phase 2: per-shape stroke→fill crossfade.
      // Each begins 650ms into that shape's own draw, before the draw completes.
      // The fill and stroke transitions run concurrently with the tail of the draw.

      schedule(SHAPE_TIMING[0].fill, () => {
        if (generationRef.current !== gen) return;
        ctrl1.start({
          fillOpacity: 1,
          strokeOpacity: 0,
          transition: { duration: FILL_DURATION, ease: FILL_EASE },
        });
      });

      schedule(SHAPE_TIMING[1].fill, () => {
        if (generationRef.current !== gen) return;
        ctrl2.start({
          fillOpacity: 1,
          strokeOpacity: 0,
          transition: { duration: FILL_DURATION, ease: FILL_EASE },
        });
      });

      schedule(SHAPE_TIMING[2].fill, () => {
        if (generationRef.current !== gen) return;
        ctrl3.start({
          fillOpacity: 1,
          strokeOpacity: 0,
          transition: { duration: FILL_DURATION, ease: FILL_EASE },
        });
      });
    }, [prefersReducedMotion, disabled, clearTimeouts, ctrl1, ctrl2, ctrl3]);

    // Freeze all shapes at their current frame.
    const stopAnimation = useCallback(() => {
      clearTimeouts();
      generationRef.current++;
      ctrl1.stop();
      ctrl2.stop();
      ctrl3.stop();
    }, [clearTimeouts, ctrl1, ctrl2, ctrl3]);

    // Return to the resting filled state immediately.
    const resetAnimation = useCallback(() => {
      snapToFilled();
    }, [snapToFilled]);

    // Expose the imperative handle.
    useImperativeHandle(
      ref,
      () => ({ startAnimation, stopAnimation, resetAnimation }),
      [startAnimation, stopAnimation, resetAnimation]
    );

    // ─── Event handlers ────────────────────────────────────────────────────────

    const onMouseEnter =
      trigger === 'hover' && !disabled ? startAnimation : undefined;
    const onMouseLeave =
      trigger === 'hover' && !disabled ? snapToFilled : undefined;
    const onPointerDown =
      trigger === 'press' && !disabled ? startAnimation : undefined;
    const onFocus =
      trigger === 'focus' && !disabled ? startAnimation : undefined;
    const onBlur =
      trigger === 'focus' && !disabled ? snapToFilled : undefined;

    // ─── Accessibility ─────────────────────────────────────────────────────────
    //
    // aria-label provided → informative icon (has semantic meaning on its own).
    // aria-label absent   → decorative icon (parent element provides context).

    const accessibilityProps = ariaLabel
      ? ({ role: 'img', 'aria-label': ariaLabel } as const)
      : ({ 'aria-hidden': true } as const);

    // ─── Shared path props ─────────────────────────────────────────────────────

    const sharedPathProps = {
      fill: color,
      stroke: color,
      strokeWidth,
      strokeLinecap: 'round' as const,
      strokeLinejoin: 'round' as const,
    };

    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width={size}
        height={size}
        className={className}
        style={{
          color,
          display: 'block',
          ...(disabled && { pointerEvents: 'none' }),
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onPointerDown={onPointerDown}
        onFocus={onFocus}
        onBlur={onBlur}
        {...accessibilityProps}
      >
        {/* Shape 1 — circle (leftmost, draws first) */}
        <motion.path
          d="M7.57 17.576a5.57 5.57 0 1 0 0-11.141a5.57 5.57 0 0 0 0 11.141"
          initial={FILLED_STATE}
          animate={ctrl1}
          {...sharedPathProps}
        />

        {/* Shape 2 — vertical ellipse (center, draws second) */}
        <motion.path
          d="M16.514 17.143c1.512 0 2.738-2.3 2.738-5.138s-1.226-5.137-2.738-5.137s-2.738 2.3-2.738 5.137c0 2.838 1.226 5.138 2.738 5.138"
          initial={FILLED_STATE}
          animate={ctrl2}
          {...sharedPathProps}
        />

        {/* Shape 3 — narrow pill (rightmost, draws last) */}
        <motion.path
          d="M20.922 16.604c.59 0 1.067-2.06 1.067-4.599s-.478-4.598-1.067-4.598c-.59 0-1.068 2.059-1.068 4.598c0 2.54.478 4.599 1.068 4.599"
          initial={FILLED_STATE}
          animate={ctrl3}
          {...sharedPathProps}
        />
      </svg>
    );
  }
);
