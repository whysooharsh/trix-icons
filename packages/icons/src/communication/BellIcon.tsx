'use client';

/**
 * Story: ring → clapper strikes → oscillation decays → silence.
 */

import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { motion, useAnimation, useReducedMotion } from 'motion/react';
import type { AnimatedIconHandle, AnimatedIconProps } from '@trix/core';

const DURATION = 0.65;
const EASE = 'easeInOut' as const;
const TIMES = [0, 0.2, 0.4, 0.6, 0.8, 1] as const;

// Subtle body sway, stronger clapper strike
const BODY_ROTATION = [0, 5, -4, 2, -1, 0] as const;
const CLAPPER_ROTATION = [0, -16, 12, -8, 4, 0] as const;

export const BellIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  function BellIcon(
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
    const bodyCtrl = useAnimation();
    const clapperCtrl = useAnimation();
    const isAnimatingRef = useRef(false);

    const startAnimation = useCallback(async () => {
      if (prefersReducedMotion || disabled || isAnimatingRef.current) return;
      isAnimatingRef.current = true;

      bodyCtrl.start({
        rotate: [...BODY_ROTATION],
        transition: { duration: DURATION, ease: EASE, times: [...TIMES] },
      });

      await clapperCtrl.start({
        rotate: [...CLAPPER_ROTATION],
        transition: { duration: DURATION, ease: EASE, times: [...TIMES] },
      });

      bodyCtrl.set({ rotate: 0 });
      clapperCtrl.set({ rotate: 0 });
      isAnimatingRef.current = false;
    }, [bodyCtrl, clapperCtrl, prefersReducedMotion, disabled]);

    const stopAnimation = useCallback(() => {
      isAnimatingRef.current = false;
      bodyCtrl.stop();
      clapperCtrl.stop();
    }, [bodyCtrl, clapperCtrl]);

    const resetAnimation = useCallback(() => {
      isAnimatingRef.current = false;
      bodyCtrl.stop();
      clapperCtrl.stop();
      bodyCtrl.set({ rotate: 0 });
      clapperCtrl.set({ rotate: 0 });
    }, [bodyCtrl, clapperCtrl]);

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
        style={{ color, display: 'block', overflow: 'visible', ...(disabled && { pointerEvents: 'none' }) }}
        onMouseEnter={onMouseEnter}
        onPointerDown={onPointerDown}
        onFocus={onFocus}
        {...accessibilityProps}
      >
        <motion.path
          fill={color}
          d="M21 19v1H3v-1l2-2v-6c0-3.1 2-5.8 5-6.7V4c0-1.1.9-2 2-2s2 .9 2 2v.3c3 .9 5 3.6 5 6.7v6zM17 11c0-2.8-2.2-5-5-5s-5 2.2-5 5v7h10z"
          style={{ transformOrigin: '12px 4px' }}
          animate={bodyCtrl}
          initial={{ rotate: 0 }}
        />
        <motion.path
          fill={color}
          d="M10 21h4c0 1.1-.9 2-2 2s-2-.9-2-2z"
          style={{ transformOrigin: '12px 21px' }}
          animate={clapperCtrl}
          initial={{ rotate: 0 }}
        />
      </svg>
    );
  }
);
