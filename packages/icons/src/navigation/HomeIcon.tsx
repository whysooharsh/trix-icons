'use client';

/**
 * Story: delineating home — the roofline unwrites and retraces itself while
 * the house stands still. No door mechanics, no lifts; a single stroke
 * reaffirms the shelter.
 */

import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { motion, useAnimation, useReducedMotion } from 'motion/react';
import type { AnimatedIconHandle, AnimatedIconProps } from '@trix/core';
import { EASE_DRAW } from '@trix/core';

const DURATION = 0.35;

export const HomeIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  function HomeIcon(
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
    const roofCtrl = useAnimation();
    const prefersReducedMotion = useReducedMotion();
    // Clicking commits the retraced state; it persists until clicked again.
    const lockedRef = useRef(false);

    const setRetraced = useCallback(
      (on: boolean) => {
        if (disabled) return;

        if (prefersReducedMotion) {
          roofCtrl.stop();
          roofCtrl.set({ pathLength: 1 });
          return;
        }

        if (!on) {
          roofCtrl.set({ pathLength: 1 });
          return;
        }

        // Unwrite then retrace in one gesture; ends at rest.
        roofCtrl.start({
          pathLength: [1, 0, 1],
          transition: { duration: DURATION, ease: EASE_DRAW },
        });
      },
      [roofCtrl, prefersReducedMotion, disabled]
    );

    const stopAnimation = useCallback(() => {
      roofCtrl.stop();
    }, [roofCtrl]);

    const resetAnimation = useCallback(() => {
      lockedRef.current = false;
      roofCtrl.stop();
      roofCtrl.set({ pathLength: 1 });
    }, [roofCtrl]);

    useImperativeHandle(
      ref,
      () => ({
        startAnimation: () => setRetraced(true),
        stopAnimation,
        resetAnimation,
      }),
      [setRetraced, stopAnimation, resetAnimation]
    );

    const onMouseEnter = trigger === 'hover' && !disabled ? () => setRetraced(true) : undefined;
    const onMouseLeave =
      trigger === 'hover' && !disabled
        ? () => {
            if (!lockedRef.current) setRetraced(false);
          }
        : undefined;
    const onPointerDown =
      (trigger === 'hover' || trigger === 'press') && !disabled
        ? () => {
            lockedRef.current = !lockedRef.current;
            setRetraced(lockedRef.current);
          }
        : undefined;
    const onFocus = trigger === 'focus' && !disabled ? () => setRetraced(true) : undefined;
    const onBlur =
      trigger === 'focus' && !disabled
        ? () => {
            if (!lockedRef.current) setRetraced(false);
          }
        : undefined;

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
        onMouseLeave={onMouseLeave}
        onPointerDown={onPointerDown}
        onFocus={onFocus}
        onBlur={onBlur}
        {...accessibilityProps}
      >
        {/* Walls and floor — never move */}
        <path d="M6 10.2V18a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-7.8" />

        {/* Roofline unwrites and retraces itself */}
        <motion.path
          d="M4.5 10.8L12 4.5l7.5 6.3"
          animate={roofCtrl}
          initial={{ pathLength: 1 }}
        />

        {/* Door and knob — never move */}
        <rect x="10" y="13.5" width="4" height="5.5" rx="0.75" />
        <circle cx="13" cy="16.25" r="0.4" fill={color} stroke="none" />
      </svg>
    );
  }
);
