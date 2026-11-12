import Link from "next/link";

import { NewPaymentButton } from "@/components/pay/new-payment-button";
import { Button } from "@/components/ui/button";
import { SearchIcon } from "@/components/ui/icons";
import { EmptyState, IllustratedEmpty } from "@/components/ui/states";

export function NoMatches({ onClear }: { onClear: () => void }) {
  return (
    <EmptyState
      icon={<SearchIcon />}
      title="Nothing matches these filters"
      description="Try a different name, status or date range."
      action={
        <Button variant="outline" size="sm" onClick={onClear}>
          Clear filters
        </Button>
      }
    />
  );
}

export function NoPaymentsYet() {
  return (
    <IllustratedEmpty
      title="Send your first payment"
      description="Pay your whole team in USDC on Base. Every payment lands here with its on-chain receipt."
      actions={
        <>
          <NewPaymentButton className="h-10 px-4 text-sm" />
          <Link href="/#how" className="text-sm font-medium text-fg-muted hover:text-fg">
            How it works
          </Link>
        </>
      }
    />
  );
}
