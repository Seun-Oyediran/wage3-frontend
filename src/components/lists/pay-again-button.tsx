import Link from "next/link";

import { Button } from "@/components/ui/button";
import { RepeatIcon } from "@/components/ui/icons";
import type { ListSummary } from "@/lib/api/types";

/**
 * Starts a payment from a list. An empty list can't be paid, so it says so instead of showing
 * a dead button. Positioned, so it sits above a card's or row's full-size link.
 */
export function PayAgainButton({ list }: { list: Pick<ListSummary, "id" | "recipient_count"> }) {
  if (list.recipient_count === 0) return <span className="text-13 text-fg-subtle">No one yet</span>;
  return (
    <Button asChild size="sm" variant="secondary" className="relative">
      <Link href={`/pay/new?list=${list.id}`}>
        <RepeatIcon className="size-3.5" /> Pay again
      </Link>
    </Button>
  );
}
