'use client';

/**
 * Story: front document separates from the back document → moves outward slightly → snaps/settles into alignment.
 */

import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { motion, useAnimation, useReducedMotion } from 'motion/react';
import type { AnimatedIconHandle, AnimatedIconProps } from '@trix/core';
import { EASE_BOUNCE, EASE_STANDARD } from '@trix/core';

const DURATION_SEPARATE = 0.22;
const DURATION_SETTLE = 0.2;

export const CopyIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  function CopyIcon(
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
    const frontCtrl = useAnimation();
    const backCtrl = useAnimation();
    const prefersReducedMotion = useReducedMotion();
    const isAnimatingRef = useRef(false);

    const startAnimation = useCallback(async () => {
      if (prefersReducedMotion || disabled || isAnimatingRef.current) return;
      isAnimatingRef.current = true;

      frontCtrl.start({
        x: 2,
        y: 2,
        scale: 1.04,
        transition: { duration: DURATION_SEPARATE, ease: EASE_STANDARD },
      });

      await backCtrl.start({
        x: -1.5,
        y: -1.5,
        opacity: 0.7,
        transition: { duration: DURATION_SEPARATE, ease: EASE_STANDARD },
      });

      frontCtrl.start({
        x: 0,
        y: 0,
        scale: 1,
        transition: { duration: DURATION_SETTLE, ease: EASE_BOUNCE },
      });

      await backCtrl.start({
        x: 0,
        y: 0,
        opacity: 1,
        transition: { duration: DURATION_SETTLE, ease: EASE_BOUNCE },
      });

      frontCtrl.set({ x: 0, y: 0, scale: 1 });
      backCtrl.set({ x: 0, y: 0, opacity: 1 });
      isAnimatingRef.current = false;
    }, [frontCtrl, backCtrl, prefersReducedMotion, disabled]);

    const stopAnimation = useCallback(() => {
      isAnimatingRef.current = false;
      frontCtrl.stop();
      backCtrl.stop();
    }, [frontCtrl, backCtrl]);

    const resetAnimation = useCallback(() => {
      isAnimatingRef.current = false;
      frontCtrl.stop();
      backCtrl.stop();
      frontCtrl.set({ x: 0, y: 0, scale: 1 });
      backCtrl.set({ x: 0, y: 0, opacity: 1 });
    }, [frontCtrl, backCtrl]);

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
          fill={color}
          d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1z"
          animate={backCtrl}
          initial={{ x: 0, y: 0, opacity: 1 }}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        />

        <motion.path
          fill={color}
          d="M19 5H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"
          animate={frontCtrl}
          initial={{ x: 0, y: 0, scale: 1 }}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        />
      </svg>
    );
  }
);
