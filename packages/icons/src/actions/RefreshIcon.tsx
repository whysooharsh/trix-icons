'use client';

/**
 * Story: sync/reload mechanism rotates through a complete 360° cycle → settles into rest position.
 */

import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { motion, useAnimation, useReducedMotion } from 'motion/react';
import type { AnimatedIconHandle, AnimatedIconProps } from '@trix/core';
import { EASE_SETTLE } from '@trix/core';

const DURATION = 0.5;

export const RefreshIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  function RefreshIcon(
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
    const isAnimatingRef = useRef(false);

    const startAnimation = useCallback(async () => {
      if (prefersReducedMotion || disabled || isAnimatingRef.current) return;
      isAnimatingRef.current = true;

      await ctrl.start({
        rotate: [0, 360],
        transition: {
          duration: DURATION,
          ease: EASE_SETTLE,
        },
      });

      ctrl.set({ rotate: 0 });
      isAnimatingRef.current = false;
    }, [ctrl, prefersReducedMotion, disabled]);

    const stopAnimation = useCallback(() => {
      isAnimatingRef.current = false;
      ctrl.stop();
    }, [ctrl]);

    const resetAnimation = useCallback(() => {
      isAnimatingRef.current = false;
      ctrl.stop();
      ctrl.set({ rotate: 0 });
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
        <motion.g
          animate={ctrl}
          initial={{ rotate: 0 }}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        >
          {/* Top arc and arrowhead */}
          <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />

          {/* Bottom arc and arrowhead */}
          <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
          <path d="M21 21v-5h-5" />
        </motion.g>
      </svg>
    );
  }
);
