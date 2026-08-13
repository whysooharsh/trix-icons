'use client';

import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { motion, useAnimation, useReducedMotion } from 'motion/react';
import type { AnimatedIconHandle, AnimatedIconProps } from '@trix/core';

const LID_DURATION = 0.3;
const PRESS_DURATION = 0.1;

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
    const svgCtrl = useAnimation();
    const prefersReducedMotion = useReducedMotion();
    const isHoveredRef = useRef(false);
    const [lidOpen, setLidOpen] = useState(false);

    const openLid = useCallback(() => setLidOpen(true), []);
    const closeLid = useCallback(() => setLidOpen(false), []);

    const pressDown = useCallback(() => {
      svgCtrl.start({ scale: 0.92, transition: { duration: PRESS_DURATION, ease: 'easeOut' } });
    }, [svgCtrl]);

    const pressUp = useCallback(() => {
      svgCtrl.start({ scale: 1, transition: { duration: PRESS_DURATION, ease: 'easeOut' } });
    }, [svgCtrl]);

    const startAnimation = useCallback(() => {
      if (prefersReducedMotion || disabled) return;
      openLid();
    }, [prefersReducedMotion, disabled, openLid]);

    const stopAnimation = useCallback(() => {
      svgCtrl.stop();
    }, [svgCtrl]);

    const resetAnimation = useCallback(() => {
      isHoveredRef.current = false;
      closeLid();
      pressUp();
    }, [closeLid, pressUp]);

    useImperativeHandle(
      ref,
      () => ({ startAnimation, stopAnimation, resetAnimation }),
      [startAnimation, stopAnimation, resetAnimation]
    );

    const handleMouseEnter = useCallback(() => {
      if (prefersReducedMotion || disabled) return;
      isHoveredRef.current = true;
      openLid();
    }, [prefersReducedMotion, disabled, openLid]);

    const handleMouseLeave = useCallback(() => {
      isHoveredRef.current = false;
      closeLid();
      pressUp();
    }, [closeLid, pressUp]);

    const handlePointerDown = useCallback(() => {
      if (prefersReducedMotion || disabled) return;
      pressDown();
    }, [prefersReducedMotion, disabled, pressDown]);

    const handlePointerUp = useCallback(() => {
      if (prefersReducedMotion || disabled) return;
      pressUp();
    }, [prefersReducedMotion, disabled, pressUp]);

    const onMouseEnter = trigger === 'hover' && !disabled ? handleMouseEnter : undefined;
    const onMouseLeave = trigger === 'hover' && !disabled ? handleMouseLeave : undefined;
    const onPointerDown = (trigger === 'hover' || trigger === 'press') && !disabled ? handlePointerDown : undefined;
    const onPointerUp = (trigger === 'hover' || trigger === 'press') && !disabled ? handlePointerUp : undefined;
    const onFocus = trigger === 'focus' && !disabled ? startAnimation : undefined;
    const onBlur = trigger === 'focus' && !disabled ? resetAnimation : undefined;

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
        onMouseLeave={onMouseLeave}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onFocus={onFocus}
        onBlur={onBlur}
        {...accessibilityProps}
      >
        <motion.g
          animate={svgCtrl}
          initial={{ scale: 1 }}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        >
          <path
            fill={color}
            fillRule="evenodd"
            d="M7 21q-.825 0-1.412-.587T5 19V6h14v13q0 .825-.587 1.413T17 21zm2-4h2V8H9zm4 0h2V8h-2z"
          />
          <path
            fill={color}
            d="M4 6V4h5V3h6v1h5v2Z"
            style={{
              transformOrigin: '4px 6px',
              transform: lidOpen ? 'rotate(-25deg)' : 'rotate(0deg)',
              transition: prefersReducedMotion
                ? 'none'
                : `transform ${LID_DURATION}s cubic-bezier(0.34, 1.56, 0.64, 1)`,
            }}
          />
        </motion.g>
      </svg>
    );
  }
);
