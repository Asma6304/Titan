import React, { useId } from 'react';

interface TitanLogoProps {
  className?: string;
}

export function TitanLogo({ className = '' }: TitanLogoProps) {
  const uid = useId().replace(/:/g, '');
  const bgId = `titan-hex-bg-${uid}`;
  const rimId = `titan-hex-rim-${uid}`;
  const topId = `titan-t-top-${uid}`;
  const leftId = `titan-t-left-${uid}`;
  const rightId = `titan-t-right-${uid}`;

  return (
    <span className={`inline-flex items-center gap-3 whitespace-nowrap shrink-0 ${className}`}>
      <span
        aria-hidden="true"
        className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-[#1A134B] ring-1 ring-violet-300/30 shadow-[0_0_26px_rgba(124,58,237,0.6)]"
      >
        <svg viewBox="0 0 40 40" className="h-8 w-8" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id={bgId} x1="4" y1="3" x2="36" y2="37" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#A855F7" />
              <stop offset="50%" stopColor="#4F46E5" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
            <linearGradient id={rimId} x1="20" y1="2" x2="20" y2="38" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F5D0FE" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.55" />
            </linearGradient>
            <linearGradient id={topId} x1="10" y1="11" x2="30" y2="17" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#E0F2FE" />
            </linearGradient>
            <linearGradient id={leftId} x1="16" y1="15" x2="20" y2="31" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#BAE6FD" />
            </linearGradient>
            <linearGradient id={rightId} x1="20" y1="15" x2="25" y2="31" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#E879F9" />
              <stop offset="100%" stopColor="#22D3EE" />
            </linearGradient>
          </defs>

          {/* Outer precision hexagonal shield */}
          <path
            d="M20 2.5L34.5 10.8V27.4L20 37.5L5.5 27.4V10.8L20 2.5Z"
            fill={`url(#${bgId})`}
            stroke={`url(#${rimId})`}
            strokeWidth="1.3"
          />

          {/* Subtle deep indigo faceted inner plate for contrast */}
          <path
            d="M20 5.5L31.8 12.3V25.9L20 34.1L8.2 25.9V12.3L20 5.5Z"
            fill="#120B38"
            fillOpacity="0.46"
          />

          {/* Sculpted 3D TITAN 'T' crossbar with chamfered wings */}
          <path
            d="M10.5 11.8H29.5L27.2 16.4H22.3L20 14.5L17.7 16.4H12.8L10.5 11.8Z"
            fill={`url(#${topId})`}
          />

          {/* Sculpted 'T' vertical pillar — left sunlit facet */}
          <path
            d="M17.2 16.4H20V30.8L17.2 28.4V16.4Z"
            fill={`url(#${leftId})`}
          />

          {/* Sculpted 'T' vertical pillar — right shaded facet */}
          <path
            d="M20 16.4H22.8V28.4L20 30.8V16.4Z"
            fill={`url(#${rightId})`}
          />

          {/* Precision geometric accent diamond at crown */}
          <path
            d="M20 7.6L21.9 9.5L20 11.4L18.1 9.5L20 7.6Z"
            fill="#22D3EE"
          />
        </svg>
      </span>
      <span className="font-display text-lg font-bold tracking-[0.14em] text-white">
        TITAN
      </span>
    </span>
  );
}
