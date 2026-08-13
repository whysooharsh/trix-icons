'use client';

/**
 * Story: heart outline forms → completes → beats twice with small physical pulse → settles.
 */

import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { motion, useAnimation, useReducedMotion } from 'motion/react';
import type { AnimatedIconHandle, AnimatedIconProps } from '@trix/core';
import { EASE_DRAW, EASE_STANDARD } from '@trix/core';

const DURATION_DRAW = 0.28;
const DURATION_BEAT = 0.32;

export const HeartIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  function HeartIcon(
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

      // Phase 1: Heart outline forms
      await ctrl.start({
        pathLength: [0, 1],
        scale: 1,
        transition: { duration: DURATION_DRAW, ease: EASE_DRAW },
      });

      // Phase 2: Rhythmic double heartbeat pulse
      await ctrl.start({
        scale: [1, 1.12, 0.98, 1.06, 1],
        transition: { duration: DURATION_BEAT, ease: EASE_STANDARD },
      });

      ctrl.set({ pathLength: 1, scale: 1 });
      isAnimatingRef.current = false;
    }, [ctrl, prefersReducedMotion, disabled]);

    const stopAnimation = useCallback(() => {
      isAnimatingRef.current = false;
      ctrl.stop();
    }, [ctrl]);

    const resetAnimation = useCallback(() => {
      isAnimatingRef.current = false;
      ctrl.stop();
      ctrl.set({ pathLength: 1, scale: 1 });
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
        <motion.path
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          initial={{ pathLength: 1, scale: 1 }}
          animate={ctrl}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        />
      </svg>
    );
  }
);
