"use client";

// Animated number — counts up from `from` to `to`. Used for priority
// scores, confidence %, points, and stat reveals (demo energy).

import { useEffect, useRef, useState } from "react";

export function CountUp({
  to,
  from = 0,
  duration = 900,
  suffix = "",
  className = "",
}: {
  to: number;
  from?: number;
  duration?: number;
  suffix?: string;
  className?: string;
}) {
  const [val, setVal] = useState(from);
  const raf = useRef<number>();

  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(Math.round(from + (to - from) * eased));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [to, from, duration]);

  return (
    <span className={`tabular-nums ${className}`}>
      {val}
      {suffix}
    </span>
  );
}
