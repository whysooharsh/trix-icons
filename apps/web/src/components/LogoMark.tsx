import React from 'react';

interface LogoMarkProps {
  size?: number;
  className?: string;
  gradientId?: string;
  startColor?: string;
  stopColor?: string;
}

export function LogoMark({
  size = 28,
  className,
  gradientId = 'gradMonoLogo',
  startColor = '#1E293B',
  stopColor = '#3D52A0',
}: LogoMarkProps) {
  const maskId = `stem-mask-${gradientId}`;
  const shadowId = `shadow-${gradientId}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={startColor} />
          <stop offset="100%" stopColor={stopColor} />
        </linearGradient>

        <filter id={shadowId} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow
            dx="0"
            dy="3"
            stdDeviation="3"
            floodColor="#1E293B"
            floodOpacity="0.25"
          />
        </filter>

        <mask id={maskId}>
          <rect width="100" height="100" fill="white" />
          <circle cx="28" cy="28" r="16.5" fill="black" />
          <path
            d="M 62 18 L 82 28 L 62 38 Z"
            fill="black"
            stroke="black"
            strokeWidth="13"
            strokeLinejoin="round"
          />
        </mask>
      </defs>

      {/* Foundation Stem */}
      <rect
        x="38"
        y="30"
        width="24"
        height="56"
        rx="12"
        fill={`url(#${gradientId})`}
        mask={`url(#${maskId})`}
      />

      {/* Geometry Circle */}
      <circle
        cx="28"
        cy="28"
        r="14"
        fill={`url(#${gradientId})`}
        filter={`url(#${shadowId})`}
      />

      {/* Animation Play Button */}
      <path
        d="M 62 18 L 82 28 L 62 38 Z"
        fill={`url(#${gradientId})`}
        stroke={`url(#${gradientId})`}
        strokeWidth="8"
        strokeLinejoin="round"
        filter={`url(#${shadowId})`}
      />
    </svg>
  );
}
