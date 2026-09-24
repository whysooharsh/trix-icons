'use client';

/**
 * Story: dusk falls - the sun's rays absorb inward in two staggered waves,
 * the dimming core shrinks away, and the crescent rises out of the fading
 * light. No spin-swap: night emerges from day rather than replacing it.
 */

import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { motion, useAnimation, useReducedMotion } from 'motion/react';
import type { AnimatedIconHandle, AnimatedIconProps } from '@trix/core';
import { EASE_STANDARD } from '@trix/core';

const DURATION_ABSORB = 0.22;
const CARDINAL_DELAY = 0.08;
const DURATION_DIM = 0.24;
const DIM_DELAY = 0.14;
const DURATION_RISE = 0.26;
const RISE_DELAY = 0.26;

// Rays scale toward the icon center: they slide inward and vanish - absorbed.
const RAYS_SHOWN = { scale: 1, opacity: 1 };
const RAYS_ABSORBED = { scale: 0, opacity: 0 };
const CORE_SHOWN = { scale: 1, opacity: 1 };
const CORE_DIMMED = { scale: 0.55, opacity: 0 };
const MOON_HIDDEN = { scale: 0.5, rotate: -20, opacity: 0 };
const MOON_SHOWN = { scale: 1, rotate: 0, opacity: 1 };

export const ThemeIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  function ThemeIcon(
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
    const diagCtrl = useAnimation();
    const cardCtrl = useAnimation();
    const coreCtrl = useAnimation();
    const moonCtrl = useAnimation();
    const prefersReducedMotion = useReducedMotion();
    // Clicking commits the night state; it persists until clicked again.
    const lockedRef = useRef(false);

    const setNight = useCallback(
      (night: boolean) => {
        if (disabled) return;

        if (prefersReducedMotion) {
          // State swap without any tweened motion.
          diagCtrl.stop();
          cardCtrl.stop();
          coreCtrl.stop();
          moonCtrl.stop();
          diagCtrl.set(night ? RAYS_ABSORBED : RAYS_SHOWN);
          cardCtrl.set(night ? RAYS_ABSORBED : RAYS_SHOWN);
          coreCtrl.set(night ? CORE_DIMMED : CORE_SHOWN);
          moonCtrl.set(night ? MOON_SHOWN : MOON_HIDDEN);
          return;
        }

        // Parallel delayed transitions: latest call owns the end state.
        if (night) {
          diagCtrl.start({ ...RAYS_ABSORBED, transition: { duration: DURATION_ABSORB, ease: 'easeIn' } });
          cardCtrl.start({ ...RAYS_ABSORBED, transition: { delay: CARDINAL_DELAY, duration: DURATION_ABSORB, ease: 'easeIn' } });
          coreCtrl.start({ ...CORE_DIMMED, transition: { delay: DIM_DELAY, duration: DURATION_DIM, ease: 'easeIn' } });
          moonCtrl.start({ ...MOON_SHOWN, transition: { delay: RISE_DELAY, duration: DURATION_RISE, ease: EASE_STANDARD } });
        } else {
          moonCtrl.start({ ...MOON_HIDDEN, transition: { duration: DURATION_RISE * 0.8, ease: 'easeIn' } });
          coreCtrl.start({ ...CORE_SHOWN, transition: { delay: DIM_DELAY * 0.6, duration: DURATION_DIM, ease: EASE_STANDARD } });
          cardCtrl.start({ ...RAYS_SHOWN, transition: { delay: CARDINAL_DELAY + DIM_DELAY, duration: DURATION_ABSORB, ease: 'easeOut' } });
          diagCtrl.start({ ...RAYS_SHOWN, transition: { delay: CARDINAL_DELAY + DIM_DELAY + 0.06, duration: DURATION_ABSORB, ease: 'easeOut' } });
        }
      },
      [diagCtrl, cardCtrl, coreCtrl, moonCtrl, prefersReducedMotion, disabled]
    );

    const stopAnimation = useCallback(() => {
      diagCtrl.stop();
      cardCtrl.stop();
      coreCtrl.stop();
      moonCtrl.stop();
    }, [diagCtrl, cardCtrl, coreCtrl, moonCtrl]);

    const resetAnimation = useCallback(() => {
      lockedRef.current = false;
      diagCtrl.stop();
      cardCtrl.stop();
      coreCtrl.stop();
      moonCtrl.stop();
      diagCtrl.set(RAYS_SHOWN);
      cardCtrl.set(RAYS_SHOWN);
      coreCtrl.set(CORE_SHOWN);
      moonCtrl.set(MOON_HIDDEN);
    }, [diagCtrl, cardCtrl, coreCtrl, moonCtrl]);

    useImperativeHandle(
      ref,
      () => ({
        startAnimation: () => setNight(true),
        stopAnimation,
        resetAnimation,
      }),
      [setNight, stopAnimation, resetAnimation]
    );

    const onMouseEnter = trigger === 'hover' && !disabled ? () => setNight(true) : undefined;
    const onMouseLeave =
      trigger === 'hover' && !disabled
        ? () => {
            if (!lockedRef.current) setNight(false);
          }
        : undefined;
    const onPointerDown =
      (trigger === 'hover' || trigger === 'press') && !disabled
        ? () => {
            lockedRef.current = !lockedRef.current;
            setNight(lockedRef.current);
          }
        : undefined;
    const onFocus = trigger === 'focus' && !disabled ? () => setNight(true) : undefined;
    const onBlur =
      trigger === 'focus' && !disabled
        ? () => {
            if (!lockedRef.current) setNight(false);
          }
        : undefined;

    const accessibilityProps = ariaLabel
      ? ({ role: 'img', 'aria-label': ariaLabel } as const)
      : ({ 'aria-hidden': true } as const);

    const origin = { transformOrigin: '12px 12px' } as const;

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
        {/* Diagonal rays absorb first */}
        <motion.g animate={diagCtrl} initial={RAYS_SHOWN} style={origin}>
          <line x1="16.4" y1="16.4" x2="18.2" y2="18.2" />
          <line x1="7.6" y1="16.4" x2="5.8" y2="18.2" />
          <line x1="7.6" y1="7.6" x2="5.8" y2="5.8" />
          <line x1="16.4" y1="7.6" x2="18.2" y2="5.8" />
        </motion.g>

        {/* Cardinal rays follow */}
        <motion.g animate={cardCtrl} initial={RAYS_SHOWN} style={origin}>
          <line x1="18.2" y1="12" x2="20.8" y2="12" />
          <line x1="12" y1="18.2" x2="12" y2="20.8" />
          <line x1="5.8" y1="12" x2="3.2" y2="12" />
          <line x1="12" y1="5.8" x2="12" y2="3.2" />
        </motion.g>

        {/* The dimming core */}
        <motion.circle
          cx="12"
          cy="12"
          r="4"
          animate={coreCtrl}
          initial={CORE_SHOWN}
          style={origin}
        />

        {/* Night rises from the fading light */}
        <motion.path
          d="M12 3.5a5.75 5.75 0 0 0 8.25 8.25A8.5 8.5 0 1 1 12 3.5Z"
          animate={moonCtrl}
          initial={MOON_HIDDEN}
          style={origin}
        />
      </svg>
    );
  }
);
