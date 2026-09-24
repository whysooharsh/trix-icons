'use client';

/**
 * Story: broadcast — the mark winds up and gathers energy, a ripple charges
 * into the source node, data packets fire along both arms, and impact
 * ripples blast from the receiving nodes. One-shot, ends at rest.
 */

import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { motion, useAnimation, useReducedMotion } from 'motion/react';
import type { AnimatedIconHandle, AnimatedIconProps } from '@trix/core';

const DURATION_WINDUP = 0.7;

const ICON_REST = { scale: 1, rotate: 0 };
const SOURCE_REST = { r: 40, opacity: 0 };
const PACKET_REST = { opacity: 0, scale: 0, x: 0, y: 0 };
const DEST_REST = { r: 60, opacity: 0 };

export const ShareIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  function ShareIcon(
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
    const iconCtrl = useAnimation();
    const sourceRippleCtrl = useAnimation();
    const packet1Ctrl = useAnimation();
    const packet2Ctrl = useAnimation();
    const destRipple1Ctrl = useAnimation();
    const destRipple2Ctrl = useAnimation();
    const prefersReducedMotion = useReducedMotion();
    const isAnimatingRef = useRef(false);

    const startAnimation = useCallback(async () => {
      if (prefersReducedMotion || disabled || isAnimatingRef.current) return;
      isAnimatingRef.current = true;

      try {
        iconCtrl.start({
          rotate: [0, -12, 8, 0],
          scale: [1, 0.92, 1.08, 1],
          transition: {
            duration: DURATION_WINDUP,
            ease: 'easeInOut',
            times: [0, 0.4, 0.7, 1],
          },
        });

        sourceRippleCtrl.start({
          r: [160, 40],
          opacity: [0, 1, 0],
          strokeWidth: [8, 40],
          transition: { duration: 0.4, ease: 'easeIn' },
        });

        packet1Ctrl.start({
          x: [0, 440],
          y: [0, -272],
          scale: [0.2, 1, 1, 0],
          opacity: [0, 1, 1, 0],
          transition: { duration: 0.25, ease: 'easeIn', delay: 0.35, times: [0, 0.2, 0.9, 1] },
        });
        packet2Ctrl.start({
          x: [0, 440],
          y: [0, 272],
          scale: [0.2, 1, 1, 0],
          opacity: [0, 1, 1, 0],
          transition: { duration: 0.25, ease: 'easeIn', delay: 0.35, times: [0, 0.2, 0.9, 1] },
        });

        destRipple2Ctrl.start({
          r: [60, 240],
          opacity: [1, 0],
          strokeWidth: [40, 0],
          transition: { duration: 0.5, ease: 'easeOut', delay: 0.6 },
        });

        await destRipple1Ctrl.start({
          r: [60, 240],
          opacity: [1, 0],
          strokeWidth: [40, 0],
          transition: { duration: 0.5, ease: 'easeOut', delay: 0.6 },
        });
      } finally {
        iconCtrl.set(ICON_REST);
        sourceRippleCtrl.set(SOURCE_REST);
        packet1Ctrl.set(PACKET_REST);
        packet2Ctrl.set(PACKET_REST);
        destRipple1Ctrl.set(DEST_REST);
        destRipple2Ctrl.set(DEST_REST);
        isAnimatingRef.current = false;
      }
    }, [iconCtrl, sourceRippleCtrl, packet1Ctrl, packet2Ctrl, destRipple1Ctrl, destRipple2Ctrl, prefersReducedMotion, disabled]);

    const stopAnimation = useCallback(() => {
      isAnimatingRef.current = false;
      iconCtrl.stop();
      sourceRippleCtrl.stop();
      packet1Ctrl.stop();
      packet2Ctrl.stop();
      destRipple1Ctrl.stop();
      destRipple2Ctrl.stop();
    }, [iconCtrl, sourceRippleCtrl, packet1Ctrl, packet2Ctrl, destRipple1Ctrl, destRipple2Ctrl]);

    const resetAnimation = useCallback(() => {
      isAnimatingRef.current = false;
      iconCtrl.stop();
      sourceRippleCtrl.stop();
      packet1Ctrl.stop();
      packet2Ctrl.stop();
      destRipple1Ctrl.stop();
      destRipple2Ctrl.stop();
      iconCtrl.set(ICON_REST);
      sourceRippleCtrl.set(SOURCE_REST);
      packet1Ctrl.set(PACKET_REST);
      packet2Ctrl.set(PACKET_REST);
      destRipple1Ctrl.set(DEST_REST);
      destRipple2Ctrl.set(DEST_REST);
    }, [iconCtrl, sourceRippleCtrl, packet1Ctrl, packet2Ctrl, destRipple1Ctrl, destRipple2Ctrl]);

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
        viewBox="0 0 1024 1024"
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
        <motion.g
          style={{ originX: '50%', originY: '50%' }}
          initial={ICON_REST}
          animate={iconCtrl}
        >
          <motion.circle
            cx="312"
            cy="512"
            r="40"
            fill="none"
            stroke={color}
            initial={SOURCE_REST}
            animate={sourceRippleCtrl}
          />

          <motion.circle
            cx="752"
            cy="240"
            r="60"
            fill="none"
            stroke={color}
            initial={DEST_REST}
            animate={destRipple1Ctrl}
          />
          <motion.circle
            cx="752"
            cy="784"
            r="60"
            fill="none"
            stroke={color}
            initial={DEST_REST}
            animate={destRipple2Ctrl}
          />

          <motion.circle
            cx="312"
            cy="512"
            r="45"
            fill={color}
            initial={PACKET_REST}
            animate={packet1Ctrl}
          />
          <motion.circle
            cx="312"
            cy="512"
            r="45"
            fill={color}
            initial={PACKET_REST}
            animate={packet2Ctrl}
          />

          <path
            fill={color}
            d="M752 664c-28.5 0-54.8 10-75.4 26.7L469.4 540.8a160.7 160.7 0 0 0 0-57.6l207.2-149.9C697.2 350 723.5 360 752 360c66.2 0 120-53.8 120-120s-53.8-120-120-120s-120 53.8-120 120c0 11.6 1.6 22.7 4.7 33.3L439.9 415.8C410.7 377.1 364.3 352 312 352c-88.4 0-160 71.6-160 160s71.6 160 160 160c52.3 0 98.7-25.1 127.9-63.8l196.8 142.5c-3.1 10.6-4.7 21.8-4.7 33.3c0 66.2 53.8 120 120 120s120-53.8 120-120s-53.8-120-120-120m0-476c28.7 0 52 23.3 52 52s-23.3 52-52 52s-52-23.3-52-52s23.3-52 52-52M312 600c-48.5 0-88-39.5-88-88s39.5-88 88-88s88 39.5 88 88s-39.5 88-88 88m440 236c-28.7 0-52-23.3-52-52s23.3-52 52-52s52 23.3 52 52s-23.3 52-52 52"
          />
        </motion.g>
      </svg>
    );
  }
);
