import { NewPaymentButton } from "@/components/pay/new-payment-button";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

/** The dashboard's main action, in its own panel under the greeting. */
export function StartPayment({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-2xl bg-(--color-25) p-5 shadow-(--shadow-xs) sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        <CardTitle>Start a payment</CardTitle>
        <CardDescription>Paste wallets, import a CSV or start from a saved list.</CardDescription>
      </div>
      <NewPaymentButton className="h-10 shrink-0 self-start px-4 text-sm sm:self-auto" />
    </div>
  );
}
