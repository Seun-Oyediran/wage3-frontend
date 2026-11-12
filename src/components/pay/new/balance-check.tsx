"use client";

import { useState } from "react";
import { useConnection } from "wagmi";

import { ConnectDialog } from "@/components/wallet/connect-dialog";
import { useUsdcBalance } from "@/hooks/use-usdc-balance";
import { cn } from "@/lib/utils/cn";
import { USDC } from "@/lib/config";
import { formatAmount, formatFigure } from "@/lib/utils/format";

/**
 * The total against the wallet's balance. Never blocks: an over-budget payment can still be
 * saved as a draft, and a wallet is only needed to send.
 */
export function BalanceCheck({ total }: { total: bigint }) {
  const { isConnected } = useConnection();
  const balance = useUsdcBalance();
  const [connectOpen, setConnectOpen] = useState(false);

  if (!isConnected) {
    return (
      <>
        <button
          type="button"
          onClick={() => setConnectOpen(true)}
          className="mt-4 text-13 text-fg-muted underline-offset-4 hover:text-fg hover:underline"
        >
          Connect wallet to check balance
        </button>
        <ConnectDialog open={connectOpen} onOpenChange={setConnectOpen} />
      </>
    );
  }
  if (balance.data === undefined) return null;

  const short = total - balance.data;
  const isShort = short > BigInt(0);
  return (
    <div
      className={cn(
        "mt-4 flex items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-13",
        isShort ? "bg-danger-soft text-danger-fg" : "bg-surface-muted text-fg-muted",
      )}
    >
      <span className="shrink-0">Your balance</span>
      {/* Shortened figures keep it to one line; the exact amounts are in the title. */}
      <span
        className="min-w-0 truncate font-medium tabular"
        title={`${formatAmount(balance.data, USDC.decimals, { maxFraction: 2 })} ${USDC.symbol}${isShort ? ` · short ${formatAmount(short)}` : ""}`}
      >
        {formatFigure(balance.data)} {USDC.symbol}
        {isShort && <span className="font-normal"> · short {formatFigure(short)}</span>}
      </span>
    </div>
  );
}
