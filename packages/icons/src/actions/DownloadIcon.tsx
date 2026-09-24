'use client';

/**
 * Story: receiving — arrows rain downward into the tray, one after another,
 * for as long as the cursor stays. Each arrival flexes the tray.
 *
 * Hold-to-loop rationale: a download affordance is semantically a progress /
 * transfer indicator (ANIMATION_GUIDELINES.md permits looping for those).
 * Hover loops; press/focus/manual play a single cycle; leave resets to rest.
 */

import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { motion, useAnimation, useReducedMotion } from 'motion/react';
import type { AnimatedIconHandle, AnimatedIconProps } from '@trix/core';
import { EASE_BOUNCE, EASE_STANDARD } from '@trix/core';

const DURATION_FALL = 0.28;
const DURATION_TRAY = 0.2;
const DURATION_EXIT = 0.16;
const CYCLE_PAUSE = 0.06;

export const DownloadIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  function DownloadIcon(
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
    const arrowCtrl = useAnimation();
    const trayCtrl = useAnimation();
    const prefersReducedMotion = useReducedMotion();
    const hoveredRef = useRef(false);
    const loopingRef = useRef(false);

    // One transfer cycle: arrow falls in, tray flexes, arrow settles through.
    const playCycle = useCallback(async () => {
      await arrowCtrl.start({
        y: [-10, 0],
        opacity: [0, 1],
        transition: { duration: DURATION_FALL, ease: EASE_STANDARD },
      });
      await trayCtrl.start({
        y: [0, 1.5, 0],
        transition: { duration: DURATION_TRAY, ease: EASE_BOUNCE },
      });
      await arrowCtrl.start({
        y: [0, 6],
        opacity: [1, 0],
        transition: { duration: DURATION_EXIT, ease: EASE_STANDARD },
      });
    }, [arrowCtrl, trayCtrl]);

    const settleRest = useCallback(() => {
      arrowCtrl.set({ y: 0, opacity: 1 });
      trayCtrl.set({ y: 0 });
    }, [arrowCtrl, trayCtrl]);

    const runLoop = useCallback(async () => {
      if (prefersReducedMotion || disabled || loopingRef.current) return;
      loopingRef.current = true;
      while (hoveredRef.current) {
        await playCycle();
        if (!hoveredRef.current) break;
        await new Promise((resolve) => setTimeout(resolve, CYCLE_PAUSE * 1000));
      }
      loopingRef.current = false;
    }, [playCycle, prefersReducedMotion, disabled]);

    const startAnimation = useCallback(async () => {
      // Imperative / press / focus: a single cycle, never a loop.
      if (prefersReducedMotion || disabled || loopingRef.current) return;
      loopingRef.current = true;
      await playCycle();
      settleRest();
      loopingRef.current = false;
    }, [playCycle, settleRest, prefersReducedMotion, disabled]);

    const stopAnimation = useCallback(() => {
      hoveredRef.current = false;
      loopingRef.current = false;
      arrowCtrl.stop();
      trayCtrl.stop();
    }, [arrowCtrl, trayCtrl]);

    const resetAnimation = useCallback(() => {
      hoveredRef.current = false;
      loopingRef.current = false;
      arrowCtrl.stop();
      trayCtrl.stop();
      settleRest();
    }, [arrowCtrl, trayCtrl, settleRest]);

    useImperativeHandle(
      ref,
      () => ({ startAnimation, stopAnimation, resetAnimation }),
      [startAnimation, stopAnimation, resetAnimation]
    );

    const onMouseEnter =
      trigger === 'hover' && !disabled
        ? () => {
            hoveredRef.current = true;
            runLoop();
          }
        : undefined;
    const onMouseLeave =
      trigger === 'hover' && !disabled ? () => resetAnimation() : undefined;
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
        onMouseLeave={onMouseLeave}
        onPointerDown={onPointerDown}
        onFocus={onFocus}
        {...accessibilityProps}
      >
        {/* Downward traveling arrow */}
        <motion.path
          d="M12 3v12m0 0l-4-4m4 4l4-4"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={arrowCtrl}
          initial={{ y: 0, opacity: 1 }}
        />

        {/* Responding tray base */}
        <motion.path
          d="M4 21h16"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={trayCtrl}
          initial={{ y: 0 }}
        />
      </svg>
    );
  }
);
