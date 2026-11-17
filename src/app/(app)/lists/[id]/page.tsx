"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { ListEditor } from "@/components/lists/list-editor";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeftIcon, PeopleIcon } from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { useList } from "@/lib/api/queries";

export default function ListDetailPage() {
  const { id } = useParams<{ id: string }>();
  const list = useList(id);

  if (list.isPending) return <DetailSkeleton />;
  if (list.isError) {
    return (
      <Card>
        {list.error.isNotFound ? (
          <EmptyState
            icon={<PeopleIcon />}
            title="List not found"
            description="It may have been deleted, or the link is wrong."
            action={
              <Button asChild variant="outline">
                <Link href="/lists">
                  <ChevronLeftIcon className="size-4" /> Back to lists
                </Link>
              </Button>
            }
          />
        ) : (
          <ErrorState error={list.error} onRetry={() => list.refetch()} retrying={list.isFetching} />
        )}
      </Card>
    );
  }
  return <ListEditor list={list.data} />;
}

function DetailSkeleton() {
  return (
    <div aria-busy>
      <Skeleton className="h-9 w-64" />
      <Skeleton className="mt-3 h-5 w-72" />
      <div className="mt-10 flex justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-8 w-40 rounded-full" />
      </div>
      <Skeleton className="mt-4 h-72 rounded-2xl" />
    </div>
  );
}
