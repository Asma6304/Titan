import React, { useEffect, useRef, useState } from 'react';

interface AnimatedCounterProps {
  end: number;
  suffix?: string;
  decimals?: number;
  durationMs?: number;
}

export function AnimatedCounter({
  end,
  suffix = '',
  decimals = 0,
  durationMs = 1100,
}: AnimatedCounterProps) {
  const [value, setValue] = useState(end);
  const hasAnimatedRef = useRef(false);
  const elRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el || hasAnimatedRef.current) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setValue(end);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || hasAnimatedRef.current) return;
        hasAnimatedRef.current = true;
        const start = performance.now();
        const step = (now: number) => {
          const progress = Math.min(1, (now - start) / durationMs);
          const eased = 1 - Math.pow(1 - progress, 3);
          setValue(end * eased);
          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            setValue(end);
          }
        };
        requestAnimationFrame(step);
        observer.disconnect();
      },
      { threshold: 0.25 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [end, durationMs]);

  const formatted =
    decimals > 0
      ? value.toFixed(decimals)
      : Math.round(value).toLocaleString('en-US');

  return (
    <span ref={elRef} className="font-mono tabular-nums">
      {formatted}
      {suffix}
    </span>
  );
}
