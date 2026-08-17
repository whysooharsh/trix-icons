'use client';

/**
 * Story: three brand mark elements assemble left-to-right via stroke trace and fill fade → settles.
 */

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import { motion, useAnimation, useReducedMotion } from 'motion/react';
import type { AnimatedIconHandle, AnimatedIconProps } from '@trix/core';

const DRAW_DURATION = 0.7;
const DRAW_EASE: [number, number, number, number] = [0.65, 0, 0.35, 1];
const FILL_DURATION = 0.4;
const FILL_EASE = 'easeOut' as const;

const SHAPE_TIMING = [
  { draw: 0, fill: 650 },
  { draw: 150, fill: 800 },
  { draw: 280, fill: 930 },
] as const;

const FILLED_STATE = {
  pathLength: 1,
  fillOpacity: 1,
  strokeOpacity: 0,
} as const;

const STROKE_STATE = {
  pathLength: 0,
  fillOpacity: 0,
  strokeOpacity: 1,
} as const;

export const MediumIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  function MediumIcon(
    {
      size = 24,
      color = 'currentColor',
      strokeWidth = 1.2,
      className,
      trigger = 'hover',
      disabled = false,
      'aria-label': ariaLabel,
    },
    ref
  ) {
    const ctrl1 = useAnimation();
    const ctrl2 = useAnimation();
    const ctrl3 = useAnimation();

    const prefersReducedMotion = useReducedMotion();
    const generationRef = useRef(0);
    const timeoutIds = useRef<ReturnType<typeof setTimeout>[]>([]);

    const clearTimeouts = useCallback(() => {
      timeoutIds.current.forEach(clearTimeout);
      timeoutIds.current = [];
    }, []);

    useEffect(() => {
      return () => {
        generationRef.current += 1;
        clearTimeouts();
      };
    }, [clearTimeouts]);

    const startAnimation = useCallback(async () => {
      if (prefersReducedMotion || disabled) return;

      generationRef.current += 1;
      const currentGen = generationRef.current;

      clearTimeouts();
      ctrl1.stop();
      ctrl2.stop();
      ctrl3.stop();

      ctrl1.set(STROKE_STATE);
      ctrl2.set(STROKE_STATE);
      ctrl3.set(STROKE_STATE);

      const ctrls = [ctrl1, ctrl2, ctrl3];

      ctrls.forEach((ctrl, i) => {
        const timing = SHAPE_TIMING[i];
        if (!timing) return;

        const drawTimer = setTimeout(() => {
          if (generationRef.current !== currentGen) return;
          ctrl.start({
            pathLength: 1,
            transition: {
              duration: DRAW_DURATION,
              ease: DRAW_EASE,
            },
          });
        }, timing.draw);

        const fillTimer = setTimeout(() => {
          if (generationRef.current !== currentGen) return;
          ctrl.start({
            fillOpacity: 1,
            strokeOpacity: 0,
            transition: {
              duration: FILL_DURATION,
              ease: FILL_EASE,
            },
          });
        }, timing.fill);

        timeoutIds.current.push(drawTimer, fillTimer);
      });
    }, [ctrl1, ctrl2, ctrl3, prefersReducedMotion, disabled, clearTimeouts]);

    const stopAnimation = useCallback(() => {
      generationRef.current += 1;
      clearTimeouts();
      ctrl1.stop();
      ctrl2.stop();
      ctrl3.stop();
      ctrl1.set(FILLED_STATE);
      ctrl2.set(FILLED_STATE);
      ctrl3.set(FILLED_STATE);
    }, [ctrl1, ctrl2, ctrl3, clearTimeouts]);

    const resetAnimation = useCallback(() => {
      generationRef.current += 1;
      clearTimeouts();
      ctrl1.stop();
      ctrl2.stop();
      ctrl3.stop();
      ctrl1.set(FILLED_STATE);
      ctrl2.set(FILLED_STATE);
      ctrl3.set(FILLED_STATE);
    }, [ctrl1, ctrl2, ctrl3, clearTimeouts]);

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
        <motion.path
          animate={ctrl1}
          initial={FILLED_STATE}
          fill={color}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13.54 12a6.8 6.8 0 0 1-6.77 6.82A6.8 6.8 0 0 1 0 12a6.8 6.8 0 0 1 6.77-6.82A6.8 6.8 0 0 1 13.54 12z"
        />
        <motion.path
          animate={ctrl2}
          initial={FILLED_STATE}
          fill={color}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20.96 12c0 3.54-1.51 6.42-3.38 6.42s-3.38-2.88-3.38-6.42 1.51-6.42 3.38-6.42 3.38 2.88 3.38 6.42z"
        />
        <motion.path
          animate={ctrl3}
          initial={FILLED_STATE}
          fill={color}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M24 12c0 3.17-.53 5.75-1.19 5.75s-1.19-2.58-1.19-5.75.53-5.75 1.19-5.75S24 8.83 24 12z"
        />
      </svg>
    );
  }
);
