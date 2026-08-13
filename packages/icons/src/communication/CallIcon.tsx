'use client';

/**
 * Story: handset jiggles with decaying physical ring vibration → settles into rest.
 *
 * Animation: physical-swing
 * On hover the handset decays through a ring-vibration jitter:
 * rotation oscillates ±10° → 0° while a horizontal buzz of ±0.6px
 * layers on top. The full 0.6s decay sequence loops continuously
 * while hovered and snaps to rest the moment the cursor leaves.
 *
 * The jitter keyframes are taken directly from the user's SMIL original
 * (animateTransform type="rotate" + type="translate") and replayed
 * here via motion/react's keyframe array syntax.
 *
 * Reduced motion: static — no animation plays.
 */

import { forwardRef, useCallback, useImperativeHandle } from 'react';
import { motion, useAnimation, useReducedMotion } from 'motion/react';
import type { AnimatedIconHandle, AnimatedIconProps } from '@trix/core';

// ─── Jitter keyframes ─────────────────────────────────────────────────────────
//
// Nine steps of decaying amplitude matching the SMIL original exactly.
// Rotation (degrees) and horizontal translation (SVG units) share the same
// easing and timing array so they stay in phase throughout each cycle.

const ROTATE_KF = [0, -10, 9, -8, 7, -5, 4, -2, 1, 0] as const;
const X_KF = [0, 0.6, -0.6, 0.5, -0.5, 0.3, -0.3, 0.15, -0.15, 0] as const;
const KF_TIMES = [0, 0.11, 0.22, 0.33, 0.44, 0.55, 0.66, 0.77, 0.88, 1] as const;

// ─── Component ────────────────────────────────────────────────────────────────

export const CallIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  function CallIcon(
    {
      size = 24,
      color = 'currentColor',
      className,
      trigger = 'hover',
      disabled = false,
      'aria-label': ariaLabel,
    },
    ref
  ) {
    const ctrl = useAnimation();
    const prefersReducedMotion = useReducedMotion();

    // Immediately stop the jitter and return to resting orientation.
    // Called on hover-leave, blur, pointer-up, stopAnimation, resetAnimation.
    const snapToRest = useCallback(() => {
      ctrl.stop();
      ctrl.set({ rotate: 0, x: 0 });
    }, [ctrl]);

    // Start the continuous decay-jitter loop.
    const startAnimation = useCallback(() => {
      if (prefersReducedMotion || disabled) return;
      ctrl.start({
        rotate: [...ROTATE_KF],
        x: [...X_KF],
        transition: {
          duration: 0.6,
          ease: 'easeInOut',
          times: [...KF_TIMES],
          repeat: Infinity,
        },
      });
    }, [prefersReducedMotion, disabled, ctrl]);

    const stopAnimation = useCallback(() => snapToRest(), [snapToRest]);
    const resetAnimation = useCallback(() => snapToRest(), [snapToRest]);

    useImperativeHandle(
      ref,
      () => ({ startAnimation, stopAnimation, resetAnimation }),
      [startAnimation, stopAnimation, resetAnimation]
    );

    // ─── Event handlers ───────────────────────────────────────────────────────

    const onMouseEnter = trigger === 'hover' && !disabled ? startAnimation : undefined;
    const onMouseLeave = trigger === 'hover' && !disabled ? snapToRest : undefined;
    const onPointerDown = trigger === 'press' && !disabled ? startAnimation : undefined;
    const onPointerUp = trigger === 'press' && !disabled ? snapToRest : undefined;
    const onFocus = trigger === 'focus' && !disabled ? startAnimation : undefined;
    const onBlur = trigger === 'focus' && !disabled ? snapToRest : undefined;

    const accessibilityProps = ariaLabel
      ? ({ role: 'img', 'aria-label': ariaLabel } as const)
      : ({ 'aria-hidden': true } as const);

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
        onPointerUp={onPointerUp}
        onFocus={onFocus}
        onBlur={onBlur}
        {...accessibilityProps}
      >
        {/*
          transform-box: fill-box + transform-origin: center matches
          transform-origin="12 12" from the SMIL original, keeping the
          rotation pivot at the icon's geometric centre.
        */}
        <motion.g
          animate={ctrl}
          initial={{ rotate: 0, x: 0 }}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        >
          <path
            fill={color}
            d="M19.95 21q-3.125 0-6.175-1.362t-5.55-3.863t-3.862-5.55T3 4.05q0-.45.3-.75t.75-.3H8.1q.35 0 .625.238t.325.562l.65 3.5q.05.4-.025.675T9.4 8.45L6.975 10.9q.5.925 1.187 1.787t1.513 1.663q.775.775 1.625 1.438T13.1 17l2.35-2.35q.225-.225.588-.337t.712-.063l3.45.7q.35.1.575.363T21 15.9v4.05q0 .45-.3.75t-.75.3"
          />
        </motion.g>
      </svg>
    );
  }
);
