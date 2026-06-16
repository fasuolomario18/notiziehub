"use client";

import { useEffect, useRef, useState } from "react";
import { formatFull } from "@/lib/format";

/**
 * Contatore "split-flap"/odometro (elemento-firma, brief sez. 6):
 * il numero conta-su all'ingresso. Rispetta prefers-reduced-motion
 * (chi le disattiva vede il valore finale statico).
 */
export function Odometer({
  value,
  className = "",
}: {
  value: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(value);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduce) {
      setDisplay(value);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true;
          const duration = 1100;
          const start = performance.now();
          const from = 0;
          const tick = (now: number) => {
            const t = Math.min(1, (now - start) / duration);
            // easeOutExpo
            const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
            setDisplay(Math.round(from + (value - from) * eased));
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value]);

  return (
    <span ref={ref} className={`tabnum ${className}`}>
      {formatFull(display)}
    </span>
  );
}
