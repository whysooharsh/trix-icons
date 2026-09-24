'use client';

/**
 * Story: inscribing the addition — the vertical bar draws itself top to
 * bottom over the stationary horizontal bar. The plus is written, not
 * decorated.
 */

import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { motion, useAnimation, useReducedMotion } from 'motion/react';
import type { AnimatedIconHandle, AnimatedIconProps } from '@trix/core';
import { EASE_DRAW } from '@trix/core';

const DURATION = 0.25;

export const PlusIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  function PlusIcon(
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
    const vertCtrl = useAnimation();
    const prefersReducedMotion = useReducedMotion();
    const isAnimatingRef = useRef(false);

    const startAnimation = useCallback(async () => {
      if (prefersReducedMotion || disabled || isAnimatingRef.current) return;
      isAnimatingRef.current = true;

      await vertCtrl.start({
        pathLength: [0, 1],
        transition: { duration: DURATION, ease: EASE_DRAW },
      });

      vertCtrl.set({ pathLength: 1 });
      isAnimatingRef.current = false;
    }, [vertCtrl, prefersReducedMotion, disabled]);

    const stopAnimation = useCallback(() => {
      isAnimatingRef.current = false;
      vertCtrl.stop();
    }, [vertCtrl]);

    const resetAnimation = useCallback(() => {
      isAnimatingRef.current = false;
      vertCtrl.stop();
      vertCtrl.set({ pathLength: 1 });
    }, [vertCtrl]);

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
        <path d="M5 12h14" />
        <motion.path d="M12 5v14" animate={vertCtrl} initial={{ pathLength: 1 }} />
      </svg>
    );
  }
);
