'use client';

/**
 * Story: play collapses into pause - the triangle's vertical edge slides into
 * the first bar while the chevron's apex folds inward until it lies flat,
 * becoming the second bar. Both paths share an identical M-L-L command
 * structure, so the browser interpolates coordinates, not shapes.
 */

import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { motion, useAnimation, useReducedMotion } from 'motion/react';
import type { AnimatedIconHandle, AnimatedIconProps } from '@trix/core';
import { EASE_STANDARD } from '@trix/core';

const DURATION_MORPH = 0.28;

// Identical command structure (M L L) is what makes the morph legitimate.
const BAR1_PLAY = 'M8 5.5L8 12L8 18.5';
const BAR1_PAUSE = 'M9.5 6L9.5 12L9.5 18';
const CHEVRON_PLAY = 'M8 5.5L19 12L8 18.5';
const CHEVRON_PAUSE = 'M14.5 6L14.5 12L14.5 18';

export const PlayPauseIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  function PlayPauseIcon(
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
    const bar1Ctrl = useAnimation();
    const chevronCtrl = useAnimation();
    const prefersReducedMotion = useReducedMotion();
    // Clicking commits the pause state; it persists until clicked again.
    const lockedRef = useRef(false);

    const setPaused = useCallback(
      (paused: boolean) => {
        if (disabled) return;

        const d1 = paused ? BAR1_PAUSE : BAR1_PLAY;
        const d2 = paused ? CHEVRON_PAUSE : CHEVRON_PLAY;

        if (prefersReducedMotion) {
          // State swap without any tweened motion.
          bar1Ctrl.stop();
          chevronCtrl.stop();
          bar1Ctrl.set({ d: d1 });
          chevronCtrl.set({ d: d2 });
          return;
        }

        const transition = { duration: DURATION_MORPH, ease: EASE_STANDARD };
        bar1Ctrl.start({ d: d1, transition });
        chevronCtrl.start({ d: d2, transition });
      },
      [bar1Ctrl, chevronCtrl, prefersReducedMotion, disabled]
    );

    const stopAnimation = useCallback(() => {
      bar1Ctrl.stop();
      chevronCtrl.stop();
    }, [bar1Ctrl, chevronCtrl]);

    const resetAnimation = useCallback(() => {
      lockedRef.current = false;
      bar1Ctrl.stop();
      chevronCtrl.stop();
      bar1Ctrl.set({ d: BAR1_PLAY });
      chevronCtrl.set({ d: CHEVRON_PLAY });
    }, [bar1Ctrl, chevronCtrl]);

    useImperativeHandle(
      ref,
      () => ({
        startAnimation: () => setPaused(true),
        stopAnimation,
        resetAnimation,
      }),
      [setPaused, stopAnimation, resetAnimation]
    );

    const onMouseEnter = trigger === 'hover' && !disabled ? () => setPaused(true) : undefined;
    const onMouseLeave =
      trigger === 'hover' && !disabled
        ? () => {
            if (!lockedRef.current) setPaused(false);
          }
        : undefined;
    const onPointerDown =
      (trigger === 'hover' || trigger === 'press') && !disabled
        ? () => {
            lockedRef.current = !lockedRef.current;
            setPaused(lockedRef.current);
          }
        : undefined;
    const onFocus = trigger === 'focus' && !disabled ? () => setPaused(true) : undefined;
    const onBlur =
      trigger === 'focus' && !disabled
        ? () => {
            if (!lockedRef.current) setPaused(false);
          }
        : undefined;

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
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
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
        onBlur={onBlur}
        {...accessibilityProps}
      >
        <motion.path d={BAR1_PLAY} animate={bar1Ctrl} initial={{ d: BAR1_PLAY }} />
        <motion.path d={CHEVRON_PLAY} animate={chevronCtrl} initial={{ d: CHEVRON_PLAY }} />
      </svg>
    );
  }
);
