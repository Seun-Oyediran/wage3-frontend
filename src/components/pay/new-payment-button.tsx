"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useConfig, useConnection } from "wagmi";
import { getConnection } from "wagmi/actions";

import { WalletWalkthrough } from "@/components/onboarding/wallet-walkthrough";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@/components/ui/icons";
import { ConnectDialog } from "@/components/wallet/connect-dialog";
import { useLocalValue } from "@/lib/local-prefs";

/**
 * The "New payment" button, wherever a payment can start (dashboard, History). The first time, it opens a short walkthrough (get a wallet,
 * fund it, how paying works). Then, with no wallet connected, it opens the wallet picker and
 * carries on to /pay/new once the wallet connects. Closing the picker without connecting drops
 * the intent, so a later connect doesn't jump pages unexpectedly.
 */
export function NewPaymentButton({ className }: { className?: string }) {
  const { isConnected } = useConnection();
  const config = useConfig();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [onboarded, setOnboarded] = useLocalValue("wage3.onboarded");
  const heading = useRef(false);

  useEffect(() => {
    if (heading.current && isConnected) {
      heading.current = false;
      router.push("/pay/new");
    }
  }, [isConnected, router]);

  // After the walkthrough (finished or skipped): remember it, then carry on as a normal click.
  const proceed = () => {
    setOnboarded("1");
    setGuideOpen(false);
    if (getConnection(config).isConnected) return router.push("/pay/new");
    heading.current = true;
    setOpen(true);
  };

  if (isConnected && onboarded) {
    return (
      <Button asChild size="sm" className={className}>
        <Link href="/pay/new">
          <PlusIcon className="size-4" /> New payment
        </Link>
      </Button>
    );
  }

  return (
    <>
      <Button
        size="sm"
        className={className}
        onClick={() => {
          if (!onboarded) return setGuideOpen(true);
          heading.current = true;
          setOpen(true);
        }}
      >
        <PlusIcon className="size-4" /> New payment
      </Button>
      <WalletWalkthrough
        open={guideOpen}
        onOpenChange={setGuideOpen}
        onDone={proceed}
        // One label either way; without a wallet it opens the wallet picker next.
        doneLabel="Get started"
      />
      <ConnectDialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          // Read the store directly: this render's isConnected can lag the connect that just closed us.
          if (!o && !getConnection(config).isConnected) heading.current = false;
        }}
      />
    </>
  );
}
