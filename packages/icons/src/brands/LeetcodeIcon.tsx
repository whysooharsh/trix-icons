'use client';

/**
 * LeetcodeIcon — Animated LeetCode logo mark
 *
 * Animation: stroke-draw-to-fill
 * The entire mark traces itself in one continuous gesture (1.1s), then
 * crossfades from stroke to fill starting 950ms in — 150ms before
 * the draw completes. The slight overlap prevents a hard stop-then-transition.
 *
 * SVG coordinate system: 0 0 128 128 (documented deviation from the 24×24 standard).
 * The rendered size is controlled by the size prop; the viewBox handles scaling.
 *
 * Provenance: third-party trademark of LeetCode LLC.
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
// These preserve the timing character of the original HTML experiment.
// The draw is deliberately long (1.1s) — the path is complex and the
// weighted ease-in-out gives the gesture a confident, unhurried quality.

const DRAW_DURATION = 1.1; // seconds — one continuous gesture
const DRAW_EASE: [number, number, number, number] = [0.65, 0, 0.35, 1];

// Fill crossfade begins 950ms into the draw (150ms before the draw ends).
// The 150ms overlap means stroke and fill are briefly concurrent, creating
// a smooth dissolution rather than a hard cut from stroke to fill.
const FILL_START_MS = 950; // milliseconds from animation start
const FILL_DURATION = 0.5; // seconds
const FILL_EASE = 'easeOut' as const;

// strokeWidth defaults to 10 for this icon's 128×128 coordinate space.
// This is equivalent to ~1.9px at a 24px rendered size (10 × 24/128 ≈ 1.9).
// Using the standard prop default of 2 would render as 0.375px at 24px — invisible.
const DEFAULT_STROKE_WIDTH = 10;

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

export const LeetcodeIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  function LeetcodeIcon(
    {
      size = 24,
      color = 'currentColor',
      // strokeWidth defaults to 10 for the 128×128 coordinate system.
      // See DEFAULT_STROKE_WIDTH comment above.
      strokeWidth = DEFAULT_STROKE_WIDTH,
      className,
      trigger = 'hover',
      disabled = false,
      'aria-label': ariaLabel,
    },
    ref
  ) {
    const ctrl = useAnimation();
    const prefersReducedMotion = useReducedMotion();

    // Generation counter — incremented on every new play or cancel.
    // The fill crossfade timeout checks this before running.
    const generationRef = useRef(0);

    // All scheduled timeout IDs, cleared on every play or cancel.
    const timeoutIds = useRef<ReturnType<typeof setTimeout>[]>([]);

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

    // Instantly snap the mark to the filled resting state.
    const snapToFilled = useCallback(() => {
      clearTimeouts();
      generationRef.current++;
      ctrl.set(FILLED_STATE);
    }, [clearTimeouts, ctrl]);

    // Play the full animation sequence.
    const startAnimation = useCallback(() => {
      if (prefersReducedMotion || disabled) return;

      clearTimeouts();
      const gen = ++generationRef.current;

      // Phase 0: snap to drawing start state (instant).
      ctrl.set(STROKE_STATE);

      // Phase 1: draw the entire path in one continuous gesture.
      ctrl.start({
        pathLength: 1,
        transition: { duration: DRAW_DURATION, ease: DRAW_EASE },
      });

      // Phase 2: begin fill crossfade 950ms in — before the draw completes.
      // The fillOpacity and strokeOpacity animate concurrently with the
      // final portion of the pathLength animation.
      timeoutIds.current.push(
        setTimeout(() => {
          if (generationRef.current !== gen) return;
          ctrl.start({
            fillOpacity: 1,
            strokeOpacity: 0,
            transition: { duration: FILL_DURATION, ease: FILL_EASE },
          });
        }, FILL_START_MS)
      );
    }, [prefersReducedMotion, disabled, clearTimeouts, ctrl]);

    // Freeze the mark at its current frame.
    const stopAnimation = useCallback(() => {
      clearTimeouts();
      generationRef.current++;
      ctrl.stop();
    }, [clearTimeouts, ctrl]);

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

    const accessibilityProps = ariaLabel
      ? ({ role: 'img', 'aria-label': ariaLabel } as const)
      : ({ 'aria-hidden': true } as const);

    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 128 128"
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
        <motion.path
          d="M76.992.002C75.171-.035 73.362.627 72 1.998l-53.432 53.87c-5.19 5.237-7.904 12.464-7.904 20.454s2.715 15.447 7.904 20.674l23.004 23.26c5.19 5.221 12.363 7.744 20.283 7.744s15.095-2.731 20.295-7.969l13.803-14.064c2.72-2.742 2.625-7.281-.207-10.135s-7.334-2.948-10.049-.207l-14.273 13.904c-2.464 2.491-5.878 3.532-9.649 3.532s-7.18-1.04-9.654-3.532L29.197 86.26c-2.47-2.49-3.71-6.134-3.71-9.937s1.24-7.237 3.71-9.728l22.856-23.362c2.47-2.49 5.953-3.439 9.718-3.439c3.766 0 7.18 1.038 9.649 3.53l14.271 13.9c2.72 2.746 7.223 2.65 10.055-.203c2.832-2.86 2.927-7.398.207-10.14L82.15 32.823c-3.461-3.445-7.845-5.952-12.757-7.093l-.182-.04l13.05-13.35c2.732-2.74 2.636-7.284-.197-10.138a7.36 7.36 0 0 0-5.072-2.2M56.937 69.379c-3.712 0-6.718 3.22-6.718 7.178s3.001 7.18 6.718 7.18h53.678c3.712.005 6.72-3.217 6.72-7.18c0-3.958-3.008-7.178-6.72-7.178z"
          fill={color}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={FILLED_STATE}
          animate={ctrl}
        />
      </svg>
    );
  }
);
