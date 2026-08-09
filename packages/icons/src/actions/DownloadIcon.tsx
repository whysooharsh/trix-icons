'use client';

import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { motion, useAnimation, useReducedMotion } from 'motion/react';
import type { AnimatedIconHandle, AnimatedIconProps } from '@trix/core';

export const DownloadIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  function DownloadIcon(
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
        y: [0, 3, 0],
        transition: { duration: 0.35, ease: 'easeInOut' },
      });
    }, [prefersReducedMotion, disabled, ctrl]);

    const stopAnimation = useCallback(() => {
      ctrl.stop();
    }, [ctrl]);

    const resetAnimation = useCallback(() => {
      ctrl.set({ y: 0 });
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
          d="M12 3v12m0 0l-4-4m4 4l4-4"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={ctrl}
          initial={{ y: 0 }}
        />
        <path
          d="M4 21h16"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
);
