"use client";

import { useState } from "react";

import { EmptyIllustration } from "@/components/illustrations";
import { ListsTable, ListsTableEmpty, ListsTableSkeleton } from "@/components/lists/lists-table";
import { useCreateListNow } from "@/components/lists/use-create-list";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlusIcon } from "@/components/ui/icons";
import { PageHeader } from "@/components/ui/page-header";
import { SearchField } from "@/components/ui/search-field";
import { ErrorState, IllustratedEmpty } from "@/components/ui/states";
import { useDebounced } from "@/hooks/use-debounced";
import { useLists } from "@/lib/api/queries";

export default function ListsPage() {
  const [query, setQuery] = useState("");
  const { createNow, isCreating } = useCreateListNow();
  const search = useDebounced(query.trim());
  const lists = useLists(search || undefined);
  const searching = lists.isFetching && !lists.isLoading;
  // The search row is there while loading too, so the table doesn't drop when lists arrive. It's
  // left out only when there's nothing to search: no lists and nothing typed.
  const showSearch = !lists.isError && (lists.isLoading || !!(lists.data?.length || search || query));

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

      {/* Right-aligned above the table, like History's toolbar. */}
      {showSearch && (
        <div className="mb-4 flex justify-end">
          <SearchField
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onClear={() => setQuery("")}
            loading={searching}
            placeholder="Search lists"
            aria-label="Search lists"
            className="w-full md:w-64"
          />
        </div>
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
        <ListsTableEmpty>
          <IllustratedEmpty
            align="center"
            illustration={<EmptyIllustration id="no-matches" className="size-32" />}
            title={`No lists match “${search}”`}
            description="Try a different name."
            actions={
              <Button variant="outline" size="sm" className="h-8 px-3 text-13" onClick={() => setQuery("")}>
                Clear search
              </Button>
            }
          />
        </ListsTableEmpty>
      ) : (
        <ListsTableEmpty>
          <IllustratedEmpty
            align="center"
            illustration={<EmptyIllustration id="lists" className="size-32" />}
            title="No lists yet"
            description="Save a group once, then pay them all in a couple of clicks."
            actions={
              <Button onClick={createNow} loading={isCreating} className="h-8 px-3 text-13">
                <PlusIcon className="size-4" /> New list
              </Button>
            }
          />
        </ListsTableEmpty>
      )}
    </>
  );
}
