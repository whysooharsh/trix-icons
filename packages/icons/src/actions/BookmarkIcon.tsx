'use client';

/**
 * Story: pocketing it — the bookmark jumps, stretches, and squashes onto
 * the ground, pivoting at its base. A bubble of effort floats up as it
 * jumps; twin dust puffs fire at the impact moment. One-shot, ends at rest.
 */

import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { motion, useAnimation, useReducedMotion } from 'motion/react';
import type { AnimatedIconHandle, AnimatedIconProps } from '@trix/core';

const DURATION_JUMP = 0.6;

const BOOKMARK_REST = { scaleX: 1, scaleY: 1, y: 0 };
const BUBBLE_REST = { opacity: 0, scale: 0, y: 0 };
const DUST_REST = { opacity: 0, scale: 0, x: 0, y: 0 };

export const BookmarkIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  function BookmarkIcon(
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
    const bookmarkCtrl = useAnimation();
    const bubbleCtrl = useAnimation();
    const dustLeftCtrl = useAnimation();
    const dustRightCtrl = useAnimation();
    const prefersReducedMotion = useReducedMotion();
    const isAnimatingRef = useRef(false);

    const startAnimation = useCallback(async () => {
      if (prefersReducedMotion || disabled || isAnimatingRef.current) return;
      isAnimatingRef.current = true;

      try {
        bookmarkCtrl.start({
          scaleY: [1, 1.15, 0.75, 1.05, 1],
          scaleX: [1, 0.85, 1.25, 0.95, 1],
          y: [0, -4, 0, -1.5, 0],
          transition: {
            duration: DURATION_JUMP,
            ease: 'easeInOut',
            times: [0, 0.25, 0.5, 0.75, 1],
          },
        });

        bubbleCtrl.start({
          y: [0, -8],
          opacity: [0, 1, 0],
          scale: [0, 1.5, 2],
          transition: { duration: 0.4, ease: 'easeOut', delay: 0.05 },
        });

        dustLeftCtrl.start({
          x: [0, -6],
          y: [0, -4],
          opacity: [0, 1, 0],
          scale: [0, 1.2, 0],
          transition: { duration: 0.4, ease: 'easeOut', delay: 0.3 },
        });

        await dustRightCtrl.start({
          x: [0, 6],
          y: [0, -4],
          opacity: [0, 1, 0],
          scale: [0, 1.2, 0],
          transition: { duration: 0.4, ease: 'easeOut', delay: 0.3 },
        });
      } finally {
        bookmarkCtrl.set(BOOKMARK_REST);
        bubbleCtrl.set(BUBBLE_REST);
        dustLeftCtrl.set(DUST_REST);
        dustRightCtrl.set(DUST_REST);
        isAnimatingRef.current = false;
      }
    }, [bookmarkCtrl, bubbleCtrl, dustLeftCtrl, dustRightCtrl, prefersReducedMotion, disabled]);

    const stopAnimation = useCallback(() => {
      isAnimatingRef.current = false;
      bookmarkCtrl.stop();
      bubbleCtrl.stop();
      dustLeftCtrl.stop();
      dustRightCtrl.stop();
    }, [bookmarkCtrl, bubbleCtrl, dustLeftCtrl, dustRightCtrl]);

    const resetAnimation = useCallback(() => {
      isAnimatingRef.current = false;
      bookmarkCtrl.stop();
      bubbleCtrl.stop();
      dustLeftCtrl.stop();
      dustRightCtrl.stop();
      bookmarkCtrl.set(BOOKMARK_REST);
      bubbleCtrl.set(BUBBLE_REST);
      dustLeftCtrl.set(DUST_REST);
      dustRightCtrl.set(DUST_REST);
    }, [bookmarkCtrl, bubbleCtrl, dustLeftCtrl, dustRightCtrl]);

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
        viewBox="0 0 16 16"
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
          cx="8"
          cy="2"
          r="1"
          fill="none"
          stroke={color}
          strokeWidth="0.5"
          animate={bubbleCtrl}
          initial={BUBBLE_REST}
        />

        <motion.circle
          cx="8"
          cy="14"
          r="0.8"
          fill={color}
          animate={dustLeftCtrl}
          initial={DUST_REST}
        />
        <motion.circle
          cx="8"
          cy="14"
          r="0.8"
          fill={color}
          animate={dustRightCtrl}
          initial={DUST_REST}
        />

        {/* Bookmark body, pivoting at its base */}
        <motion.path
          fill={color}
          d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1z"
          style={{ originX: '8px', originY: '15.5px' }}
          animate={bookmarkCtrl}
          initial={BOOKMARK_REST}
        />
      </svg>
    );
  }
);
