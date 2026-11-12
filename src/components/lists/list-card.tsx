"use client";

import Link from "next/link";

import { Card } from "@/components/ui/card";
import type { ListSummary } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";
import { formatCount, formatRelative } from "@/lib/utils/format";
import { DISPLAY_FIGURE } from "@/lib/type";

import { ListAvatar } from "./list-avatar";
import { PayAgainButton } from "./pay-again-button";

/**
 * A saved list as a card, on the dashboard: name, when it changed, how many people, and Pay
 * again (what you mostly do with a list). The whole card opens it.
 */
export function ListCard({ list }: { list: ListSummary }) {
  return (
    <Card className="group relative flex h-full flex-col p-5 transition-shadow duration-150 hover:shadow-md">
      <Link
        href={`/lists/${list.id}`}
        className="absolute inset-0 rounded-2xl outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary"
        aria-label={`Open ${list.name}`}
      />
      <div className="flex items-center gap-3">
        <ListAvatar listId={list.id} />
        <span className="min-w-0">
          <span className="block truncate text-15 font-medium">{list.name}</span>
          <span className="block text-13 text-fg-subtle">Updated {formatRelative(list.updated_at)}</span>
        </span>
      </div>
      <div className="mt-6 flex items-end justify-between gap-3">
        <div>
          <div className="text-13 text-fg-muted">People</div>
          <div className={cn(DISPLAY_FIGURE, "mt-1 text-22")}>{formatCount(list.recipient_count)}</div>
        </div>
        <PayAgainButton list={list} />
      </div>
    </Card>
  );
}
