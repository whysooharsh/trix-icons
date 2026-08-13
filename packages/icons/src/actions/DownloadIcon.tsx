'use client';

/**
 * Story: object/arrow travels downward → enters tray → tray responds subtly → settles.
 */

import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { motion, useAnimation, useReducedMotion } from 'motion/react';
import type { AnimatedIconHandle, AnimatedIconProps } from '@trix/core';
import { EASE_BOUNCE, EASE_STANDARD } from '@trix/core';

const DURATION_FALL = 0.28;
const DURATION_TRAY = 0.2;

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
    const isAnimatingRef = useRef(false);

    const startAnimation = useCallback(async () => {
      if (prefersReducedMotion || disabled || isAnimatingRef.current) return;
      isAnimatingRef.current = true;

      // 1. Arrow travels downward into the tray
      await arrowCtrl.start({
        y: [-10, 0],
        opacity: [0, 1],
        transition: { duration: DURATION_FALL, ease: EASE_STANDARD },
      });

      // 2. Tray responds with a subtle physical flex upon arrival
      await trayCtrl.start({
        y: [0, 1.5, 0],
        transition: { duration: DURATION_TRAY, ease: EASE_BOUNCE },
      });

      arrowCtrl.set({ y: 0, opacity: 1 });
      trayCtrl.set({ y: 0 });
      isAnimatingRef.current = false;
    }, [arrowCtrl, trayCtrl, prefersReducedMotion, disabled]);

    const stopAnimation = useCallback(() => {
      isAnimatingRef.current = false;
      arrowCtrl.stop();
      trayCtrl.stop();
    }, [arrowCtrl, trayCtrl]);

    const resetAnimation = useCallback(() => {
      isAnimatingRef.current = false;
      arrowCtrl.stop();
      trayCtrl.stop();
      arrowCtrl.set({ y: 0, opacity: 1 });
      trayCtrl.set({ y: 0 });
    }, [arrowCtrl, trayCtrl]);

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
