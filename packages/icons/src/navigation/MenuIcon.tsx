'use client';

/**
 * Story: closing the menu dismisses its items - the three lines settle away
 * one-by-one, top first, like entries leaving a list - and then the close X
 * writes itself stroke by stroke over the emptied space.
 */

import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { motion, useAnimation, useReducedMotion } from 'motion/react';
import type { AnimatedIconHandle, AnimatedIconProps } from '@trix/core';
import { EASE_DRAW, EASE_STANDARD } from '@trix/core';

const DURATION_DISMISS = 0.15;
const DURATION_DRAW = 0.22;
const DURATION_UNDRAW = 0.12;
const DURATION_RESTORE = 0.16;

// Items leave top-first; they return bottom-first so both cascades read downward.
const DISMISS_STAGGER = 0.04;
const RESTORE_STAGGER = 0.05;
const DELAY_FIRST_DRAW = 0.2;
const DRAW_STAGGER = 0.08;
const DELAY_RESTORE = 0.06;

const SETTLE_DISTANCE = 2.5;

// All transitions run in parallel with delays (no awaited chains), so a trigger
// change mid-animation simply retargets - the latest call owns the end state.
const LINE_REST = { y: 0, opacity: 1 };
const LINE_GONE = { y: SETTLE_DISTANCE, opacity: 0 };
const DIAG_REST = { pathLength: 0, opacity: 0 };
const DIAG_DRAWN = { pathLength: 1, opacity: 1 };

export const MenuIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  function MenuIcon(
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
    const topCtrl = useAnimation();
    const midCtrl = useAnimation();
    const botCtrl = useAnimation();
    const slashCtrl = useAnimation();
    const backslashCtrl = useAnimation();
    const prefersReducedMotion = useReducedMotion();
    // Clicking commits the open (X) state; it persists until clicked again.
    const lockedRef = useRef(false);

    const setOpen = useCallback(
      (open: boolean) => {
        if (disabled) return;

        if (prefersReducedMotion) {
          // State swap without any tweened motion.
          topCtrl.stop();
          midCtrl.stop();
          botCtrl.stop();
          slashCtrl.stop();
          backslashCtrl.stop();
          topCtrl.set(open ? LINE_GONE : LINE_REST);
          midCtrl.set(open ? LINE_GONE : LINE_REST);
          botCtrl.set(open ? LINE_GONE : LINE_REST);
          slashCtrl.set(open ? DIAG_DRAWN : DIAG_REST);
          backslashCtrl.set(open ? DIAG_DRAWN : DIAG_REST);
          return;
        }

        const lineCtrls = [topCtrl, midCtrl, botCtrl];

        if (open) {
          // 1. Items dismiss, top first.
          lineCtrls.forEach((ctrl, i) => {
            ctrl.start({
              ...LINE_GONE,
              transition: {
                delay: i * DISMISS_STAGGER,
                duration: DURATION_DISMISS,
                ease: 'easeIn',
              },
            });
          });
          // 2. The close mark writes itself stroke by stroke.
          backslashCtrl.start({
            ...DIAG_DRAWN,
            transition: { delay: DELAY_FIRST_DRAW, duration: DURATION_DRAW, ease: EASE_DRAW },
          });
          slashCtrl.start({
            ...DIAG_DRAWN,
            transition: { delay: DELAY_FIRST_DRAW + DRAW_STAGGER, duration: DURATION_DRAW, ease: EASE_DRAW },
          });
        } else {
          // 1. The mark unwrites itself.
          slashCtrl.start({ ...DIAG_REST, transition: { duration: DURATION_UNDRAW, ease: 'easeIn' } });
          backslashCtrl.start({ ...DIAG_REST, transition: { duration: DURATION_UNDRAW, ease: 'easeIn' } });
          // 2. Items return, bottom first.
          [...lineCtrls].reverse().forEach((ctrl, i) => {
            ctrl.start({
              ...LINE_REST,
              transition: {
                delay: DELAY_RESTORE + i * RESTORE_STAGGER,
                duration: DURATION_RESTORE,
                ease: EASE_STANDARD,
              },
            });
          });
        }
      },
      [topCtrl, midCtrl, botCtrl, slashCtrl, backslashCtrl, prefersReducedMotion, disabled]
    );

    const stopAnimation = useCallback(() => {
      topCtrl.stop();
      midCtrl.stop();
      botCtrl.stop();
      slashCtrl.stop();
      backslashCtrl.stop();
    }, [topCtrl, midCtrl, botCtrl, slashCtrl, backslashCtrl]);

    const resetAnimation = useCallback(() => {
      lockedRef.current = false;
      topCtrl.stop();
      midCtrl.stop();
      botCtrl.stop();
      slashCtrl.stop();
      backslashCtrl.stop();
      topCtrl.set(LINE_REST);
      midCtrl.set(LINE_REST);
      botCtrl.set(LINE_REST);
      slashCtrl.set(DIAG_REST);
      backslashCtrl.set(DIAG_REST);
    }, [topCtrl, midCtrl, botCtrl, slashCtrl, backslashCtrl]);

    useImperativeHandle(
      ref,
      () => ({
        startAnimation: () => setOpen(true),
        stopAnimation,
        resetAnimation,
      }),
      [setOpen, stopAnimation, resetAnimation]
    );

    const onMouseEnter = trigger === 'hover' && !disabled ? () => setOpen(true) : undefined;
    const onMouseLeave =
      trigger === 'hover' && !disabled
        ? () => {
            if (!lockedRef.current) setOpen(false);
          }
        : undefined;
    const onPointerDown =
      (trigger === 'hover' || trigger === 'press') && !disabled
        ? () => {
            lockedRef.current = !lockedRef.current;
            setOpen(lockedRef.current);
          }
        : undefined;
    const onFocus = trigger === 'focus' && !disabled ? () => setOpen(true) : undefined;
    const onBlur =
      trigger === 'focus' && !disabled
        ? () => {
            if (!lockedRef.current) setOpen(false);
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
        {/* Menu items - they dismiss one by one */}
        <motion.line x1="4" y1="6" x2="20" y2="6" animate={topCtrl} initial={LINE_REST} />
        <motion.line x1="4" y1="12" x2="20" y2="12" animate={midCtrl} initial={LINE_REST} />
        <motion.line x1="4" y1="18" x2="20" y2="18" animate={botCtrl} initial={LINE_REST} />
        {/* The close mark writes itself */}
        <motion.path d="M6 6L18 18" animate={backslashCtrl} initial={DIAG_REST} />
        <motion.path d="M18 6L6 18" animate={slashCtrl} initial={DIAG_REST} />
      </svg>
    );
  }
);
