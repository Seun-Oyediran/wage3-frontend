"use client";

import { useEffect, useState } from "react";

/** Whole seconds left until `until` (a timestamp), ticking each second and stopping at 0. */
export function useCountdown(until: number) {
  const [now, setNow] = useState(() => Date.now());
  const left = Math.max(0, Math.ceil((until - now) / 1000));
  const done = left === 0;

  useEffect(() => {
    if (done) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [done]);

  return left;
}
