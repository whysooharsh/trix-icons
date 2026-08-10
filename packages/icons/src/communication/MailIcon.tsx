'use client';

/**
 * MailIcon — Animated envelope
 *
 * Animation: path-morph
 * On hover the envelope flap lifts upward: the outline path morphs so that
 * the flap peak rises from y=5 (closed, flush with the rim) to y=0 (open,
 * 5 units above the rim). The inner V-crease morphs simultaneously from the
 * outer envelope corners to slightly inward, reading as the pocket seam
 * beneath the open flap. Both paths reverse smoothly on hover-leave.
 *
 * Both path pairs share identical SVG command structures (M, a, L, L, a, v,
 * a, H, a, Z for the outline; M, L, L for the crease) — only coordinate
 * values change — enabling smooth browser interpolation via motion/react's
 * `d` attribute animation.
 *
 * Morph easing: cubic-bezier(0.65, 0, 0.35, 1) — strong ease-in-out
 * matching the SMIL original's keySplines="0.65 0 0.35 1".
 *
 * Reduced motion: static — no animation plays.
 */

import { forwardRef, useCallback, useImperativeHandle } from 'react';
import { motion, useAnimation, useReducedMotion } from 'motion/react';
import type { AnimatedIconHandle, AnimatedIconProps } from '@trix/core';

// ─── Path constants ───────────────────────────────────────────────────────────
//
// Both states use identical command types; only coordinates differ.
// This is the prerequisite for motion/react's `d` attribute interpolation.

/** Envelope outline — flap peak at y=5, flush with the top of the body. */
const OUTLINE_CLOSED =
  'M3 7a2 2 0 0 1 2-2L12 5L19 5a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z';

/** Envelope outline — flap peak rises to y=0, 5 units above the rim. */
const OUTLINE_OPEN =
  'M3 7a2 2 0 0 1 2-2L12 0L19 5a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z';

/** Inner crease — starts at the outer envelope top corners, dips to centre. */
const CREASE_CLOSED = 'M3 7L12 13L21 7';

/** Inner crease — starts slightly inward as the flap lifts clear of the corners. */
const CREASE_OPEN = 'M5 5L12 13L19 5';

// Easing matches the SMIL original's keySplines="0.65 0 0.35 1".
const MORPH_EASE = [0.65, 0, 0.35, 1] as const;
const MORPH_DURATION = 0.35; // seconds

// ─── Component ────────────────────────────────────────────────────────────────

export const MailIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  function MailIcon(
    {
      size = 24,
      color = 'currentColor',
      strokeWidth = 2,
      className,
      trigger = 'hover',
      disabled = false,
      'aria-label': ariaLabel,
    },
    ref
  ) {
    const outlineCtrl = useAnimation();
    const creaseCtrl = useAnimation();
    const prefersReducedMotion = useReducedMotion();

    // Morph both paths to the open (hover) state.
    const startAnimation = useCallback(() => {
      if (prefersReducedMotion || disabled) return;
      const t = { duration: MORPH_DURATION, ease: MORPH_EASE };
      outlineCtrl.start({ d: OUTLINE_OPEN, transition: t });
      creaseCtrl.start({ d: CREASE_OPEN, transition: t });
    }, [prefersReducedMotion, disabled, outlineCtrl, creaseCtrl]);

    // Freeze at current frame.
    const stopAnimation = useCallback(() => {
      outlineCtrl.stop();
      creaseCtrl.stop();
    }, [outlineCtrl, creaseCtrl]);

    // Morph both paths back to the closed (rest) state.
    const resetAnimation = useCallback(() => {
      const t = { duration: MORPH_DURATION, ease: MORPH_EASE };
      outlineCtrl.start({ d: OUTLINE_CLOSED, transition: t });
      creaseCtrl.start({ d: CREASE_CLOSED, transition: t });
    }, [outlineCtrl, creaseCtrl]);

    useImperativeHandle(
      ref,
      () => ({ startAnimation, stopAnimation, resetAnimation }),
      [startAnimation, stopAnimation, resetAnimation]
    );

    // ─── Event handlers ───────────────────────────────────────────────────────

    const onMouseEnter = trigger === 'hover' && !disabled ? startAnimation : undefined;
    const onMouseLeave = trigger === 'hover' && !disabled ? resetAnimation : undefined;
    const onPointerDown = trigger === 'press' && !disabled ? startAnimation : undefined;
    const onPointerUp = trigger === 'press' && !disabled ? resetAnimation : undefined;
    const onFocus = trigger === 'focus' && !disabled ? startAnimation : undefined;
    const onBlur = trigger === 'focus' && !disabled ? resetAnimation : undefined;

    const accessibilityProps = ariaLabel
      ? ({ role: 'img', 'aria-label': ariaLabel } as const)
      : ({ 'aria-hidden': true } as const);

    // Shared stroke props for both paths.
    const sharedPathProps = {
      fill: 'none' as const,
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
          // overflow: visible so the open flap (peak at y=0) renders fully
          // even though its stroke would otherwise clip at the viewBox edge.
          overflow: 'visible',
          ...(disabled && { pointerEvents: 'none' }),
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onFocus={onFocus}
        onBlur={onBlur}
        {...accessibilityProps}
      >
        {/* Envelope outline — flap lifts on hover */}
        <motion.path
          animate={outlineCtrl}
          initial={{ d: OUTLINE_CLOSED }}
          {...sharedPathProps}
        />

        {/* Inner V crease — shifts inward as the flap rises */}
        <motion.path
          animate={creaseCtrl}
          initial={{ d: CREASE_CLOSED }}
          {...sharedPathProps}
        />
      </svg>
    );
  }
);
