'use client';

/**
 * Story: envelope flap opens upward to reveal interior → letter rises → settles → flap closes on leave.
 */

import { forwardRef, useCallback, useImperativeHandle } from 'react';
import { motion, useAnimation, useReducedMotion } from 'motion/react';
import type { AnimatedIconHandle, AnimatedIconProps } from '@trix/core';

const FLAP_CLOSED = 'M5 7L12 13L19 7';
const FLAP_OPEN = 'M5 7L12 2.5L19 7';

// Letter lines are drawn at their opened position (y 9.5 / 12.5), safely inside
// the envelope interior. At rest the letter is invisible, offset downward.
const LETTER_REST_OFFSET = 2.5;

const MORPH_EASE = [0.65, 0, 0.35, 1] as const;
const DURATION = 0.35;

export const MailIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  function MailIcon(
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
    const flapCtrl = useAnimation();
    const letterCtrl = useAnimation();
    const prefersReducedMotion = useReducedMotion();

    const startAnimation = useCallback(() => {
      if (prefersReducedMotion || disabled) return;
      const t = { duration: DURATION, ease: MORPH_EASE };
      flapCtrl.start({ d: FLAP_OPEN, transition: t });
      // Letter rises into its anchored position; it never approaches the walls.
      letterCtrl.start({
        y: [LETTER_REST_OFFSET, 0],
        opacity: [0, 1],
        transition: { duration: DURATION, ease: MORPH_EASE, delay: 0.05 },
      });
    }, [prefersReducedMotion, disabled, flapCtrl, letterCtrl]);

    const stopAnimation = useCallback(() => {
      flapCtrl.stop();
      letterCtrl.stop();
    }, [flapCtrl, letterCtrl]);

    const resetAnimation = useCallback(() => {
      letterCtrl.start({
        y: LETTER_REST_OFFSET,
        opacity: 0,
        transition: { duration: DURATION * 0.7, ease: MORPH_EASE },
      });
      flapCtrl.start({ d: FLAP_CLOSED, transition: { duration: DURATION, ease: MORPH_EASE } });
    }, [flapCtrl, letterCtrl]);

    useImperativeHandle(
      ref,
      () => ({ startAnimation, stopAnimation, resetAnimation }),
      [startAnimation, stopAnimation, resetAnimation]
    );

    const onMouseEnter = trigger === 'hover' && !disabled ? startAnimation : undefined;
    const onMouseLeave = trigger === 'hover' && !disabled ? resetAnimation : undefined;
    const onPointerDown = trigger === 'press' && !disabled ? startAnimation : undefined;
    const onPointerUp = trigger === 'press' && !disabled ? resetAnimation : undefined;
    const onFocus = trigger === 'focus' && !disabled ? startAnimation : undefined;
    const onBlur = trigger === 'focus' && !disabled ? resetAnimation : undefined;

    const accessibilityProps = ariaLabel
      ? ({ role: 'img', 'aria-label': ariaLabel } as const)
      : ({ 'aria-hidden': true } as const);

    const sharedPathProps = {
      fill: 'none' as const,
      stroke: color,
      strokeWidth,
      strokeLinecap: 'round' as const,
      strokeLinejoin: 'round' as const,
    };

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
        onMouseLeave={onMouseLeave}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onFocus={onFocus}
        onBlur={onBlur}
        {...accessibilityProps}
      >
        <rect
          x="3"
          y="7"
          width="18"
          height="12"
          rx="2"
          {...sharedPathProps}
        />

        <motion.path
          d="M7 9.5h10M7 12.5h6"
          animate={letterCtrl}
          initial={{ y: LETTER_REST_OFFSET, opacity: 0 }}
          {...sharedPathProps}
        />

        <motion.path
          d={FLAP_CLOSED}
          animate={flapCtrl}
          initial={{ d: FLAP_CLOSED }}
          {...sharedPathProps}
        />
      </svg>
    );
  }
);
