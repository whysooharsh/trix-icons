'use client';

/**
 * Story: document duplication → front sheet peels forward and offsets while rear sheet duplicates behind → settles.
 *
 * Animation: layered-duplication
 * On hover the two sheets para
 * llax apart: the front sheet lifts toward the
 * viewer (translate +1px,+1px / scale 1.05) while the back sheet recedes
 * (translate -1px,-1px / scale 0.95 / opacity 0.3). This communicates the
 * idea of layered duplication — one document becoming two.
 *
 * On press both sheets compress to scale(0.95) matching the project's
 * press convention (80–150ms, scale 0.92–0.96).
 *
 * The animation reverses on hover-leave.
 *
 * Transform origins:
 *   front-sheet bounding box: x 6–21, y 5–22 → centre ≈ (13.5, 13.5)
 *   back-sheet  bounding box: x 3–17, y 2–19  → centre ≈ (10,   10.5)
 *   Both use transform-box: fill-box + transform-origin: center so that
 *   motion/react resolves the origin to each path's own geometric centre —
 *   matching the CSS transform-origin="14px 14px" / "10px 10px" from the
 *   HTML reference demo.
 *
 * Easing:
 *   hover → cubic-bezier(0.33, 1, 0.68, 1)  (ease-out-cubic, 0.3s)
 *   press → easeOut (0.1s)
 *
 * Reduced motion: static — no transforms or opacity changes play.
 */

import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { motion, useAnimation, useReducedMotion } from 'motion/react';
import type { AnimatedIconHandle, AnimatedIconProps } from '@trix/core';

// ─── Animation constants ──────────────────────────────────────────────────────

// Hover easing from the CSS reference: cubic-bezier(0.33, 1, 0.68, 1)
const HOVER_EASE = [0.33, 1, 0.68, 1] as const;
const HOVER_DURATION = 0.3;

const PRESS_EASE = 'easeOut' as const;
const PRESS_DURATION = 0.1;

// ─── Shared rest / hover / press states ──────────────────────────────────────

const FRONT_REST = { x: 0, y: 0, scale: 1, opacity: 1 };
const FRONT_HOVER = { x: 1, y: 1, scale: 1.05, opacity: 1 };
const FRONT_PRESS = { x: 0, y: 0, scale: 0.95, opacity: 1 };

// Back sheet starts at opacity 0.5 in the resting state (matching the SVG
// opacity=".5" attribute). Hover reduces it further to 0.3 (receding).
// Press brings it back to 0.8 (compressed together).
const BACK_REST = { x: 0, y: 0, scale: 1, opacity: 0.5 };
const BACK_HOVER = { x: -1, y: -1, scale: 0.95, opacity: 0.3 };
const BACK_PRESS = { x: 0, y: 0, scale: 0.95, opacity: 0.8 };

// ─── Component ────────────────────────────────────────────────────────────────

export const CopyIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  function CopyIcon(
    {
      size = 24,
      color = 'currentColor',
      strokeWidth = 1.5,
      className,
      trigger = 'hover',
      disabled = false,
      'aria-label': ariaLabel,
    },
    ref
  ) {
    const frontCtrl = useAnimation();
    const backCtrl = useAnimation();
    const prefersReducedMotion = useReducedMotion();

    // Track whether we are in a hover state so that pointerUp can return to
    // the correct state (hover, not rest) when the cursor is still over the icon.
    const isHoveredRef = useRef(false);

    // ─── Animation helpers ────────────────────────────────────────────────────

    const applyHover = useCallback(() => {
      const t = { duration: HOVER_DURATION, ease: HOVER_EASE };
      frontCtrl.start({ ...FRONT_HOVER, transition: t });
      backCtrl.start({ ...BACK_HOVER, transition: t });
    }, [frontCtrl, backCtrl]);

    const applyRest = useCallback(() => {
      const t = { duration: HOVER_DURATION, ease: HOVER_EASE };
      frontCtrl.start({ ...FRONT_REST, transition: t });
      backCtrl.start({ ...BACK_REST, transition: t });
    }, [frontCtrl, backCtrl]);

    const applyPress = useCallback(() => {
      const t = { duration: PRESS_DURATION, ease: PRESS_EASE };
      frontCtrl.start({ ...FRONT_PRESS, transition: t });
      backCtrl.start({ ...BACK_PRESS, transition: t });
    }, [frontCtrl, backCtrl]);

    // ─── AnimatedIconHandle ───────────────────────────────────────────────────

    const startAnimation = useCallback(() => {
      if (prefersReducedMotion || disabled) return;
      applyHover();
    }, [prefersReducedMotion, disabled, applyHover]);

    const stopAnimation = useCallback(() => {
      frontCtrl.stop();
      backCtrl.stop();
    }, [frontCtrl, backCtrl]);

    const resetAnimation = useCallback(() => {
      isHoveredRef.current = false;
      applyRest();
    }, [applyRest]);

    useImperativeHandle(
      ref,
      () => ({ startAnimation, stopAnimation, resetAnimation }),
      [startAnimation, stopAnimation, resetAnimation]
    );

    // ─── Event handlers ───────────────────────────────────────────────────────

    const handleMouseEnter = useCallback(() => {
      if (prefersReducedMotion || disabled) return;
      isHoveredRef.current = true;
      applyHover();
    }, [prefersReducedMotion, disabled, applyHover]);

    const handleMouseLeave = useCallback(() => {
      isHoveredRef.current = false;
      applyRest();
    }, [applyRest]);

    const handlePointerDown = useCallback(() => {
      if (prefersReducedMotion || disabled) return;
      applyPress();
    }, [prefersReducedMotion, disabled, applyPress]);

    const handlePointerUp = useCallback(() => {
      if (prefersReducedMotion || disabled) return;
      // Return to hover state if the cursor is still over the icon, rest otherwise.
      if (isHoveredRef.current) {
        applyHover();
      } else {
        applyRest();
      }
    }, [prefersReducedMotion, disabled, applyHover, applyRest]);

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

    const sharedPathStyle = {
      transformBox: 'fill-box' as const,
      transformOrigin: 'center' as const,
    };

    const sharedStrokeProps = {
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
        {/* Front sheet — lifts toward the viewer on hover */}
        <motion.path
          d="M6 11c0-2.828 0-4.243.879-5.121C7.757 5 9.172 5 12 5h3c2.828 0 4.243 0 5.121.879C21 6.757 21 8.172 21 11v5c0 2.828 0 4.243-.879 5.121C19.243 22 17.828 22 15 22h-3c-2.828 0-4.243 0-5.121-.879C6 20.243 6 18.828 6 16z"
          animate={frontCtrl}
          initial={FRONT_REST}
          style={sharedPathStyle}
          {...sharedStrokeProps}
        />

        {/* Back sheet — recedes into the background on hover */}
        <motion.path
          d="M6 19a3 3 0 0 1-3-3v-6c0-3.771 0-5.657 1.172-6.828S7.229 2 11 2h4a3 3 0 0 1 3 3"
          animate={backCtrl}
          initial={BACK_REST}
          style={sharedPathStyle}
          {...sharedStrokeProps}
        />
      </svg>
    );
  }
);
