'use client';

/**
 * Story: magnifier actively searches → moves through small search pattern → finds something → subtle 1.06 scale "found" response → settles.
 */

import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { motion, useAnimation, useReducedMotion } from 'motion/react';
import type { AnimatedIconHandle, AnimatedIconProps } from '@trix/core';
import { EASE_BOUNCE, EASE_STANDARD } from '@trix/core';

const DURATION_SEARCH = 0.38;
const DURATION_POP = 0.18;

export const SearchIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  function SearchIcon(
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

      await ctrl.start({
        x: [0, -2, 2, 0],
        y: [0, -1.5, 0.5, 0],
        rotate: [0, -5, 5, 0],
        scale: 1,
        transition: {
          duration: DURATION_SEARCH,
          ease: EASE_STANDARD,
        },
      });

      await ctrl.start({
        scale: [1, 1.06, 1],
        transition: {
          duration: DURATION_POP,
          ease: EASE_BOUNCE,
        },
      });

      ctrl.set({ x: 0, y: 0, rotate: 0, scale: 1 });
      isAnimatingRef.current = false;
    }, [ctrl, prefersReducedMotion, disabled]);

    const stopAnimation = useCallback(() => {
      isAnimatingRef.current = false;
      ctrl.stop();
    }, [ctrl]);

    const resetAnimation = useCallback(() => {
      isAnimatingRef.current = false;
      ctrl.stop();
      ctrl.set({ x: 0, y: 0, rotate: 0, scale: 1 });
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
        <motion.g
          animate={ctrl}
          initial={{ x: 0, y: 0, rotate: 0, scale: 1 }}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        >
          <circle cx="9.5" cy="9.5" r="5.5" />
          <line x1="13.4" y1="13.4" x2="20" y2="20" />
        </motion.g>
      </svg>
    );
  }
);
