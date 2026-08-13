'use client';

/**
 * Story: envelope flap opens upward to reveal interior → letter rises → settles → flap closes on leave.
 */

import { forwardRef, useCallback, useImperativeHandle } from 'react';
import { motion, useAnimation, useReducedMotion } from 'motion/react';
import type { AnimatedIconHandle, AnimatedIconProps } from '@trix/core';

const FLAP_CLOSED = 'M3 7L12 13L21 7';
const FLAP_OPEN = 'M3 7L12 1L21 7';

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
      letterCtrl.start({ y: -4, opacity: 1, transition: { duration: DURATION, ease: MORPH_EASE, delay: 0.05 } });
    }, [prefersReducedMotion, disabled, flapCtrl, letterCtrl]);

    const stopAnimation = useCallback(() => {
      flapCtrl.stop();
      letterCtrl.stop();
    }, [flapCtrl, letterCtrl]);

    const resetAnimation = useCallback(() => {
      const t = { duration: DURATION, ease: MORPH_EASE };
      letterCtrl.start({ y: 0, opacity: 0, transition: { duration: DURATION * 0.7, ease: MORPH_EASE } });
      flapCtrl.start({ d: FLAP_CLOSED, transition: t });
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
        {/* Envelope Base Body */}
        <rect
          x="3"
          y="7"
          width="18"
          height="12"
          rx="2"
          {...sharedPathProps}
        />

        {/* Letter rising out of envelope */}
        <motion.path
          d="M7 11h10M7 14h6"
          animate={letterCtrl}
          initial={{ y: 0, opacity: 0 }}
          {...sharedPathProps}
        />

        {/* Envelope Flap — morphs from pointing down (Y=13) to pointing up (Y=1) */}
        <motion.path
          animate={flapCtrl}
          initial={{ d: FLAP_CLOSED }}
          {...sharedPathProps}
        />
      </svg>
    );
  }
);
