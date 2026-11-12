import { EmptyIllustration } from "@/components/illustrations";
import { NewPaymentButton } from "@/components/pay/new-payment-button";
import { Button } from "@/components/ui/button";
import { IllustratedEmpty } from "@/components/ui/states";

export function NoMatches({ onClear }: { onClear: () => void }) {
  return (
    <IllustratedEmpty
      align="center"
      illustration={<EmptyIllustration id="no-matches" className="size-32" />}
      title="Nothing matches these filters"
      description="Try a different name, status or date range."
      actions={
        <Button variant="outline" size="sm" className="h-8 px-3 text-13" onClick={onClear}>
          Clear filters
        </Button>
      }
    />
  );
}

export function NoPaymentsYet() {
  return (
    <IllustratedEmpty
      align="center"
      illustration={<EmptyIllustration id="rows" className="size-32" />}
      title="No payment history yet"
      description="Send your first payment and it'll show up here."
      actions={<NewPaymentButton className="h-8 px-3 text-13" />}
    />
  );
}
