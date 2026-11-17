"use client";

import { useEffect } from "react";

/** While `active`, closing or reloading the tab asks first (the browser's own "Leave site?" prompt). */
export function useLeaveWarning(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [active]);
}
