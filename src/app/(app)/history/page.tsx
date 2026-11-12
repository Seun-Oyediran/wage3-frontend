"use client";

import { Suspense } from "react";

import { FiltersMenu } from "@/components/history/filters-menu";
import { NoMatches, NoPaymentsYet } from "@/components/history/history-empty";
import { HistoryTable, HistoryTableSkeleton } from "@/components/history/history-table";
import { StatusTabs } from "@/components/history/status-tabs";
import { useHistory } from "@/components/history/use-history";
import { NewPaymentButton } from "@/components/pay/new-payment-button";
import { Card } from "@/components/ui/card";
import { LoadingBar } from "@/components/ui/loading-bar";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { SearchField } from "@/components/ui/search-field";
import { ErrorState } from "@/components/ui/states";
import { useLists } from "@/lib/api/queries";
import { cn } from "@/lib/utils/cn";

export default function HistoryPage() {
  return (
    <>
      <PageHeader
        title="History"
        description="Every payment you've sent from Wage3, confirmed on Base."
        actions={<NewPaymentButton className="h-10 px-4 text-sm" />}
      />
      {/* useSearchParams needs a Suspense boundary. */}
      <Suspense fallback={<HistoryTableSkeleton />}>
        <HistoryContent />
      </Suspense>
    </>
  );
}

function HistoryContent() {
  const h = useHistory();
  const { history, filters } = h;
  const lists = useLists();

  const items = history.data?.items ?? [];
  const pagination = history.data?.pagination;
  // A filter change keeps the old rows (dimmed, with a bar) until the new ones arrive.
  const refreshing = history.isFetching && history.isPlaceholderData;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <StatusTabs value={filters.status} onChange={h.setStatus} />
        {/* pb-3 matches the tabs' underline padding, so both line up on one row. */}
        <div className="flex items-center gap-2 md:pb-3">
          <SearchField
            type="search"
            value={h.searchInput}
            onChange={(e) => h.setSearchInput(e.target.value)}
            placeholder="Search payments"
            aria-label="Search payments by name"
            className="min-w-0 flex-1 md:w-64 md:flex-none"
          />
          <FiltersMenu
            lists={lists.data ?? []}
            listId={filters.listId}
            from={filters.from}
            to={filters.to}
            onList={h.setList}
            onTime={h.setTime}
            onReset={h.resetMenuFilters}
          />
        </div>
      </div>

      {filters.dateError && (
        <p role="alert" className="text-13 text-danger-fg">
          {filters.dateError}
        </p>
      )}

      {history.isLoading ? (
        <HistoryTableSkeleton />
      ) : history.isError && !history.data ? (
        <Card>
          <ErrorState error={history.error} onRetry={() => history.refetch()} retrying={history.isFetching} />
        </Card>
      ) : items.length === 0 ? (
        <Card>{filters.hasFilters ? <NoMatches onClear={h.clearAll} /> : <NoPaymentsYet />}</Card>
      ) : (
        <>
          {/* A failed refetch: the last good rows stay, with the error above them. */}
          {history.isError && (
            <ErrorState compact error={history.error} onRetry={() => history.refetch()} retrying={history.isFetching} />
          )}
          <Card className="relative overflow-hidden" aria-busy={refreshing}>
            <LoadingBar active={refreshing} />
            <div className={cn("transition-opacity duration-200", refreshing && "opacity-60")}>
              <HistoryTable items={items} />
            </div>
          </Card>
          {pagination && (
            <Pagination
              noun="payment"
              page={pagination.current_page}
              totalPages={pagination.total_pages}
              totalItems={pagination.total_items}
              hasPrev={pagination.has_previous_page}
              hasNext={pagination.has_next_page}
              disabled={history.isFetching}
              onPage={h.goToPage}
            />
          )}
        </>
      )}
    </div>
  );
}
