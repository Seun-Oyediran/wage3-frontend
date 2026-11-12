import { motion } from "motion/react";

import { C } from "./shared";

/**
 * Payments, "rows arriving": flat and front-on like the table behind it. Two
 * faint rows wait at the back; the front one rises into place, fills in (name,
 * blue amount) and its status lands as a green Done. It's what this page lists.
 */

const CARD = { x: 22, w: 116, h: 40, r: 10 };
const BACK = [
  { y: 46, inset: 16 },
  { y: 58, inset: 8 },
];
const FRONT_Y = 72;

const T = { back: 0, front: 0.22, content: 0.55, status: 0.95 };

/** When the entrance has settled, in seconds: the check finishing. */
export const ROWS_DURATION = T.status + 0.65;

function rise(delay: number, distance = 10) {
  return {
    initial: { opacity: 0, y: distance },
    animate: { opacity: 1, y: 0 },
    transition: {
      y: { type: "spring", visualDuration: 0.45, bounce: 0.25, delay },
      opacity: { duration: 0.15, delay },
    },
  } as const;
}

/** A bar growing from its left end. */
function grow(delay: number) {
  return {
    initial: { scaleX: 0, opacity: 0 },
    animate: { scaleX: 1, opacity: 1 },
    transition: { scaleX: { duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: 0.01, delay } },
    style: { transformBox: "fill-box", originX: 0 },
  } as const;
}

export function RowsScene() {
  const y = FRONT_Y;
  return (
    <g strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      {BACK.map((b, i) => (
        <motion.g key={b.y} {...rise(T.back + i * 0.08, 6)}>
          <rect
            x={CARD.x + b.inset}
            y={b.y}
            width={CARD.w - b.inset * 2}
            height={CARD.h}
            rx={CARD.r}
            fill={C.plate}
            stroke={C.line}
          />
          <rect x={CARD.x + b.inset + 12} y={b.y + 5} width={28} height={3} rx={1.5} fill={C.line} />
        </motion.g>
      ))}

      <motion.g {...rise(T.front, 14)}>
        {/* A soft contact shadow, so the front row sits above the others. */}
        <rect x={CARD.x} y={y + 3} width={CARD.w} height={CARD.h} rx={CARD.r} fill={C.line} opacity={0.6} />
        <rect x={CARD.x} y={y} width={CARD.w} height={CARD.h} rx={CARD.r} fill={C.plate} stroke={C.line} />

        <circle cx={CARD.x + 18} cy={y + 20} r={8} fill={C.line} />
        <motion.rect x={CARD.x + 32} y={y + 14} width={40} height={5} rx={2.5} fill={C.muted} {...grow(T.content)} />
        <motion.rect x={CARD.x + 32} y={y + 23} width={26} height={4} rx={2} fill={C.line} {...grow(T.content + 0.08)} />
        <motion.rect x={CARD.x + 78} y={y + 13} width={26} height={5} rx={2.5} fill={C.ink} {...grow(T.content + 0.12)} />

        {/* Status: the pill pops in, then the check draws. */}
        <motion.g
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ scale: { type: "spring", visualDuration: 0.3, bounce: 0.4, delay: T.status }, opacity: { duration: 0.1, delay: T.status } }}
          style={{ transformBox: "fill-box", originX: 0.5, originY: 0.5 }}
        >
          <rect x={CARD.x + 82} y={y + 22} width={22} height={10} rx={5} fill={C.okSoft} />
          <motion.path
            d={`M${CARD.x + 89} ${y + 27}l2.5 2.5l5-5`}
            fill="none"
            stroke={C.ok}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ pathLength: { duration: 0.3, delay: T.status + 0.2 }, opacity: { duration: 0.01, delay: T.status + 0.2 } }}
          />
        </motion.g>
      </motion.g>
    </g>
  );
}
