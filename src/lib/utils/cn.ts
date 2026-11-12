import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * The font-size tokens from globals.css (`text-13` etc.). Without them tailwind-merge reads
 * `text-13` as a text colour and drops it next to one (`text-13 text-fg-muted`).
 */
const FONT_SIZES = ["11", "12", "13", "14", "15", "17", "20", "22", "24", "28", "32", "40"];

const twMerge = extendTailwindMerge({ extend: { theme: { text: FONT_SIZES } } });

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
