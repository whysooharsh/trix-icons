'use client';

/**
 * Story: blink shut — the pupil shrinks away as the gaze goes out, and a
 * lash line draws across the eye. The eye closes the way eyes close; the
 * outline stays intact so both states read as the same control.
 */

import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { motion, useAnimation, useReducedMotion } from 'motion/react';
import type { AnimatedIconHandle, AnimatedIconProps } from '@trix/core';
import { EASE_DRAW, EASE_STANDARD } from '@trix/core';

const DURATION_PUPIL = 0.18;
const DURATION_LASH = 0.2;
const LASH_DELAY = 0.08;
const DURATION_UNWRITE = 0.14;

const LASH_HIDDEN = { pathLength: 0, opacity: 0 };
const LASH_SHOWN = { pathLength: 1, opacity: 1 };
const PUPIL_OPEN = { scale: 1, opacity: 1 };
const PUPIL_SHUT = { scale: 0.2, opacity: 0 };

export const VisibilityIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  function VisibilityIcon(
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
    const lashCtrl = useAnimation();
    const pupilCtrl = useAnimation();
    const prefersReducedMotion = useReducedMotion();
    // Clicking commits the hidden state; it persists until clicked again.
    const lockedRef = useRef(false);

    const setHidden = useCallback(
      (hidden: boolean) => {
        if (disabled) return;

        if (prefersReducedMotion) {
          // State swap without any tweened motion.
          lashCtrl.stop();
          pupilCtrl.stop();
          lashCtrl.set(hidden ? LASH_SHOWN : LASH_HIDDEN);
          pupilCtrl.set(hidden ? PUPIL_SHUT : PUPIL_OPEN);
          return;
        }

        // Staged transitions: latest call owns the end state.
        if (hidden) {
          pupilCtrl.start({
            ...PUPIL_SHUT,
            transition: { duration: DURATION_PUPIL, ease: EASE_STANDARD },
          });
          lashCtrl.start({
            ...LASH_SHOWN,
            transition: { delay: LASH_DELAY, duration: DURATION_LASH, ease: EASE_DRAW },
          });
        } else {
          lashCtrl.start({ ...LASH_HIDDEN, transition: { duration: DURATION_UNWRITE, ease: 'easeIn' } });
          pupilCtrl.start({
            ...PUPIL_OPEN,
            transition: { delay: DURATION_UNWRITE, duration: DURATION_PUPIL, ease: EASE_STANDARD },
          });
        }
      },
      [lashCtrl, pupilCtrl, prefersReducedMotion, disabled]
    );

    const stopAnimation = useCallback(() => {
      lashCtrl.stop();
      pupilCtrl.stop();
    }, [lashCtrl, pupilCtrl]);

    const resetAnimation = useCallback(() => {
      lockedRef.current = false;
      lashCtrl.stop();
      pupilCtrl.stop();
      lashCtrl.set(LASH_HIDDEN);
      pupilCtrl.set(PUPIL_OPEN);
    }, [lashCtrl, pupilCtrl]);

    useImperativeHandle(
      ref,
      () => ({
        startAnimation: () => setHidden(true),
        stopAnimation,
        resetAnimation,
      }),
      [setHidden, stopAnimation, resetAnimation]
    );

    const onMouseEnter = trigger === 'hover' && !disabled ? () => setHidden(true) : undefined;
    const onMouseLeave =
      trigger === 'hover' && !disabled
        ? () => {
            if (!lockedRef.current) setHidden(false);
          }
        : undefined;
    const onPointerDown =
      (trigger === 'hover' || trigger === 'press') && !disabled
        ? () => {
            lockedRef.current = !lockedRef.current;
            setHidden(lockedRef.current);
          }
        : undefined;
    const onFocus = trigger === 'focus' && !disabled ? () => setHidden(true) : undefined;
    const onBlur =
      trigger === 'focus' && !disabled
        ? () => {
            if (!lockedRef.current) setHidden(false);
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
        <path d="M2.5 12c2-4.7 5.4-7 9.5-7s7.5 2.3 9.5 7c-2 4.7-5.4 7-9.5 7s-7.5-2.3-9.5-7Z" />
        <motion.circle
          cx="12"
          cy="12"
          r="2.75"
          animate={pupilCtrl}
          initial={PUPIL_OPEN}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        />
        <motion.path
          d="M7 11.5Q12 14 17 11.5"
          animate={lashCtrl}
          initial={LASH_HIDDEN}
        />
      </svg>
    );
  }
);
