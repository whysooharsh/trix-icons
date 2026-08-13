'use client';

/**
 * Story: lid opens on hinge → discarded item drops into bin → lid closes and settles.
 */

import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { motion, useAnimation, useReducedMotion } from 'motion/react';
import type { AnimatedIconHandle, AnimatedIconProps } from '@trix/core';
import { EASE_BOUNCE, EASE_STANDARD } from '@trix/core';

const DURATION_OPEN = 0.25;
const DURATION_DROP = 0.22;

export const DeleteIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  function DeleteIcon(
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
    const lidCtrl = useAnimation();
    const itemCtrl = useAnimation();
    const prefersReducedMotion = useReducedMotion();
    const isAnimatingRef = useRef(false);

    const startAnimation = useCallback(async () => {
      if (prefersReducedMotion || disabled || isAnimatingRef.current) return;
      isAnimatingRef.current = true;

      // 1. Lid opens on left-hinge
      lidCtrl.start({
        rotate: -30,
        transition: { duration: DURATION_OPEN, ease: EASE_BOUNCE },
      });

      // 2. Discarded item drops into bin and fades out
      await itemCtrl.start({
        y: [0, 8],
        opacity: [1, 0],
        transition: { duration: DURATION_DROP, ease: EASE_STANDARD, delay: 0.05 },
      });

      // 3. Lid snaps closed
      await lidCtrl.start({
        rotate: 0,
        transition: { duration: DURATION_OPEN * 0.8, ease: EASE_STANDARD },
      });

      itemCtrl.set({ y: 0, opacity: 0 });
      lidCtrl.set({ rotate: 0 });
      isAnimatingRef.current = false;
    }, [lidCtrl, itemCtrl, prefersReducedMotion, disabled]);

    const stopAnimation = useCallback(() => {
      isAnimatingRef.current = false;
      lidCtrl.stop();
      itemCtrl.stop();
    }, [lidCtrl, itemCtrl]);

    const resetAnimation = useCallback(() => {
      isAnimatingRef.current = false;
      lidCtrl.stop();
      itemCtrl.stop();
      lidCtrl.set({ rotate: 0 });
      itemCtrl.set({ y: 0, opacity: 0 });
    }, [lidCtrl, itemCtrl]);

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
        {/* Item dropping into the bin */}
        <motion.rect
          x="11"
          y="7"
          width="2"
          height="4"
          rx="0.5"
          fill={color}
          initial={{ y: 0, opacity: 0 }}
          animate={itemCtrl}
        />

        {/* Bin lid — rotates -30 deg around hinge (4px, 6px) */}
        <motion.path
          fill={color}
          d="M4 6V4.5A1.5 1.5 0 0 1 5.5 3h13A1.5 1.5 0 0 1 20 4.5V6H4zm5-1.5h6v1.5H9V4.5z"
          style={{ transformOrigin: '4px 6px' }}
          animate={lidCtrl}
          initial={{ rotate: 0 }}
        />

        {/* Bin body */}
        <path
          fill={color}
          d="M5 8v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8H5zm4 3.5a.75.75 0 0 1 .75.75v5.5a.75.75 0 0 1-1.5 0v-5.5A.75.75 0 0 1 9 11.5zm6 0a.75.75 0 0 1 .75.75v5.5a.75.75 0 0 1-1.5 0v-5.5a.75.75 0 0 1 .75-.75z"
        />
      </svg>
    );
  }
);
