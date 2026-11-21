import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'motion/react';

interface ClickBurst {
  id: number;
  x: number;
  y: number;
}

interface TrailDot {
  id: number;
  x: number;
  y: number;
  color: string;
}

const TRAIL_COLORS = ['#22D3EE', '#A855F7', '#EC4899', '#6366F1'];

export function CursorAura() {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [interactive, setInteractive] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [bursts, setBursts] = useState<ClickBurst[]>([]);
  const [trail, setTrail] = useState<TrailDot[]>([]);

  const rawX = useMotionValue(-300);
  const rawY = useMotionValue(-300);

  // Fast crisp dot
  const dotX = useSpring(rawX, { stiffness: 900, damping: 42, mass: 0.25 });
  const dotY = useSpring(rawY, { stiffness: 900, damping: 42, mass: 0.25 });

  // Silky lagging magnetic ring
  const ringX = useSpring(rawX, { stiffness: 260, damping: 28, mass: 0.55 });
  const ringY = useSpring(rawY, { stiffness: 260, damping: 28, mass: 0.55 });

  // Broad ambient indigo-cyan spotlight glow
  const glowX = useSpring(rawX, { stiffness: 120, damping: 26, mass: 0.9 });
  const glowY = useSpring(rawY, { stiffness: 120, damping: 26, mass: 0.9 });

  const lastTrailRef = useRef({ x: 0, y: 0, time: 0, idx: 0 });
  const idCounterRef = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isCoarse = window.matchMedia('(pointer: coarse)').matches;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isCoarse || prefersReduced) return;

    setEnabled(true);

    const handleMove = (e: MouseEvent) => {
      rawX.set(e.clientX);
      rawY.set(e.clientY);
      setVisible(true);

      const target = e.target as HTMLElement | null;
      const isInteractiveEl = Boolean(
        target?.closest('a, button, input, select, textarea, label, [role="button"], article')
      );
      setInteractive(isInteractiveEl);

      // Emit subtle luminous trail particles when moving briskly
      const now = performance.now();
      const dx = e.clientX - lastTrailRef.current.x;
      const dy = e.clientY - lastTrailRef.current.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 28 && now - lastTrailRef.current.time > 32) {
        const id = ++idCounterRef.current;
        const color = TRAIL_COLORS[lastTrailRef.current.idx % TRAIL_COLORS.length];
        lastTrailRef.current = {
          x: e.clientX,
          y: e.clientY,
          time: now,
          idx: lastTrailRef.current.idx + 1,
        };
        setTrail((prev) => [...prev.slice(-10), { id, x: e.clientX, y: e.clientY, color }]);
        window.setTimeout(() => {
          setTrail((prev) => prev.filter((item) => item.id !== id));
        }, 460);
      }
    };

    const handleDown = (e: MouseEvent) => {
      setPressed(true);
      const id = ++idCounterRef.current;
      setBursts((prev) => [...prev.slice(-4), { id, x: e.clientX, y: e.clientY }]);
      window.setTimeout(() => {
        setBursts((prev) => prev.filter((b) => b.id !== id));
      }, 550);
    };

    const handleUp = () => setPressed(false);
    const handleLeave = () => setVisible(false);

    window.addEventListener('mousemove', handleMove, { passive: true });
    window.addEventListener('mousedown', handleDown, { passive: true });
    window.addEventListener('mouseup', handleUp, { passive: true });
    document.addEventListener('mouseleave', handleLeave);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mousedown', handleDown);
      window.removeEventListener('mouseup', handleUp);
      document.removeEventListener('mouseleave', handleLeave);
    };
  }, [rawX, rawY]);

  if (!enabled) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {/* Ambient cursor spotlight aura */}
      <motion.div
        style={{ x: glowX, y: glowY }}
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        className="fixed left-0 top-0 -ml-44 -mt-44 h-88 w-88 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.18)_0%,rgba(34,211,238,0.1)_38%,transparent_72%)] blur-2xl will-change-transform"
      />

      {/* Luminous motion trail sparks */}
      <AnimatePresence>
        {trail.map((dot) => (
          <motion.span
            key={dot.id}
            initial={{ opacity: 0.75, scale: 1, x: dot.x - 3, y: dot.y - 3 }}
            animate={{ opacity: 0, scale: 0.15, y: dot.y - 11 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.44, ease: 'easeOut' }}
            style={{ backgroundColor: dot.color, boxShadow: `0 0 12px ${dot.color}` }}
            className="fixed left-0 top-0 h-1.5 w-1.5 rounded-full will-change-transform"
          />
        ))}
      </AnimatePresence>

      {/* Click ripple rings */}
      <AnimatePresence>
        {bursts.map((burst) => (
          <motion.span
            key={burst.id}
            initial={{ opacity: 0.85, scale: 0.25, x: burst.x - 24, y: burst.y - 24 }}
            animate={{ opacity: 0, scale: 1.9 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-0 top-0 h-12 w-12 rounded-full border border-[#22D3EE] shadow-[0_0_20px_rgba(34,211,238,0.55)] will-change-transform"
          />
        ))}
      </AnimatePresence>

      {/* Spring-following magnetic halo ring */}
      <motion.div
        style={{ x: ringX, y: ringY }}
        animate={{
          opacity: visible ? 1 : 0,
          scale: pressed ? 0.78 : interactive ? 1.55 : 1,
          borderColor: interactive ? 'rgba(34, 211, 238, 0.85)' : 'rgba(192, 132, 252, 0.6)',
          backgroundColor: interactive ? 'rgba(34, 211, 238, 0.08)' : 'rgba(139, 92, 246, 0.02)',
        }}
        transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
        className="fixed left-0 top-0 -ml-4.5 -mt-4.5 h-9 w-9 rounded-full border-[1.5px] shadow-[0_0_16px_rgba(139,92,246,0.4)] will-change-transform"
      />

      {/* Crisp luminous inner tracker dot */}
      <motion.div
        style={{ x: dotX, y: dotY }}
        animate={{
          opacity: visible ? 1 : 0,
          scale: pressed ? 1.5 : interactive ? 0.65 : 1,
        }}
        transition={{ duration: 0.12 }}
        className="fixed left-0 top-0 -ml-1 -mt-1 h-2 w-2 rounded-full bg-gradient-to-tr from-[#22D3EE] to-[#F472B6] shadow-[0_0_10px_rgba(34,211,238,0.9)] will-change-transform"
      />
    </div>
  );
}
