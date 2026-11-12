"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";

import type { SignatureData } from "@/content/signatures";

// Pen speed in signature units per second, and the pause between strokes.
const SPEED = 150;
const LIFT = 0.12;
const HEIGHT = 48;

/** Each stroke's start and duration: one pen at SPEED, lifting briefly between strokes. */
function timeStrokes(strokes: SignatureData["strokes"]) {
  return strokes.reduce<(SignatureData["strokes"][number] & { start: number; duration: number })[]>((acc, s) => {
    const prev = acc[acc.length - 1];
    const start = prev ? prev.start + prev.duration + LIFT : 0;
    return [...acc, { ...s, start, duration: s.length / SPEED }];
  }, []);
}

/**
 * A signature that draws on like a pen, stroke after stroke, the first time it scrolls into
 * view. Shown whole under reduced motion.
 */
export function Signature({ signature, label }: { signature: SignatureData; label: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.8 });
  const reduce = useReducedMotion();
  const { width, height, strokes } = signature;

  const timed = timeStrokes(strokes);

  return (
    <svg
      ref={ref}
      role="img"
      aria-label={label}
      viewBox={`0 0 ${width} ${height}`}
      height={HEIGHT}
      width={(width / height) * HEIGHT}
      className="text-fg"
    >
      {timed.map((s) => (
        <motion.path
          key={s.d}
          d={s.d}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.25}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          initial={reduce ? false : { pathLength: 0, opacity: 0 }}
          animate={inView || reduce ? { pathLength: 1, opacity: 1 } : undefined}
          transition={{
            pathLength: { delay: s.start, duration: s.duration, ease: [0.65, 0, 0.35, 1] },
            opacity: { delay: s.start, duration: 0.01 },
          }}
        />
      ))}
    </svg>
  );
}
