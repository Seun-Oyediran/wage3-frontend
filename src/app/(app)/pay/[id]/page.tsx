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

function PayoutSkeleton() {
  return (
    <div aria-busy>
      <Skeleton className="h-9 w-72" />
      <Skeleton className="mt-3 h-6 w-64" />
      <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Skeleton className="h-96 rounded-2xl" />
        <Skeleton className="h-[28rem] rounded-2xl" />
      </div>
    </div>
  );
}
