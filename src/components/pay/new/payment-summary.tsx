import { PermissionsRow, SummaryList, SummaryRow, SummaryTotal } from "@/components/pay/summary";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRightIcon } from "@/components/ui/icons";
import { NetworkBadge } from "@/components/ui/network-badge";
import { ReasonTooltip } from "@/components/ui/tooltip";
import { USDC } from "@/lib/config";
import { formatCount, formatAmount, formatFigure } from "@/lib/utils/format";
import { batchCount } from "@/lib/send-payout";

import { BalanceCheck } from "./balance-check";

/** The right-hand card: what will be paid, the balance against it, and Review. */
export function PaymentSummary({
  total,
  heldTotal,
  people,
  canReview,
  reviewing,
  error,
  onReview,
}: {
  total: bigint;
  /** The blocked rows' amount, left out of `total`. Undefined when nothing is blocked. */
  heldTotal?: bigint;
  people: number;
  canReview: boolean;
  reviewing: boolean;
  error?: string;
  onReview: () => void;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="p-5">
        <SummaryTotal label="Total" amount={total} />
        {/* "Not included" rather than a sum: the red banner by the table says which rows and why. */}
        {heldTotal !== undefined && (
          <div className="mt-2 text-13 text-fg-muted tabular" title={`${formatAmount(heldTotal)} ${USDC.symbol}`}>
            {formatFigure(heldTotal)} {USDC.symbol} not included
          </div>
        )}
        <SummaryList>
          <SummaryRow label="People">{formatCount(people)}</SummaryRow>
          <PermissionsRow prompts={people ? batchCount(people) + 1 : null} />
          <SummaryRow label="Network">
            <NetworkBadge />
          </SummaryRow>
        </SummaryList>
        <BalanceCheck total={total} />
      </div>

      <div className="flex flex-col gap-4 bg-surface-sunken p-5">
        {error && (
          <p role="alert" className="rounded-xl bg-danger-soft px-3.5 py-2.5 text-13 text-danger-fg">
            {error}
          </p>
        )}
        <ReasonTooltip reason={canReview ? null : "Add at least one person first"} block>
          <Button size="lg" className="w-full" onClick={onReview} loading={reviewing} disabled={!canReview}>
            Review payment <ArrowRightIcon className="size-4" />
          </Button>
        </ReasonTooltip>
      </div>
    </Card>
  );
}
