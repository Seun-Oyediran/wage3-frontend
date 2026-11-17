"use client";

import { motion } from "motion/react";
import Link from "next/link";

import { ListCard } from "@/components/lists/list-card";
import { PlusIcon } from "@/components/ui/icons";
import { Section } from "@/components/ui/section";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/states";
import { useLists } from "@/lib/api/queries";
import { cn } from "@/lib/utils/cn";
import { riseIn } from "@/lib/motion";
import { DOTTED_UNDERLINE } from "@/lib/type";

/** Two lists plus a New list card fill one row of three; the rest are behind "All lists". */
const MAX_LIST_CARDS = 2;

const GRID = "grid gap-4 sm:grid-cols-2 xl:grid-cols-3";

export function ListsPreview() {
  const lists = useLists();
  const all = lists.data ?? [];

  return (
    <Section
      title="Your lists"
      action={
        all.length > 0 && (
          <Link href="/lists" className={cn(DOTTED_UNDERLINE, "text-13 font-medium text-fg-muted hover:text-fg hover:decoration-fg")}>
            All lists
          </Link>
        )
      }
    >
      {lists.isLoading ? (
        <div className={GRID}>
          {Array.from({ length: MAX_LIST_CARDS + 1 }, (_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      ) : lists.isError ? (
        <ErrorState compact error={lists.error} onRetry={() => lists.refetch()} retrying={lists.isFetching} />
      ) : (
        <div className={GRID}>
          {all.slice(0, MAX_LIST_CARDS).map((l, i) => (
            <motion.div key={l.id} {...riseIn(i * 0.03)}>
              <ListCard list={l} />
            </motion.div>
          ))}
          <NewListCard first={all.length === 0} />
        </div>
      )}
    </Section>
  );
}

function NewListCard({ first }: { first: boolean }) {
  return (
    <Link
      href="/lists"
      className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border p-5 text-center text-fg-muted transition-colors duration-150 hover:border-border-strong hover:bg-surface-hover hover:text-fg"
    >
      <PlusIcon className="size-5" />
      <span className="text-sm font-medium">{first ? "Create your first list" : "New list"}</span>
      {first && (
        <span className="max-w-60 text-13 text-fg-subtle text-pretty">
          Save the people you pay often and pay them again in two clicks.
        </span>
      )}
    </Link>
  );
}
