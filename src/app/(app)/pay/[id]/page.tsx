"use client";

import { FileQuestion } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { PayoutView } from "@/components/pay/payout-view";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { usePayout } from "@/lib/api/queries";

export default function PayoutPage() {
  const { id } = useParams<{ id: string }>();
  const query = usePayout(id);

  if (query.isPending) return <PayoutSkeleton />;
  if (query.isError) {
    return (
      <Card>
        {query.error.isNotFound ? (
          <EmptyState
            icon={<FileQuestion />}
            title="Payment not found"
            description="It may have been made from another account, or the link is wrong."
            action={
              <Button asChild variant="outline">
                <Link href="/history">Go to history</Link>
              </Button>
            }
          />
        ) : (
          <ErrorState error={query.error} onRetry={() => query.refetch()} retrying={query.isFetching} />
        )}
      </Card>
    );
  }
  return <PayoutView payout={query.data} />;
}

/**
 * The header at its real size (34px title, the status line, 40px under it), so the title and status
 * land where the skeleton was. What's below depends on the payment's state, unknown until it loads,
 * so a single neutral block stands in.
 */
function PayoutSkeleton() {
  return (
    <div aria-busy>
      <div className="pb-10">
        <div className="flex h-8.5 items-center">
          <Skeleton className="h-6 w-72 max-w-full" />
        </div>
        <div className="mt-3 flex h-6 items-center gap-2">
          <Skeleton className="h-6 w-14 rounded-full" />
          <Skeleton className="h-3.5 w-44" />
        </div>
      </div>
      <Skeleton className="h-34 rounded-2xl" />
    </div>
  );
}
