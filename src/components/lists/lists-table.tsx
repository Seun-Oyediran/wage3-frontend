"use client";

import { motion } from "motion/react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";
import { GhostBar, GhostTable } from "@/components/ui/ghost-table";
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
      <TableHeader />
      <ul className="divide-y divide-border">
        {lists.map((list, i) => (
          <ListRow key={list.id} list={list} index={i} animate={animate} />
        ))}
      </ul>
    </Card>
  );
}

/** The header's fill is its only separation from the rows, as in History. */
function TableHeader() {
  return (
    <div className={cn(COLS, "hidden bg-surface-sunken px-5 py-3 text-12 font-medium text-fg-subtle sm:grid")}>
      <span>List</span>
      <span className="text-right">People</span>
      <span>Updated</span>
      <span className="sr-only">Actions</span>
    </div>
  );
}

/** The table's real footprint: the header and rows at their real height (36px avatar, 12px above and below). */
export function ListsTableSkeleton() {
  return (
    <Card className="overflow-hidden" aria-busy>
      <TableHeader />
      <div className="divide-y divide-border">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className={cn(COLS, "px-5 py-3")}>
            <div className="flex items-center gap-3">
              <Skeleton className="size-9 shrink-0 rounded-full" />
              <Skeleton className="h-3.5 w-36" />
            </div>
            <Skeleton className="hidden h-3.5 w-8 justify-self-end sm:block" />
            <Skeleton className="hidden h-3.5 w-20 sm:block" />
            <Skeleton className="h-8 w-24 justify-self-end rounded-full" />
          </div>
        ))}
      </div>
    </Card>
  );
}

/** No lists (or none matching): ghost rows in the table's columns behind the message. */
export function ListsTableEmpty({ children }: { children: ReactNode }) {
  return (
    <GhostTable
      header={<TableHeader />}
      row={([name, , updated], i) => (
        <div key={i} className={cn(COLS, "h-15 px-5")}>
          <div className="flex items-center gap-3">
            <span className="size-9 shrink-0 rounded-full bg-surface-muted" />
            <GhostBar width={name * 0.6} />
          </div>
          <GhostBar width={30} className="hidden justify-self-end sm:block" />
          <GhostBar width={updated * 0.6} className="hidden sm:block" />
          <span className="h-8 w-24 justify-self-end rounded-full bg-surface-muted" />
        </div>
      )}
    >
      {children}
    </GhostTable>
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
          <div className="truncate text-13 font-medium">{list.name}</div>
          {/* Phones: the facts fold under the name. */}
          <div className="truncate text-12 text-fg-subtle sm:hidden">
            {pluralize(list.recipient_count, "person", "people")} · Updated {formatRelative(list.updated_at)}
          </div>
        </div>
      </div>
      <span className="hidden text-right text-13 text-fg-muted tabular sm:block">{formatCount(list.recipient_count)}</span>
      <span className="hidden text-13 text-fg-muted sm:block">{formatRelative(list.updated_at)}</span>
      <div className="flex justify-end">
        <PayAgainButton list={list} />
      </div>
    </motion.li>
  );
}
