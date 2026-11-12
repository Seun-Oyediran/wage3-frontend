"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { useConnection } from "wagmi";

import { Section } from "@/components/ui/section";
import { ErrorState } from "@/components/ui/states";
import { useRovingFocus } from "@/hooks/use-roving-focus";
import { useUsdcBalance } from "@/hooks/use-usdc-balance";
import { useStats } from "@/lib/api/queries";
import type { Stats } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";
import { USDC } from "@/lib/config";
import {
  formatAmount,
  formatCount,
  formatDate,
  formatFigure,
  formatRelative,
  formatToken,
  shortAddress,
} from "@/lib/utils/format";
import { SLIDE } from "@/lib/motion";
import { PERIODS, periodStart } from "@/lib/utils/periods";

import { Stat, StatUnit } from "./stat";

type Range = { id: string; label: string; name: string; days: number | null };

/** The shared periods as "7D" pills, plus All time. */
const RANGES: Range[] = [
  ...PERIODS.map((p) => ({ id: `${p.days}d`, label: p.short, name: p.name, days: p.days })),
  { id: "all", label: "All", name: "All time", days: null },
];

/** Totals for the chosen period, plus the connected wallet's balance. */
export function Overview() {
  const [range, setRange] = useState(RANGES[1]);
  const stats = useStats(range.days ? { from: periodStart(range.days) } : undefined);
  const data = stats.data;
  // Switching range keeps the old figures on screen (dimmed) until the new ones arrive.
  const switching = stats.isPlaceholderData && stats.isFetching;

  return (
    <Section
      title="Overview"
      action={<RangeControl value={range} onChange={setRange} />}
    >
      {stats.isError && !data ? (
        <ErrorState
          compact
          error={stats.error}
          onRetry={() => stats.refetch()}
          retrying={stats.isFetching}
        />
      ) : (
        <div
          className={cn(
            "grid grid-cols-2 gap-x-4 gap-y-6 py-2 transition-opacity duration-200 lg:flex lg:gap-0",
            switching && "opacity-60",
          )}
          aria-busy={switching || !data}
        >
          <TotalSentStat stats={data} />
          <Stat
            label="Payments sent"
            info="Payments you sent in this period, counted once each however many batches they took."
            loading={!data}
          >
            {data && formatCount(data.payouts_sent)}
          </Stat>
          <Stat
            label="Wallets paid"
            info="Different wallets that received USDC from you in this period."
            loading={!data}
          >
            {data && formatCount(data.wallets_paid)}
          </Stat>
          <Stat
            label="Last payment"
            info="When your most recent payment was sent."
            loading={!data}
            empty={!data?.last_sent_at}
            sub={
              data &&
              (data.last_sent_at
                ? formatDate(data.last_sent_at)
                : "Nothing sent yet")
            }
          >
            {formatRelative(data?.last_sent_at)}
          </Stat>
          <BalanceStat />
        </div>
      )}
    </Section>
  );
}

function RangeControl({
  value,
  onChange,
}: {
  value: Range;
  onChange: (r: Range) => void;
}) {
  const roving = useRovingFocus({
    count: RANGES.length,
    selected: RANGES.findIndex((r) => r.id === value.id),
    onSelect: (i) => onChange(RANGES[i]),
  });
  return (
    // 1px border + 1px padding around 32px pills: 36px, the tallest a Section action can be.
    <div
      role="radiogroup"
      aria-label="Time range"
      onKeyDown={roving.onKeyDown}
      className="inline-flex h-9 items-center rounded-full border border-(--color-50) bg-(--color-400) p-px text-13 font-medium"
    >
      {RANGES.map((r, i) => {
        const selected = value.id === r.id;
        return (
          <button
            key={r.id}
            {...roving.itemProps(i)}
            type="button"
            role="radio"
            aria-checked={selected}
            // "7D" reads badly aloud; the full name doesn't.
            aria-label={r.name}
            onClick={() => onChange(r)}
            className={cn(
              "relative flex h-8 items-center rounded-full px-3 transition-colors duration-150",
              selected ? "text-fg" : "text-fg-muted hover:text-fg",
            )}
          >
            {selected && (
              <motion.span
                layoutId="stats-range"
                className="absolute inset-0 rounded-full bg-surface shadow-(--shadow-xs)"
                transition={SLIDE}
              />
            )}
            <span className="relative tabular">{r.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/** USDC as the headline figure; anything sent in other tokens goes on the line under it. */
function TotalSentStat({ stats }: { stats?: Stats }) {
  const totals = stats?.total_sent ?? [];
  const primary =
    totals.find(
      (t) => t.token_address.toLowerCase() === USDC.address.toLowerCase(),
    ) ?? totals[0];
  const others = totals.filter((t) => t !== primary);
  const amount = primary?.amount ?? "0";
  const decimals = primary?.token_decimals ?? USDC.decimals;

  return (
    <Stat
      label="Total sent"
      info="USDC you sent in this period that has confirmed on Base."
      loading={!stats}
      sub={
        others.length > 0
          ? `+ ${others.map((t) => formatToken(t.amount, t.token_symbol, t.token_decimals)).join(", ")}`
          : undefined
      }
    >
      {/* Large figures are shortened ("12.4M"); the exact amount is in the title. */}
      <span title={formatAmount(amount, decimals, { maxFraction: 2 })}>
        {formatFigure(amount, decimals)}
      </span>
      <StatUnit>{primary?.token_symbol ?? USDC.symbol}</StatUnit>
    </Stat>
  );
}

function BalanceStat() {
  const { isConnected, address } = useConnection();
  const balance = useUsdcBalance();

  return (
    <Stat
      label="Wallet balance"
      info="USDC in your connected wallet on Base. Wage3 never holds your funds."
      loading={isConnected && balance.isLoading}
      empty={!isConnected}
      sub={isConnected ? shortAddress(address) : "Connect a wallet to see it"}
    >
      {balance.isError ? (
        <span className="text-15 text-danger-fg">
          Couldn&apos;t read it
        </span>
      ) : (
        <>
          {formatAmount(balance.data ?? BigInt(0), USDC.decimals, {
            maxFraction: 2,
          })}
          <StatUnit>{USDC.symbol}</StatUnit>
        </>
      )}
    </Stat>
  );
}
