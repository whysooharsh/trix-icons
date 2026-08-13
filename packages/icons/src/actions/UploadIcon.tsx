'use client';

/**
 * Story: arrow leaves tray and travels upward into portal → replacement arrow emerges from bottom to take its place.
 */

import { forwardRef, useCallback, useId, useImperativeHandle, useRef } from 'react';
import { motion, useAnimation, useReducedMotion } from 'motion/react';
import type { AnimatedIconHandle, AnimatedIconProps } from '@trix/core';

const DURATION = 0.45;
const EASE = [0.65, 0, 0.35, 1] as const;

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
    const isAnimatingRef = useRef(false);

    const uid = useId().replace(/:/g, '');
    const artboardClipId = `upload-artboard-${uid}`;
    const trayClipId = `upload-tray-${uid}`;

    const startAnimation = useCallback(async () => {
      if (prefersReducedMotion || disabled || isAnimatingRef.current) return;
      isAnimatingRef.current = true;
      ctrl.set({ y: 0 });
      await ctrl.start({
        y: -16,
        transition: {
          duration: DURATION,
          ease: EASE,
        },
      });
      ctrl.set({ y: 0 });
      isAnimatingRef.current = false;
    }, [ctrl, prefersReducedMotion, disabled]);

    const stopAnimation = useCallback(() => {
      isAnimatingRef.current = false;
      ctrl.stop();
    }, [ctrl]);

    const resetAnimation = useCallback(() => {
      isAnimatingRef.current = false;
      ctrl.stop();
      ctrl.set({ y: 0 });
    }, [ctrl]);

    useImperativeHandle(
      ref,
      () => ({ startAnimation, stopAnimation, resetAnimation }),
      [startAnimation, stopAnimation, resetAnimation]
    );

    const onMouseEnter = trigger === 'hover' && !disabled ? startAnimation : undefined;
    const onPointerDown = trigger === 'press' && !disabled ? startAnimation : undefined;
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