'use client';

import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { motion, useAnimation, useReducedMotion } from 'motion/react';
import type { AnimatedIconHandle, AnimatedIconProps } from '@trix/core';

// ─── Animation keyframes ──────────────────────────────────────────────────────
// Narrative: Search around (arc loop) → return to center → "aha, found it!" pop → settle.

const DURATION = 0.58;
const EASE = 'easeInOut' as const;

const X_KF = [0, -2.5, 0, 2.5, 0, 0] as const;
const Y_KF = [0, -1.5, -2.5, -1.0, 0, 0] as const;
const ROTATE_KF = [0, -6, 4, 6, 0, 0] as const;
const SCALE_KF = [1, 1, 1, 1, 1.08, 1] as const;
const TIMES_KF = [0, 0.2, 0.4, 0.65, 0.85, 1] as const;

export const SearchIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  function SearchIcon(
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
    const prefersReducedMotion = useReducedMotion();
    const ctrl = useAnimation();
    const isAnimatingRef = useRef(false);

    const startAnimation = useCallback(async () => {
      if (prefersReducedMotion || disabled || isAnimatingRef.current) return;
      isAnimatingRef.current = true;

      await ctrl.start({
        x: [...X_KF],
        y: [...Y_KF],
        rotate: [...ROTATE_KF],
        scale: [...SCALE_KF],
        transition: {
          duration: DURATION,
          ease: EASE,
          times: [...TIMES_KF],
        },
      });

      ctrl.set({ x: 0, y: 0, rotate: 0, scale: 1 });
      isAnimatingRef.current = false;
    }, [ctrl, prefersReducedMotion, disabled]);

    const stopAnimation = useCallback(() => {
      isAnimatingRef.current = false;
      ctrl.stop();
    }, [ctrl]);

    const resetAnimation = useCallback(() => {
      isAnimatingRef.current = false;
      ctrl.stop();
      ctrl.set({ x: 0, y: 0, rotate: 0, scale: 1 });
    }, [ctrl]);

    useImperativeHandle(
      ref,
      () => ({ startAnimation, stopAnimation, resetAnimation }),
      [startAnimation, stopAnimation, resetAnimation]
    );

    const onMouseEnter = trigger === 'hover' && !disabled ? startAnimation : undefined;
    const onPointerDown = (trigger === 'hover' || trigger === 'press') && !disabled ? startAnimation : undefined;
    const onFocus = trigger === 'focus' && !disabled ? startAnimation : undefined;

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
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ color, display: 'block', overflow: 'visible', ...(disabled && { pointerEvents: 'none' }) }}
        onMouseEnter={onMouseEnter}
        onPointerDown={onPointerDown}
        onFocus={onFocus}
        {...accessibilityProps}
      >
        <motion.g
          animate={ctrl}
          initial={{ x: 0, y: 0, rotate: 0, scale: 1 }}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        >
          <circle cx="9.5" cy="9.5" r="5.5" />
          <line x1="13.4" y1="13.4" x2="20" y2="20" />
        </motion.g>
      </svg>
    );
  }
);
