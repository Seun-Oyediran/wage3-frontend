"use client";

import { useSyncExternalStore } from "react";

import { Shimmer } from "@/components/ui/shimmer";
import { Spinner } from "@/components/ui/spinner";
import { authApi } from "@/lib/api/endpoints";
import { LAST_SIGN_IN } from "@/lib/auth/last-sign-in";
import { useLocalValue } from "@/lib/local-prefs";

/*
 * Whether this page is on its way to Google, so the button shows a spinner and can't be pressed
 * twice. Coming Back from Google's consent screen restores the page from the bfcache exactly as it
 * was, spinner and all, so a `pageshow` from the cache clears it.
 */
let leavingForGoogle = false;
const leavingListeners = new Set<() => void>();
const setLeavingForGoogle = (v: boolean) => {
  leavingForGoogle = v;
  leavingListeners.forEach((l) => l());
};
const subscribeLeaving = (l: () => void) => {
  leavingListeners.add(l);
  const onShow = (e: PageTransitionEvent) => {
    if (e.persisted) setLeavingForGoogle(false);
  };
  window.addEventListener("pageshow", onShow);
  return () => {
    leavingListeners.delete(l);
    window.removeEventListener("pageshow", onShow);
  };
};

/**
 * "Continue with Google", as a pill at the foot of the sign-in page. A "Last used" tag shows when
 * Google was this browser's last way in (the callback records it once log-in succeeds).
 */
export function GoogleButton() {
  const [last] = useLocalValue(LAST_SIGN_IN);
  const going = useSyncExternalStore(subscribeLeaving, () => leavingForGoogle, () => false);
  return (
    <button
      type="button"
      onClick={() => {
        setLeavingForGoogle(true);
        window.location.href = authApi.googleStartUrl;
      }}
      disabled={going}
      className="pressable relative inline-flex h-10 items-center gap-2.5 rounded-full bg-surface px-4 text-14 font-medium shadow-(--shadow-xs) hover:shadow-(--shadow-sm) disabled:opacity-70"
    >
      {going ? <Spinner className="size-4.5" /> : <GoogleIcon />}
      Continue with Google
      {/* A tag straddling the top-right corner, so it reads as a label on the button, not part of it. */}
      {last === "google" && (
        <span className="absolute -top-3 -right-5 inline-flex h-6 items-center rounded-[12px] border border-[oklch(0.908_0.044_270)] bg-[oklch(0.59_0.191_274.9)] px-2 py-[5px] text-12 leading-none font-medium shadow-(--shadow-xs)">
          <Shimmer tone="light">Last used</Shimmer>
        </span>
      )}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4.5" aria-hidden>
      <path fill="oklch(0.63 0.18 260)" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
      <path fill="oklch(0.648 0.16 148.5)" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="oklch(0.83 0.17 84)" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.93l3.66-2.83z" />
      <path fill="oklch(0.626 0.206 29.1)" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.6 10.6 0 0 0 12 1 11 11 0 0 0 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}
