'use client';

/**
 * Story: re-crossing — the backslash unwrites, the slash follows, then both
 * rewrite in reverse order. The dismissal gesture re-enacted.
 */

import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { motion, useAnimation, useReducedMotion } from 'motion/react';
import type { AnimatedIconHandle, AnimatedIconProps } from '@trix/core';
import { EASE_DRAW } from '@trix/core';

const DURATION_STROKE = 0.12;

export const CloseIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  function CloseIcon(
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
    const backCtrl = useAnimation();
    const slashCtrl = useAnimation();
    const prefersReducedMotion = useReducedMotion();
    const isAnimatingRef = useRef(false);

    const startAnimation = useCallback(async () => {
      if (prefersReducedMotion || disabled || isAnimatingRef.current) return;
      isAnimatingRef.current = true;

      await backCtrl.start({
        pathLength: [1, 0],
        transition: { duration: DURATION_STROKE, ease: EASE_DRAW },
      });
      await slashCtrl.start({
        pathLength: [1, 0],
        transition: { duration: DURATION_STROKE, ease: EASE_DRAW },
      });
      await Promise.all([
        slashCtrl.start({
          pathLength: [0, 1],
          transition: { duration: DURATION_STROKE, ease: EASE_DRAW },
        }),
        backCtrl.start({
          pathLength: [0, 1],
          transition: { delay: DURATION_STROKE, duration: DURATION_STROKE, ease: EASE_DRAW },
        }),
      ]);

      backCtrl.set({ pathLength: 1 });
      slashCtrl.set({ pathLength: 1 });
      isAnimatingRef.current = false;
    }, [backCtrl, slashCtrl, prefersReducedMotion, disabled]);

    const stopAnimation = useCallback(() => {
      isAnimatingRef.current = false;
      backCtrl.stop();
      slashCtrl.stop();
    }, [backCtrl, slashCtrl]);

    const resetAnimation = useCallback(() => {
      isAnimatingRef.current = false;
      backCtrl.stop();
      slashCtrl.stop();
      backCtrl.set({ pathLength: 1 });
      slashCtrl.set({ pathLength: 1 });
    }, [backCtrl, slashCtrl]);

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
        style={{
          color,
          display: 'block',
          overflow: 'visible',
          ...(disabled && { pointerEvents: 'none' }),
        }}
        onMouseEnter={onMouseEnter}
        onPointerDown={onPointerDown}
        onFocus={onFocus}
        {...accessibilityProps}
      >
        <motion.path d="M18 6 6 18" animate={backCtrl} initial={{ pathLength: 1 }} />
        <motion.path d="M6 6l12 12" animate={slashCtrl} initial={{ pathLength: 1 }} />
      </svg>
    );
  }
);
