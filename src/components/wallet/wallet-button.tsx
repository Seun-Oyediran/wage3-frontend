"use client";

import { LogOut } from "lucide-react";
import { useState } from "react";
import { useConnection, useDisconnect, useSwitchChain } from "wagmi";

import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/address";
import {
  DropdownContent,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
  DropdownSeparator,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import { WarningIcon } from "@/components/ui/icons";
import { NetworkBadge } from "@/components/ui/network-badge";
import { useHydrated } from "@/lib/auth/use-session";
import { cn } from "@/lib/utils/cn";
import { chain, USDC } from "@/lib/config";
import { useUsdcBalance } from "@/hooks/use-usdc-balance";
import { useWalletRestoring } from "@/lib/wagmi";
import { formatAmount, shortAddress } from "@/lib/utils/format";

import { ConnectDialog } from "./connect-dialog";

export function WalletButton({
  size = "sm",
  className,
  filled,
}: {
  size?: "sm" | "md";
  className?: string;
  filled?: boolean;
}) {
  const hydrated = useHydrated();
  const restoring = useWalletRestoring();
  const { address, isConnected, chainId, isReconnecting } = useConnection();
  const { switchChain, isPending: switching } = useSwitchChain();
  const [open, setOpen] = useState(false);

  // Until we know whether a wallet is coming back, a placeholder rather than a flash of "Connect wallet".
  if (!hydrated || restoring || isReconnecting) {
    return <div className={cn("h-8 w-32 rounded-full bg-surface-muted", className)} aria-hidden />;
  }

  if (!isConnected || !address) {
    return (
      <>
        <Button variant={filled ? "filled" : "outline"} size={size} className={className} onClick={() => setOpen(true)}>
          Connect wallet
        </Button>
        <ConnectDialog open={open} onOpenChange={setOpen} />
      </>
    );
  }

  if (chainId !== chain.id) {
    return (
      <Button
        variant="secondary"
        size={size}
        className={cn("bg-warning-soft text-warning-fg hover:bg-warning hover:text-(--gray-100)", className)}
        loading={switching}
        onClick={() => switchChain({ chainId: chain.id })}
      >
        <WarningIcon className="size-4" /> Switch to {chain.name}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownTrigger asChild>
        <Button variant={filled ? "filled" : "outline"} size={size} className={cn("gap-2 pl-1.5", className)}>
          <WalletAvatar address={address} className="size-6" />
          <span className="text-13 tabular">{shortAddress(address)}</span>
        </Button>
      </DropdownTrigger>
      <WalletMenu address={address} />
    </DropdownMenu>
  );
}

/** After Aave's wallet menu: the wallet as a row you're "in", account facts as label/value rows, then Disconnect. */
function WalletMenu({ address }: { address: string }) {
  const { disconnect } = useDisconnect();
  const balance = useUsdcBalance();
  return (
    <DropdownContent className="w-64">
      <DropdownLabel>Your wallet</DropdownLabel>
      <div className="flex h-7.5 items-center gap-2 px-2">
        <WalletAvatar address={address} className="size-5" />
        <span className="flex-1 text-13 tabular">{shortAddress(address)}</span>
        <CopyButton value={address} label="Copy address" copiedMessage="Address copied" className="-mr-1" />
      </div>
      <DropdownSeparator />
      <dl className="flex flex-col text-13">
        <div className="flex h-7.5 items-center justify-between gap-3 px-2">
          <dt className="text-fg-muted">Balance</dt>
          <dd className="tabular">
            {balance.isLoading ? "…" : balance.data !== undefined ? formatAmount(balance.data) : "—"}{" "}
            <span className="text-fg-muted">{USDC.symbol}</span>
          </dd>
        </div>
        <div className="flex h-7.5 items-center justify-between gap-3 px-2">
          <dt className="text-fg-muted">Network</dt>
          <dd>
            <NetworkBadge />
          </dd>
        </div>
      </dl>
      <DropdownSeparator />
      <DropdownItem icon={<LogOut />} onSelect={() => disconnect()}>
        Disconnect
      </DropdownItem>
    </DropdownContent>
  );
}

/** Round gradient avatar, the same for the same address: two oklch hues taken from it. */
export function WalletAvatar({ address, className }: { address: string; className?: string }) {
  const hue = parseInt(address.slice(2, 6), 16) % 360;
  const hue2 = (hue + 40 + (parseInt(address.slice(6, 8), 16) % 60)) % 360;
  return (
    <span
      aria-hidden
      className={cn("shrink-0 rounded-full shadow-[inset_0_0_0_0.5px_oklch(0_0_0/0.1)]", className)}
      style={{ background: `linear-gradient(160deg, oklch(0.82 0.15 ${hue}), oklch(0.62 0.2 ${hue2}))` }}
    />
  );
}
