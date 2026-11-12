"use client";

import Link from "next/link";
import { useState } from "react";

import { ListsTable, ListsTableSkeleton } from "@/components/lists/lists-table";
import { useCreateListNow } from "@/components/lists/use-create-list";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlusIcon, SearchIcon } from "@/components/ui/icons";
import { PageHeader } from "@/components/ui/page-header";
import { SearchField } from "@/components/ui/search-field";
import { EmptyState, ErrorState, IllustratedEmpty } from "@/components/ui/states";
import { useDebounced } from "@/hooks/use-debounced";
import { useLists } from "@/lib/api/queries";

export default function ListsPage() {
  const [query, setQuery] = useState("");
  const { createNow, isCreating } = useCreateListNow();
  const search = useDebounced(query.trim());
  const lists = useLists(search || undefined);
  const searching = lists.isFetching && !lists.isLoading;
  // Search appears once there's something to search, and stays while a search is typed or showing.
  const showSearch = !lists.isError && !!(lists.data?.length || search || query);

  return (
    <>
      <PageHeader
        title="Lists"
        description="Saved groups of people you pay often. Start a payment from a list and every amount is filled in for you."
        actions={
          <Button onClick={createNow} loading={isCreating} className="h-10 px-4 text-sm">
            <PlusIcon className="size-4" /> New list
          </Button>
        }
      />

      {showSearch && (
        <SearchField
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onClear={() => setQuery("")}
          loading={searching}
          placeholder="Search lists"
          aria-label="Search lists"
          className="mb-6 max-w-sm"
        />
      )}

      {lists.isLoading ? (
        <ListsTableSkeleton />
      ) : lists.isError ? (
        <Card>
          <ErrorState error={lists.error} onRetry={() => lists.refetch()} retrying={lists.isFetching} />
        </Card>
      ) : lists.data?.length ? (
        <ListsTable lists={lists.data} animate={!search} />
      ) : search ? (
        <EmptyState
          icon={<SearchIcon />}
          title={`No lists match “${search}”`}
          description="Try a different name, or clear the search to see every list."
          action={
            <Button variant="outline" size="sm" onClick={() => setQuery("")}>
              Clear search
            </Button>
          }
        />
      ) : (
        <Card>
          <IllustratedEmpty
            title="Save your first list"
            description="Save your team or contributors once, then pay them all in a couple of clicks every time."
            actions={
              <>
                <Button onClick={createNow} loading={isCreating} className="h-10 px-4 text-sm">
                  <PlusIcon className="size-4" /> Create your first list
                </Button>
                <Link href="/pay/new" className="text-sm font-medium text-fg-muted hover:text-fg">
                  Pay without a list
                </Link>
              </>
            }
          />
        </Card>
      )}
    </>
  );
}
