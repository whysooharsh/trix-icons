'use client';

/**
 * Story: brand mark traces in continuous gesture before fading to solid fill → settles.
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

const DRAW_DURATION = 1.1;
const DRAW_EASE: [number, number, number, number] = [0.65, 0, 0.35, 1];
const FILL_START_MS = 950;
const FILL_DURATION = 0.5;
const FILL_EASE = 'easeOut' as const;
const DEFAULT_STROKE_WIDTH = 10;

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

export const LeetcodeIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  function LeetcodeIcon(
    {
      size = 24,
      color = 'currentColor',
      strokeWidth = DEFAULT_STROKE_WIDTH,
      className,
      trigger = 'hover',
      disabled = false,
      'aria-label': ariaLabel,
    },
    ref
  ) {
    const ctrl = useAnimation();
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
      ctrl.stop();
      ctrl.set(STROKE_STATE);

      ctrl.start({
        pathLength: 1,
        transition: {
          duration: DRAW_DURATION,
          ease: DRAW_EASE,
        },
      });

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
      }, FILL_START_MS);

      timeoutIds.current.push(fillTimer);
    }, [ctrl, prefersReducedMotion, disabled, clearTimeouts]);

    const stopAnimation = useCallback(() => {
      generationRef.current += 1;
      clearTimeouts();
      ctrl.stop();
      ctrl.set(FILLED_STATE);
    }, [ctrl, clearTimeouts]);

    const resetAnimation = useCallback(() => {
      generationRef.current += 1;
      clearTimeouts();
      ctrl.stop();
      ctrl.set(FILLED_STATE);
    }, [ctrl, clearTimeouts]);

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
        viewBox="0 0 128 128"
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
          animate={ctrl}
          initial={FILLED_STATE}
          fill={color}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M74.8 17.5a10 10 0 0 0-14.1 0L19.2 59a10 10 0 0 0 0 14.1l41.5 41.5a10 10 0 0 0 14.1 0l34.2-34.2a10 10 0 0 0 0-14.1L94.9 52.2M42 66h50"
        />
      </svg>
    );
  }
);
