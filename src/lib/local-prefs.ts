"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

/**
 * Small per-browser store for things the API doesn't hold yet (list logos, company details).
 * Survives reloads on this device only; move each key to the backend when it gets a field.
 */
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  const onStorage = () => l();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", onStorage);
  };
};

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // Storage full or blocked: the value just doesn't persist.
  }
  emit();
}

export function useLocalValue(key: string) {
  const value = useSyncExternalStore(subscribe, () => read(key), () => null);
  const set = useCallback((v: string | null) => write(key, v), [key]);
  return [value, set] as const;
}

/** A list's logo as a data URL, or null. */
export const useListLogo = (listId: string) => useLocalValue(`wage3.list-logo.${listId}`);

export type Company = { logo: string | null; name: string; email: string };

const COMPANY_KEY = "wage3.company";
const NO_COMPANY: Company = { logo: null, name: "", email: "" };

/** The stored company with every field filled in; a missing or corrupt value reads as empty. */
function parseCompany(raw: string | null): Company {
  if (!raw) return NO_COMPANY;
  try {
    return { ...NO_COMPANY, ...(JSON.parse(raw) as Partial<Company>) };
  } catch {
    return NO_COMPANY;
  }
}

export function useCompany() {
  const [raw, setRaw] = useLocalValue(COMPANY_KEY);
  const company = useMemo(() => parseCompany(raw), [raw]);
  // Merges into what's stored right now, so two quick edits can't overwrite each other.
  const update = useCallback((patch: Partial<Company>) => setRaw(JSON.stringify({ ...parseCompany(read(COMPANY_KEY)), ...patch })), [setRaw]);
  return [company, update] as const;
}

/** Reads the company straight from storage, for code outside React (exports). Null when none is set. */
export function readCompany(): Company | null {
  const raw = typeof window === "undefined" ? null : read(COMPANY_KEY);
  return raw ? parseCompany(raw) : null;
}
