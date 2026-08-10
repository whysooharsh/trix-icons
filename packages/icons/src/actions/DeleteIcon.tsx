'use client';

/**
 * DeleteIcon — Trash bin with a hinged lid animation.
 *
 * Animation: lid-hinge
 * The icon is split into two semantic layers:
 *   1. Bin body  — static; contains the slots via fill-rule="evenodd".
 *   2. Lid       — rotates -25° around its left-bottom hinge point on hover.
 *
 * Hinge point: (4, 6) in SVG coordinate space — the left-bottom corner of the
 * lid path's bounding box (x:4–20, y:3–6). Expressed as transformOrigin
 * '0% 100%' with transformBox 'fill-box', which resolves to that exact point.
 *
 * On press: the entire icon content (wrapped in a motion.g) scales to 0.92,
 * matching the project's destructive-action press convention.
 *
 * Two independent animation controls:
 *   lidCtrl — governs lid rotation only
 *   svgCtrl — governs whole-icon press scale only
 *
 * Hover state and press state are independent: pressing while hovered keeps
 * the lid open, releasing while still hovered returns scale to 1 (not rest).
 * isHoveredRef tracks this.
 *
 * Reduced motion: static — no lid rotation or press scale plays.
 */

import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { motion, useAnimation, useReducedMotion } from 'motion/react';
import type { AnimatedIconHandle, AnimatedIconProps } from '@trix/core';

// ─── Animation constants ──────────────────────────────────────────────────────

// Spring overshoot ease from CSS reference: cubic-bezier(0.34, 1.56, 0.64, 1)
// Produces a slight overshoot past -25° before settling, like a real lid spring.
const LID_EASE = [0.34, 1.56, 0.64, 1] as const;
const LID_DURATION = 0.3;

const PRESS_EASE = 'easeOut' as const;
const PRESS_DURATION = 0.1;

// ─── Component ────────────────────────────────────────────────────────────────

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
    const svgCtrl = useAnimation();
    const prefersReducedMotion = useReducedMotion();

    // Track hover so that pointerUp returns to hover (not rest) when cursor
    // is still over the icon.
    const isHoveredRef = useRef(false);

    // ─── Lid helpers ──────────────────────────────────────────────────────────

    const openLid = useCallback(() => {
      lidCtrl.start({
        rotate: -25,
        transition: { duration: LID_DURATION, ease: LID_EASE },
      });
    }, [lidCtrl]);

    const closeLid = useCallback(() => {
      lidCtrl.start({
        rotate: 0,
        transition: { duration: LID_DURATION, ease: LID_EASE },
      });
    }, [lidCtrl]);

    // ─── Press helpers ────────────────────────────────────────────────────────

    const pressDown = useCallback(() => {
      svgCtrl.start({
        scale: 0.92,
        transition: { duration: PRESS_DURATION, ease: PRESS_EASE },
      });
    }, [svgCtrl]);

    const pressUp = useCallback(() => {
      svgCtrl.start({
        scale: 1,
        transition: { duration: PRESS_DURATION, ease: PRESS_EASE },
      });
    }, [svgCtrl]);

    // ─── AnimatedIconHandle ───────────────────────────────────────────────────

    const startAnimation = useCallback(() => {
      if (prefersReducedMotion || disabled) return;
      openLid();
    }, [prefersReducedMotion, disabled, openLid]);

    const stopAnimation = useCallback(() => {
      lidCtrl.stop();
      svgCtrl.stop();
    }, [lidCtrl, svgCtrl]);

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

    // ─── Event handlers ───────────────────────────────────────────────────────

    const handleMouseEnter = useCallback(() => {
      if (prefersReducedMotion || disabled) return;
      isHoveredRef.current = true;
      openLid();
    }, [prefersReducedMotion, disabled, openLid]);

    const handleMouseLeave = useCallback(() => {
      isHoveredRef.current = false;
      closeLid();
      // Always restore scale on leave in case a press was in progress.
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
    const onPointerDown =
      (trigger === 'hover' || trigger === 'press') && !disabled
        ? handlePointerDown
        : undefined;
    const onPointerUp =
      (trigger === 'hover' || trigger === 'press') && !disabled
        ? handlePointerUp
        : undefined;
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
        style={{
          color,
          display: 'block',
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
        {/*
          Wrapper group handles the whole-icon press scale.
          transform-origin: center of the full icon content area (≈ 12, 12).
        */}
        <motion.g
          animate={svgCtrl}
          initial={{ scale: 1 }}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        >
          {/* Bin body — static, contains inner slot cutouts via fill-rule */}
          <path
            fill={color}
            fillRule="evenodd"
            d="M7 21q-.825 0-1.412-.587T5 19V6h14v13q0 .825-.587 1.413T17 21zm2-4h2V8H9zm4 0h2V8h-2z"
          />

          {/*
            Lid — rotates on its left-bottom hinge.
            Lid bounding box: x 4–20, y 3–6.
            transformOrigin '0% 100%' with transformBox 'fill-box' places the
            pivot exactly at (4, 6) — the hinge corner from the CSS original.
          */}
          <motion.path
            fill={color}
            d="M4 6V4h5V3h6v1h5v2Z"
            animate={lidCtrl}
            initial={{ rotate: 0 }}
            style={{
              transformBox: 'fill-box',
              transformOrigin: '0% 100%',
            }}
          />
        </motion.g>
      </svg>
    );
  }
);
