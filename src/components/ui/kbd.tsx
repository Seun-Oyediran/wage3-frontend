"use client";

import type { ReactNode } from "react";

import { CommandIcon } from "@/components/ui/icons";
import { useHydrated } from "@/lib/auth/use-session";

/** A key as a small keycap, read inline with the tip around it. */
export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="mx-px inline-grid h-[18px] min-w-[18px] place-items-center rounded-[5px] bg-surface px-1 align-middle font-sans text-11 leading-none font-medium text-fg-muted shadow-(--shadow-xs) [text-box:trim-both_cap_alphabetic]">
      {children}
    </kbd>
  );
}

/** The shortcut modifier for this device: ⌘ on Apple devices, Ctrl elsewhere. */
export function ModKey() {
  // ⌘ until hydrated, so server and first client render agree.
  const hydrated = useHydrated();
  const apple = !hydrated || /Mac|iPhone|iPad/.test(navigator.userAgent);
  return (
    <Kbd>
      {apple ? <CommandIcon className="size-2.5" strokeWidth={2.5} aria-hidden={false} role="img" aria-label="Command" /> : "Ctrl"}
    </Kbd>
  );
}
