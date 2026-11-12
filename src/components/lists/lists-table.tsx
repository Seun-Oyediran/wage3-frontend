"use client";

import { motion } from "motion/react";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ListSummary } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";
import { formatCount, formatRelative, pluralize } from "@/lib/utils/format";

import { ListAvatar } from "./list-avatar";
import { PayAgainButton } from "./pay-again-button";

// Header and rows share one track list, all fixed sizes: an "auto" action column sized to the
// header's empty cell would shift the others.
const COLS = "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 sm:grid-cols-[minmax(0,1fr)_96px_160px_128px]";

/** Lists as a table: logo and name, then the facts, then Pay again. `animate` fades the rows in. */
export function ListsTable({ lists, animate }: { lists: ListSummary[]; animate: boolean }) {
  return (
    <Card className="overflow-hidden">
      <div className={cn(COLS, "hidden border-b border-border bg-surface-sunken px-5 py-2.5 text-xs font-medium text-fg-subtle sm:grid")}>
        <span>List</span>
        <span className="text-right">People</span>
        <span>Updated</span>
        <span className="sr-only">Actions</span>
      </div>
      <ul className="divide-y divide-border">
        {lists.map((list, i) => (
          <ListRow key={list.id} list={list} index={i} animate={animate} />
        ))}
      </ul>
    </Card>
  );
}

export function ListsTableSkeleton() {
  return (
    <Card className="overflow-hidden" aria-busy>
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="flex items-center gap-3 border-b border-border px-5 py-3.5 last:border-b-0">
          <Skeleton className="size-9 rounded-full" />
          <Skeleton className="h-4 w-40" />
        </div>
      ))}
    </Card>
  );
}

function ListRow({ list, index, animate }: { list: ListSummary; index: number; animate: boolean }) {
  return (
    <motion.li
      initial={animate ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, delay: animate ? Math.min(index, 8) * 0.03 : 0 }}
      className={cn(COLS, "relative px-5 py-3 transition-colors duration-150 hover:bg-surface-hover")}
    >
      {/* The whole row opens the list; Pay again sits above the link. */}
      <Link
        href={`/lists/${list.id}`}
        aria-label={`Open ${list.name}`}
        className="absolute inset-0 outline-offset-[-2px] focus-visible:outline-2 focus-visible:outline-primary"
      />
      <div className="flex min-w-0 items-center gap-3">
        <ListAvatar listId={list.id} size="sm" />
        <div className="min-w-0">
          <div className="truncate text-sm font-medium">{list.name}</div>
          {/* Phones: the facts fold under the name. */}
          <div className="truncate text-xs text-fg-subtle sm:hidden">
            {pluralize(list.recipient_count, "person", "people")} · Updated {formatRelative(list.updated_at)}
          </div>
        </div>
      </div>
      <span className="hidden text-right text-sm tabular sm:block">{formatCount(list.recipient_count)}</span>
      <span className="hidden text-13 text-fg-muted sm:block">{formatRelative(list.updated_at)}</span>
      <div className="flex justify-end">
        <PayAgainButton list={list} />
      </div>
    </motion.li>
  );
}
