import type { Transition } from "motion/react";

/**
 * The sliding "you are here" indicators: sidebar pill, History tab underline, range and
 * import-tab pills. No bounce: they move on every navigation, so they glide and stop.
 */
export const SLIDE: Transition = { type: "spring", duration: 0.25, bounce: 0 };

type Bezier = [number, number, number, number];

/** The UI's default curve: fast start, long settle (same as `--ease-out` in globals.css). */
export const EASE_OUT: Bezier = [0.23, 1, 0.32, 1];
/** For things that slide a distance, like drawers and rows closing a gap (`--ease-drawer`). */
export const EASE_DRAWER: Bezier = [0.32, 0.72, 0, 1];

/** Content arriving on the page: a short fade up. Pass a growing delay to stagger a list. */
export function riseIn(delay = 0) {
  return {
    initial: { opacity: 0, transform: "translateY(6px)" },
    animate: { opacity: 1, transform: "translateY(0px)" },
    transition: { delay, duration: 0.22, ease: EASE_OUT },
  };
}
