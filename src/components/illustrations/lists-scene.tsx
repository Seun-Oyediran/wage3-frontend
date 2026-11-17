import { motion } from "motion/react";

import { box, camera, corners, type Footprint } from "./iso";
import { C, Guide, Solid, WALLET, drop, wallet } from "./shared";

/**
 * Lists, "save once": a tray lands, five wallets drop into a row on it, then
 * the tray lifts as one piece and leaves its outline on the ground. The group
 * has become a thing you can pick up again. The tray holds the bright edge.
 */

const TRAY: Footprint = [-36, -10, 36, 10];
const TRAY_H = 3;
const WALLETS = [-24, -12, 0, 12, 24];
const LIFT = 6;

const CAM = camera(2.05,[...corners(TRAY, 0), ...corners(TRAY, TRAY_H + WALLET.h + 2)], 80, 84);

const T = { guide: 0, tray: 0.2, wallets: 0.5, step: 0.09, lift: 1.25 };

/** When the entrance has settled, in seconds: the lift and its spring. */
export const LISTS_DURATION = T.lift + 0.6;

export function ListsScene() {
  return (
    <g strokeWidth={1} strokeLinecap="round">
      <Guide from={CAM.P(-46, 0, 0)} to={CAM.P(46, 0, 0)} delay={T.guide} />

      {/* Where the tray stood, shown once it lifts. */}
      <motion.path
        d={box(CAM, TRAY, 3, 1.4, 0, 0).sil}
        fill={C.plate}
        stroke={C.muted}
        strokeDasharray="2 3"
        strokeLinejoin="round"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, delay: T.lift }}
      />

      <motion.g
        initial={{ y: 0 }}
        animate={{ y: -LIFT }}
        transition={{ type: "spring", visualDuration: 0.5, bounce: 0.2, delay: T.lift }}
      >
        <motion.g {...drop(T.tray)}>
          <Solid solid={box(CAM, TRAY, 3, 1.4, 0, TRAY_H)} edge={C.ink} />
        </motion.g>
        {WALLETS.map((x, i) => (
          <motion.g key={x} {...drop(T.wallets + i * T.step)}>
            <Solid solid={wallet(CAM, x, 0, TRAY_H)} />
          </motion.g>
        ))}
      </motion.g>
    </g>
  );
}
