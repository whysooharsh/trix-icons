'use client';

/**
 * Story: handset shifts and rotates into answered position → settles.
 */

import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { motion, useAnimation, useReducedMotion } from 'motion/react';
import type { AnimatedIconHandle, AnimatedIconProps } from '@trix/core';
import { EASE_BOUNCE, EASE_STANDARD } from '@trix/core';

const DURATION = 0.45;

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
    const isAnimatingRef = useRef(false);

    const startAnimation = useCallback(async () => {
      if (prefersReducedMotion || disabled || isAnimatingRef.current) return;
      isAnimatingRef.current = true;

      // Handset lifts and rotates into answered orientation
      await ctrl.start({
        rotate: [0, 18, -4, 0],
        x: [0, -1.5, 0],
        y: [0, -1.5, 0],
        transition: {
          duration: DURATION,
          ease: EASE_STANDARD,
        },
      });

      ctrl.set({ rotate: 0, x: 0, y: 0 });
      isAnimatingRef.current = false;
    }, [ctrl, prefersReducedMotion, disabled]);

    const stopAnimation = useCallback(() => {
      isAnimatingRef.current = false;
      ctrl.stop();
    }, [ctrl]);

    const resetAnimation = useCallback(() => {
      isAnimatingRef.current = false;
      ctrl.stop();
      ctrl.set({ rotate: 0, x: 0, y: 0 });
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
          initial={{ rotate: 0, x: 0, y: 0 }}
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
