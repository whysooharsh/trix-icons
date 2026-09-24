'use client';

/**
 * Story: ignition — the flame flares with thermal expansion, pivoting at its
 * base so it stays grounded to its fuel source, while two embers break off
 * and rise. One-shot, ends at rest.
 */

import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { motion, useAnimation, useReducedMotion } from 'motion/react';
import type { AnimatedIconHandle, AnimatedIconProps } from '@trix/core';

const DURATION_FLARE = 0.65;

const FLAME_REST = { scaleX: 1, scaleY: 1, skewX: 0 };
const SPARK_REST = { opacity: 0, scale: 0, x: 0, y: 0 };

export const FlameIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  function FlameIcon(
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
    const flameCtrl = useAnimation();
    const spark1Ctrl = useAnimation();
    const spark2Ctrl = useAnimation();
    const prefersReducedMotion = useReducedMotion();
    const isAnimatingRef = useRef(false);

    const startAnimation = useCallback(async () => {
      if (prefersReducedMotion || disabled || isAnimatingRef.current) return;
      isAnimatingRef.current = true;

      try {
        flameCtrl.start({
          scaleY: [1, 1.12, 0.96, 1.04, 1],
          scaleX: [1, 0.92, 1.04, 0.98, 1],
          skewX: [0, -3, 2, -1, 0],
          transition: {
            duration: DURATION_FLARE,
            ease: 'easeInOut',
            times: [0, 0.2, 0.5, 0.75, 1],
          },
        });

        spark1Ctrl.start({
          y: [0, -18],
          x: [0, -8],
          opacity: [0, 1, 0],
          scale: [0.5, 1, 0.5],
          transition: { duration: 0.5, ease: 'easeOut', delay: 0.05 },
        });

        await spark2Ctrl.start({
          y: [0, -22],
          x: [0, 10],
          opacity: [0, 1, 0],
          scale: [0.5, 1, 0.5],
          transition: { duration: 0.55, ease: 'easeOut', delay: 0.1 },
        });
      } finally {
        flameCtrl.set(FLAME_REST);
        spark1Ctrl.set(SPARK_REST);
        spark2Ctrl.set(SPARK_REST);
        isAnimatingRef.current = false;
      }
    }, [flameCtrl, spark1Ctrl, spark2Ctrl, prefersReducedMotion, disabled]);

    const stopAnimation = useCallback(() => {
      isAnimatingRef.current = false;
      flameCtrl.stop();
      spark1Ctrl.stop();
      spark2Ctrl.stop();
    }, [flameCtrl, spark1Ctrl, spark2Ctrl]);

    const resetAnimation = useCallback(() => {
      isAnimatingRef.current = false;
      flameCtrl.stop();
      spark1Ctrl.stop();
      spark2Ctrl.stop();
      flameCtrl.set(FLAME_REST);
      spark1Ctrl.set(SPARK_REST);
      spark2Ctrl.set(SPARK_REST);
    }, [flameCtrl, spark1Ctrl, spark2Ctrl]);

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
        viewBox="0 0 56 56"
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
        <motion.circle
          cx="18"
          cy="24"
          r="1.5"
          fill={color}
          animate={spark1Ctrl}
          initial={SPARK_REST}
        />

        <motion.circle
          cx="38"
          cy="18"
          r="2"
          fill={color}
          animate={spark2Ctrl}
          initial={SPARK_REST}
        />

        <motion.path
          fill={color}
          d="M8.184 37.398c0 9.75 7.453 16.243 18.632 16.243c12.586 0 21-8.485 21-21.258c0-21.211-18.093-30.024-30.398-30.024c-2.461 0-4.055.868-4.055 2.579c0 .656.282 1.359.797 1.945c2.742 3.305 5.531 7.125 5.602 11.601c0 .422 0 .82-.047 1.243c-1.313-2.461-3.516-4.22-5.766-4.22c-1.125 0-1.922.821-1.922 2.063c0 .586.188 2.04.188 3.047c0 4.899-4.031 8.203-4.031 16.781m3.89 0c0-7.265 4.008-10.289 4.196-17.015c1.335 1.687 2.296 3.726 2.625 6.656c.046.469.328.656.75.656c2.226 0 3.515-5.648 3.515-9.21c0-4.571-1.945-9.352-4.969-12.422C34.223 7.352 43.785 18.25 43.785 32.219c0 10.547-6.68 17.554-16.664 17.554c-9.047 0-15.047-4.945-15.047-12.375m15.375 9.657c5.742 0 8.555-4.22 8.555-9c0-4.735-2.719-10.008-8.063-12.47c-.21-.093-.351.024-.328.259c.305 4.054.07 7.289-1.148 9.422c-.14.21-.305.187-.399-.047c-.562-1.407-1.265-2.602-2.367-3.586c-.187-.164-.328-.094-.351.14c-.399 2.72-3.422 4.243-3.422 8.508c0 4.055 3 6.774 7.523 6.774"
          style={{ originX: '28px', originY: '53.6px' }}
          animate={flameCtrl}
          initial={FLAME_REST}
        />
      </svg>
    );
  }
);
