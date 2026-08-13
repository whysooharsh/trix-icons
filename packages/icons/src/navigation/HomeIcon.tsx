'use client';

/**
 * Story: roof line subtly lifts → doorway block slides down into floor to reveal entrance → settles.
 */

import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { motion, useAnimation, useReducedMotion } from 'motion/react';
import type { AnimatedIconHandle, AnimatedIconProps } from '@trix/core';
import { EASE_BOUNCE, EASE_STANDARD } from '@trix/core';

const DURATION_ROOF = 0.28;
const DURATION_DOOR = 0.22;

export const HomeIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  function HomeIcon(
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
    const roofCtrl = useAnimation();
    const doorCtrl = useAnimation();
    const isAnimatingRef = useRef(false);

    const startAnimation = useCallback(async () => {
      if (prefersReducedMotion || disabled || isAnimatingRef.current) return;
      isAnimatingRef.current = true;

      // 1. Roof stroke lifts
      roofCtrl.start({
        y: [0, -2, 0],
        opacity: [0.3, 1, 0],
        pathLength: [0, 1, 1],
        transition: { duration: DURATION_ROOF, ease: EASE_STANDARD },
      });

      // 2. Doorway reveals entrance by sliding into floor
      doorCtrl.set({ scaleY: 1, opacity: 1 });
      await doorCtrl.start({
        scaleY: 0,
        transition: { delay: 0.1, duration: DURATION_DOOR, ease: EASE_BOUNCE },
      });

      roofCtrl.set({ y: 0, opacity: 0, pathLength: 0 });
      doorCtrl.set({ scaleY: 0, opacity: 0 });
      isAnimatingRef.current = false;
    }, [doorCtrl, roofCtrl, prefersReducedMotion, disabled]);

    const stopAnimation = useCallback(() => {
      isAnimatingRef.current = false;
      roofCtrl.stop();
      doorCtrl.stop();
    }, [doorCtrl, roofCtrl]);

    const resetAnimation = useCallback(() => {
      isAnimatingRef.current = false;
      roofCtrl.stop();
      doorCtrl.stop();
      roofCtrl.set({ y: 0, opacity: 0, pathLength: 0 });
      doorCtrl.set({ scaleY: 0, opacity: 0 });
    }, [doorCtrl, roofCtrl]);

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
        {/* Solid filled house body — always 100% visible */}
        <path
          fill={color}
          d="M6 19h3v-6h6v6h3v-9l-6-4.5L6 10zm-2 2V9l8-6l8 6v12h-7v-6h-2v6zm8-8.75"
        />

        {/* Roof highlight stroke — lifts on hover */}
        <motion.path
          d="M 5 9.5 L 12 4.25 L 19 9.5"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0, y: 0 }}
          animate={roofCtrl}
        />

        {/* Door cutout block — slides down into floor */}
        <motion.rect
          x="11"
          y="15"
          width="2"
          height="6"
          fill={color}
          style={{ transformOrigin: '12px 21px' }}
          initial={{ scaleY: 0, opacity: 0 }}
          animate={doorCtrl}
        />
      </svg>
    );
  }
);
