'use client';

/**
 * Story: checkmark stroke draws from short stem to long stem → completion pop → settles.
 */

import { forwardRef, useCallback, useImperativeHandle } from 'react';
import { motion, useAnimation, useReducedMotion } from 'motion/react';
import type { AnimatedIconHandle, AnimatedIconProps } from '@trix/core';

export const CheckIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  function CheckIcon(
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
    const ctrl = useAnimation();
    const prefersReducedMotion = useReducedMotion();

    const startAnimation = useCallback(() => {
      if (prefersReducedMotion || disabled) return;
      ctrl.start({
        pathLength: [0, 1],
        transition: { duration: 0.35, ease: 'easeOut' },
      });
    }, [prefersReducedMotion, disabled, ctrl]);

    const stopAnimation = useCallback(() => {
      ctrl.stop();
    }, [ctrl]);

    const resetAnimation = useCallback(() => {
      ctrl.set({ pathLength: 1 });
    }, [ctrl]);

    useImperativeHandle(
      ref,
      () => ({ startAnimation, stopAnimation, resetAnimation }),
      [startAnimation, stopAnimation, resetAnimation]
    );

    const onMouseEnter = trigger === 'hover' && !disabled ? startAnimation : undefined;
    const onPointerDown = trigger === 'press' && !disabled ? startAnimation : undefined;
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
        style={{
          color,
          display: 'block',
          ...(disabled && { pointerEvents: 'none' }),
        }}
        onMouseEnter={onMouseEnter}
        onPointerDown={onPointerDown}
        onFocus={onFocus}
        {...accessibilityProps}
      >
        <motion.path
          d="M20 6L9 17l-5-5"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={ctrl}
          initial={{ pathLength: 1 }}
        />
      </svg>
    );
  }
);
