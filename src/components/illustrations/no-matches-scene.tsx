import { motion } from "motion/react";

import { C } from "./shared";

/**
 * No matches, "nothing under the lens": the same flat rows as the payments
 * scene, faint, and a magnifier that sweeps across them and settles on an
 * empty patch, a dashed line where a match would be.
 */

const CARD = { x: 26, y: 44, w: 108, h: 72, r: 10 };
const ROWS = [60, 80, 100];
const LENS = { cx: 90, cy: 78, r: 19 };

const T = { card: 0, rows: 0.15, lens: 0.45, sweep: 1.1, empty: 1.55 };

/** When the entrance has settled, in seconds: the empty line drawn. */
export const NO_MATCHES_DURATION = T.empty + 0.4;

export function NoMatchesScene() {
  return (
    <g strokeLinecap="round" strokeLinejoin="round">
      <motion.g
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ y: { type: "spring", visualDuration: 0.45, bounce: 0.25, delay: T.card }, opacity: { duration: 0.15, delay: T.card } }}
      >
        <rect x={CARD.x} y={CARD.y} width={CARD.w} height={CARD.h} rx={CARD.r} fill={C.plate} stroke={C.line} strokeWidth={1.5} />
        {ROWS.map((y, i) => (
          <motion.g
            key={y}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25, delay: T.rows + i * 0.07 }}
          >
            <circle cx={CARD.x + 16} cy={y} r={4} fill={C.line} />
            <rect x={CARD.x + 26} y={y - 2} width={30} height={4} rx={2} fill={C.line} />
            <rect x={CARD.x + 76} y={y - 2} width={18} height={4} rx={2} fill={C.line} />
          </motion.g>
        ))}
      </motion.g>

      {/* Comes in from the right, sweeps left past the rows and back, and settles. */}
      <motion.g
        initial={{ x: 34, opacity: 0 }}
        animate={{ x: [34, -22, 8, 0], opacity: 1 }}
        transition={{
          x: { duration: T.sweep, delay: T.lens, ease: "easeInOut", times: [0, 0.45, 0.8, 1] },
          opacity: { duration: 0.15, delay: T.lens },
        }}
      >
        <path
          d={`M${LENS.cx + LENS.r * 0.72} ${LENS.cy + LENS.r * 0.72}l13 13`}
          stroke={C.ink}
          strokeWidth={6}
          fill="none"
        />
        {/* The plate fill hides the rows under the lens: there's nothing there. */}
        <circle cx={LENS.cx} cy={LENS.cy} r={LENS.r} fill={C.plate} stroke={C.ink} strokeWidth={3} />
        <motion.path
          d={`M${LENS.cx - 8} ${LENS.cy}h16`}
          stroke={C.muted}
          strokeWidth={1.5}
          strokeDasharray="2 3.5"
          fill="none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: T.empty }}
        />
      </motion.g>
    </g>
  );
}
