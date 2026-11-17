import { motion } from "motion/react";

import { cylinder, type ICamera, type ISolid } from "./iso";

/**
 * Empty-state illustrations: hairline isometric solids, adapted from Mindmap's
 * blueprint scenes. Drawn at the slot's real size, so a 1-unit stroke is 1px.
 */
export const SIZE = 160;
export const VIEW_BOX = `0 0 ${SIZE} ${SIZE}`;

/** Colours come from CSS variables set on the slot in `index.tsx`. */
export const C = {
  plate: "var(--illo-plate)",
  line: "var(--illo-line)",
  muted: "var(--illo-muted)",
  ink: "var(--illo-ink)",
  /** The flat scenes' "done" status: a green check on a soft green pill. */
  ok: "var(--illo-ok)",
  okSoft: "var(--illo-ok-soft)",
};

export const EASE = [0.22, 1, 0.36, 1] as const;

/** Falls a short way and settles with a small bounce. */
export function drop(delay = 0, height = 10) {
  return {
    initial: { opacity: 0, y: -height },
    animate: { opacity: 1, y: 0 },
    transition: {
      y: { type: "spring", visualDuration: 0.4, bounce: 0.35, delay },
      opacity: { duration: 0.12, delay },
    },
  } as const;
}

/**
 * Draws a stroke in. Opacity snaps on as drawing starts: at pathLength 0 a
 * round linecap still renders as a dot.
 */
export function draw(delay = 0, duration = 0.7) {
  return {
    initial: { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1 },
    transition: {
      pathLength: { duration, delay, ease: EASE },
      opacity: { duration: 0.01, delay },
    },
  };
}

/** A solid filled with the plate, so it hides what's behind: outline plus one dim crease. */
export function Solid({ solid, edge = C.muted }: { solid: ISolid; edge?: string }) {
  return (
    <g>
      <path d={solid.sil} fill={C.plate} stroke={edge} strokeLinejoin="round" />
      <path d={solid.crease} fill="none" stroke={C.line} strokeLinejoin="round" />
    </g>
  );
}

/** A thin construction line between two screen points. Paint it before the solids, so they cover it. */
export function Guide({ from, to, delay = 0 }: { from: [number, number]; to: [number, number]; delay?: number }) {
  return <motion.path d={`M${from.join(" ")}L${to.join(" ")}`} stroke={C.line} fill="none" {...draw(delay)} />;
}

/** The motif both scenes share: a wallet, a short round solid. */
export const WALLET = { r: 5, h: 9 };

export function wallet(cam: ICamera, x: number, y: number, z = 0) {
  return cylinder(cam, x, y, WALLET.r, 1.2, z, z + WALLET.h);
}
