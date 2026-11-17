"use client";

import Link from "next/link";

import { ArrowRightIcon } from "@/components/ui/icons";
import { useSentHistory } from "@/lib/api/queries";
import { cn } from "@/lib/utils/cn";
import { pluralize } from "@/lib/utils/format";

/** Shown while any payment is partially paid. One payment links to it; several link to the filtered history. */
export function AttentionBanner({ className }: { className?: string }) {
  const attention = useSentHistory({ status: "partially_paid", limit: 1 });
  const count = attention.data?.pagination.total_items ?? 0;
  const first = attention.data?.items[0];
  if (!count || !first) return null;

  const single = count === 1;
  const subject = single ? `“${first.name}” needs` : pluralize(count, "payment needs", "payments need");
  return (
    <Link
      href={single ? `/pay/${first.id}` : "/history?status=partially_paid"}
      className={cn(
        "flex items-center gap-3 rounded-2xl bg-warning-soft px-5 py-3.5 text-sm text-warning-fg transition-opacity duration-150 hover:opacity-90",
        className,
      )}
    >
      <span className="flex-1">{subject} attention: some people weren&apos;t paid.</span>
      <ArrowRightIcon className="size-4" />
    </Link>
  );
}
