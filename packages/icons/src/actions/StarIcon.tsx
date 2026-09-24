'use client';

/**
 * Story: celebration — the star squashes in anticipation, bursts with a
 * twist, and settles while three sparkles break off in staggered directions.
 * One-shot, ends at rest.
 */

import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { motion, useAnimation, useReducedMotion } from 'motion/react';
import type { AnimatedIconHandle, AnimatedIconProps } from '@trix/core';

const DURATION_BURST = 0.65;

const SPARKLE_POINTS = '512,432 520,504 592,512 520,520 512,592 504,520 432,512 504,504';

const STAR_REST = { scale: 1, rotate: 0 };
const SPARK_REST = { opacity: 0, scale: 0, x: 0, y: 0, rotate: 0 };

export const StarIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  function StarIcon(
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
    const starCtrl = useAnimation();
    const spark1Ctrl = useAnimation();
    const spark2Ctrl = useAnimation();
    const spark3Ctrl = useAnimation();
    const prefersReducedMotion = useReducedMotion();
    const isAnimatingRef = useRef(false);

    const startAnimation = useCallback(async () => {
      if (prefersReducedMotion || disabled || isAnimatingRef.current) return;
      isAnimatingRef.current = true;

      try {
        starCtrl.start({
          scale: [1, 0.75, 1.15, 0.95, 1],
          rotate: [0, -15, 18, -6, 0],
          transition: {
            duration: DURATION_BURST,
            ease: 'easeInOut',
            times: [0, 0.2, 0.5, 0.75, 1],
          },
        });

        spark1Ctrl.start({
          x: [0, 260],
          y: [0, -260],
          scale: [0, 1.2, 0],
          rotate: [0, 90],
          opacity: [0, 1, 0],
          transition: { duration: 0.6, ease: 'easeOut', times: [0, 0.4, 1] },
        });

        spark2Ctrl.start({
          x: [0, -300],
          y: [0, -120],
          scale: [0, 0.9, 0],
          rotate: [0, -90],
          opacity: [0, 1, 0],
          transition: { duration: 0.55, ease: 'easeOut', delay: 0.05, times: [0, 0.4, 1] },
        });

        await spark3Ctrl.start({
          x: [0, 180],
          y: [0, 280],
          scale: [0, 1.1, 0],
          rotate: [0, 135],
          opacity: [0, 1, 0],
          transition: { duration: 0.65, ease: 'easeOut', delay: 0.1, times: [0, 0.4, 1] },
        });
      } finally {
        starCtrl.set(STAR_REST);
        spark1Ctrl.set(SPARK_REST);
        spark2Ctrl.set(SPARK_REST);
        spark3Ctrl.set(SPARK_REST);
        isAnimatingRef.current = false;
      }
    }, [starCtrl, spark1Ctrl, spark2Ctrl, spark3Ctrl, prefersReducedMotion, disabled]);

    const stopAnimation = useCallback(() => {
      isAnimatingRef.current = false;
      starCtrl.stop();
      spark1Ctrl.stop();
      spark2Ctrl.stop();
      spark3Ctrl.stop();
    }, [starCtrl, spark1Ctrl, spark2Ctrl, spark3Ctrl]);

    const resetAnimation = useCallback(() => {
      isAnimatingRef.current = false;
      starCtrl.stop();
      spark1Ctrl.stop();
      spark2Ctrl.stop();
      spark3Ctrl.stop();
      starCtrl.set(STAR_REST);
      spark1Ctrl.set(SPARK_REST);
      spark2Ctrl.set(SPARK_REST);
      spark3Ctrl.set(SPARK_REST);
    }, [starCtrl, spark1Ctrl, spark2Ctrl, spark3Ctrl]);

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
        viewBox="0 0 1024 1024"
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
        <motion.polygon
          points={SPARKLE_POINTS}
          fill={color}
          animate={spark1Ctrl}
          initial={{ ...SPARK_REST, originX: '50%', originY: '50%' }}
        />
        <motion.polygon
          points={SPARKLE_POINTS}
          fill={color}
          animate={spark2Ctrl}
          initial={{ ...SPARK_REST, originX: '50%', originY: '50%' }}
        />
        <motion.polygon
          points={SPARKLE_POINTS}
          fill={color}
          animate={spark3Ctrl}
          initial={{ ...SPARK_REST, originX: '50%', originY: '50%' }}
        />

        <motion.path
          fill={color}
          d="m908.1 353.1l-253.9-36.9L540.7 86.1c-3.1-6.3-8.2-11.4-14.5-14.5c-15.8-7.8-35-1.3-42.9 14.5L369.8 316.2l-253.9 36.9c-7 1-13.4 4.3-18.3 9.3a32.05 32.05 0 0 0 .6 45.3l183.7 179.1l-43.4 252.9a31.95 31.95 0 0 0 46.4 33.7L512 754l227.1 119.4c6.2 3.3 13.4 4.4 20.3 3.2c17.4-3 29.1-19.5 26.1-36.9l-43.4-252.9l183.7-179.1c5-4.9 8.3-11.3 9.3-18.3c2.7-17.5-9.5-33.7-27-36.3M664.8 561.6l36.1 210.3L512 672.7L323.1 772l36.1-210.3l-152.8-149L417.6 382L512 190.7L606.4 382l211.2 30.7z"
          style={{ originX: '50%', originY: '50%' }}
          animate={starCtrl}
          initial={STAR_REST}
        />
      </svg>
    );
  }
);
