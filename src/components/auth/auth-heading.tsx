import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";
import { DISPLAY_TEXT } from "@/lib/type";

/** A sign-in step's title and line, centred under the mark. The same on every step, so it doesn't jump. */
export function AuthHeading({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <h1 className={cn(DISPLAY_TEXT, "text-center text-22 leading-7 font-semibold tracking-[-0.02em]")}>{title}</h1>
      <p className={cn(DISPLAY_TEXT, "mt-1 text-center text-15 text-fg-muted text-pretty")}>{children}</p>
    </>
  );
}
