"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useEffectEvent, useRef, useState } from "react";

import type { YmdRange } from "@/components/ui/date-picker";
import { groupedStatusLabel } from "@/components/ui/status-badge";
import { useDebounced } from "@/hooks/use-debounced";
import { useSentHistory } from "@/lib/api/queries";
import type { SentStatus } from "@/lib/api/types";

const PAGE_SIZE = 20;

export const STATUSES: { value: SentStatus | undefined; label: string }[] = [
  { value: undefined, label: "All" },
  // The same names as the status badges in the table, so a tab always matches its rows.
  { value: "submitted", label: groupedStatusLabel("submitted") },
  { value: "paid", label: groupedStatusLabel("paid") },
  { value: "partially_paid", label: groupedStatusLabel("partially_paid") },
];

function toStatus(s: string | null) {
  return STATUSES.find((t) => t.value && t.value === s)?.value;
}

/**
 * The History page's state. Every filter lives in the URL (q, status, list, from, to, page), so
 * a filtered view can be linked to, and the dashboard can deep-link to "Needs attention".
 */
export function useHistory() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const search = params.get("q") ?? "";
  const status = toStatus(params.get("status"));
  const listId = params.get("list") ?? "";
  const from = params.get("from") ?? "";
  const to = params.get("to") ?? "";
  const page = Math.max(1, Number(params.get("page")) || 1);

  // Caught here so the request isn't sent at all; the backend would reject it the same way.
  const dateError = from && to && from > to ? "The start date must be on or before the end date" : null;
  const hasFilters = !!(search || status || listId || from || to);

  const history = useSentHistory({
    search: search || undefined,
    status,
    list_id: listId || undefined,
    from: (!dateError && from) || undefined,
    to: (!dateError && to) || undefined,
    page,
    limit: PAGE_SIZE,
  });

  /** Changing any filter goes back to page 1, unless the patch sets the page itself. */
  const setParams = (patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    if (!("page" in patch)) next.delete("page");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  // The search box updates as you type; the URL follows once typing pauses. `lastPushed` tells
  // our own URL changes apart from outside ones (Back, Clear filters), which the box follows.
  const [searchInput, setSearchInput] = useState(search);
  const lastPushed = useRef(search);
  useEffect(() => {
    if (search !== lastPushed.current) {
      lastPushed.current = search;
      setSearchInput(search);
    }
  }, [search]);

  const debouncedSearch = useDebounced(searchInput.trim(), 300);
  const pushSearch = useEffectEvent((value: string) => {
    lastPushed.current = value;
    setParams({ q: value || undefined });
  });
  useEffect(() => {
    if (debouncedSearch !== lastPushed.current) pushSearch(debouncedSearch);
  }, [debouncedSearch]);

  // A page past the end (e.g. results shrank since the link was made): go to the last real page.
  const totalPages = history.data?.pagination.total_pages;
  const goToLastPage = useEffectEvent((last: number) => setParams({ page: last > 1 ? String(last) : undefined }));
  useEffect(() => {
    if (totalPages !== undefined && page > totalPages) goToLastPage(totalPages);
  }, [totalPages, page]);

  return {
    history,
    filters: { status, listId, from, to, dateError, hasFilters },
    searchInput,
    setSearchInput,
    setStatus: (s: SentStatus | undefined) => setParams({ status: s }),
    setList: (id: string) => setParams({ list: id || undefined }),
    setTime: (range: YmdRange) => setParams({ from: range.from || undefined, to: range.to || undefined }),
    /** Clears what the Filters menu sets (list and time); search and status stay. */
    resetMenuFilters: () => setParams({ list: undefined, from: undefined, to: undefined }),
    clearAll: () => {
      setSearchInput("");
      lastPushed.current = "";
      router.replace(pathname, { scroll: false });
    },
    goToPage: (p: number) => {
      setParams({ page: p > 1 ? String(p) : undefined });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
  };
}
