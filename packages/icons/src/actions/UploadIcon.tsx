'use client';

/**
 * Story: sending — arrows ride the conveyor upward, one after another, for as
 * long as the cursor stays. Each arrow exits the top as its replacement rises
 * from the tray.
 *
 * Hold-to-loop rationale: an upload affordance is semantically a progress /
 * transfer indicator (ANIMATION_GUIDELINES.md permits looping for those).
 * Hover loops; press/focus/manual play a single cycle; leave resets to rest.
 */

import { forwardRef, useCallback, useId, useImperativeHandle, useRef } from 'react';
import { motion, useAnimation, useReducedMotion } from 'motion/react';
import type { AnimatedIconHandle, AnimatedIconProps } from '@trix/core';
import { EASE_DRAW } from '@trix/core';

const DURATION = 0.45;
const CYCLE_PAUSE = 0.06;

export const UploadIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  function UploadIcon(
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
    const prefersReducedMotion = useReducedMotion();
    const ctrl = useAnimation();
    const hoveredRef = useRef(false);
    const loopingRef = useRef(false);

    const uid = useId().replace(/:/g, '');
    const artboardClipId = `upload-artboard-${uid}`;
    const trayClipId = `upload-tray-${uid}`;

    // One transfer cycle: the conveyor slides a full arrow-height upward.
    const playCycle = useCallback(async () => {
      ctrl.set({ y: 0 });
      await ctrl.start({
        y: -16,
        transition: {
          duration: DURATION,
          ease: EASE_DRAW,
        },
      });
      ctrl.set({ y: 0 });
    }, [ctrl]);

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
      loopingRef.current = false;
    }, [playCycle, prefersReducedMotion, disabled]);

    const stopAnimation = useCallback(() => {
      hoveredRef.current = false;
      loopingRef.current = false;
      ctrl.stop();
    }, [ctrl]);

    const resetAnimation = useCallback(() => {
      hoveredRef.current = false;
      loopingRef.current = false;
      ctrl.stop();
      ctrl.set({ y: 0 });
    }, [ctrl]);

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
        style={{ color, display: 'block', ...(disabled && { pointerEvents: 'none' }) }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onPointerDown={onPointerDown}
        onFocus={onFocus}
        {...accessibilityProps}
      >
        <defs>
          <clipPath id={artboardClipId}>
            <rect x="0" y="0" width="24" height="24" />
          </clipPath>
          <clipPath id={trayClipId}>
            <rect x="0" y="0" width="24" height="18" />
          </clipPath>
        </defs>

        <g clipPath={`url(#${artboardClipId})`}>
          <g clipPath={`url(#${trayClipId})`}>
            <motion.g
              initial={{ y: 0 }}
              animate={ctrl}
            >
              <path fill={color} d="M11 16V7.85l-2.6 2.6L7 9l5-5l5 5l-1.4 1.45l-2.6-2.6V16z" />
              <path fill={color} transform="translate(0, 16)" d="M11 16V7.85l-2.6 2.6L7 9l5-5l5 5l-1.4 1.45l-2.6-2.6V16z" />
            </motion.g>
          </g>
          <path fill={color} d="M6 20q-.825 0-1.412-.587T4 18v-3h2v3h12v-3h2v3q0 .825-.587 1.413T18 20z" />
        </g>
      </svg>
    );
  }
);
