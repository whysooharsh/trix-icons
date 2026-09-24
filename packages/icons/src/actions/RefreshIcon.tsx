'use client';

/**
 * Story: the cycle restarts - the top arc redraws itself, and just before it
 * completes, the bottom arc follows, tracing the reload loop in sequence.
 * No rotation is used: a prior full-spin treatment suffered an off-axis wobble.
 */

import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { motion, useAnimation, useReducedMotion } from 'motion/react';
import type { AnimatedIconHandle, AnimatedIconProps } from '@trix/core';
import { EASE_DRAW } from '@trix/core';

const DURATION_ARC = 0.22;
const ARC_STAGGER = 0.1;

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
    const topCtrl = useAnimation();
    const botCtrl = useAnimation();
    const prefersReducedMotion = useReducedMotion();
    const isAnimatingRef = useRef(false);

    const startAnimation = useCallback(async () => {
      if (prefersReducedMotion || disabled || isAnimatingRef.current) return;
      isAnimatingRef.current = true;

      await Promise.all([
        topCtrl.start({
          pathLength: [0, 1],
          transition: { duration: DURATION_ARC, ease: EASE_DRAW },
        }),
        botCtrl.start({
          pathLength: [0, 1],
          transition: { delay: ARC_STAGGER, duration: DURATION_ARC, ease: EASE_DRAW },
        }),
      ]);

      topCtrl.set({ pathLength: 1 });
      botCtrl.set({ pathLength: 1 });
      isAnimatingRef.current = false;
    }, [topCtrl, botCtrl, prefersReducedMotion, disabled]);

    const stopAnimation = useCallback(() => {
      isAnimatingRef.current = false;
      topCtrl.stop();
      botCtrl.stop();
    }, [topCtrl, botCtrl]);

    const resetAnimation = useCallback(() => {
      isAnimatingRef.current = false;
      topCtrl.stop();
      botCtrl.stop();
      topCtrl.set({ pathLength: 1 });
      botCtrl.set({ pathLength: 1 });
    }, [topCtrl, botCtrl]);

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
        {/* Top arc + arrowhead redraw first */}
        <motion.path
          d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"
          animate={topCtrl}
          initial={{ pathLength: 1 }}
        />
        <motion.path
          d="M3 3v5h5"
          animate={topCtrl}
          initial={{ pathLength: 1 }}
        />

        {/* Bottom arc + arrowhead follow */}
        <motion.path
          d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"
          animate={botCtrl}
          initial={{ pathLength: 1 }}
        />
        <motion.path
          d="M21 21v-5h-5"
          animate={botCtrl}
          initial={{ pathLength: 1 }}
        />
      </svg>
    );
  }
);
