import { useSyncExternalStore } from "react";
import { base, baseSepolia } from "viem/chains";
import { createConfig, http } from "wagmi";
import { baseAccount, injected } from "wagmi/connectors";

import { chain, RPC_URL } from "./config";

export const wagmiConfig = createConfig({
  // Only the backend's chain is offered; the other transport just satisfies the type.
  chains: [chain],
  connectors: [baseAccount({ appName: "Wage3" }), injected({ shimDisconnect: true })],
  transports: {
    [base.id]: http(chain.id === base.id ? RPC_URL : undefined),
    [baseSepolia.id]: http(chain.id === baseSepolia.id ? RPC_URL : undefined),
  },
  ssr: true,
});

/**
 * Whether wagmi is still restoring the last wallet on page load. It starts "disconnected", then
 * after mount moves to "reconnecting" or "connecting" (which one depends on what it saved) and
 * lands on "connected" or "disconnected". Until it lands, a "not connected" reading isn't real.
 * Subscribed at module load, before the restore starts, so no step is missed.
 */
let restorePhase: "waiting" | "restoring" | "done" = "waiting";
const restoreListeners = new Set<() => void>();
wagmiConfig.subscribe(
  (state) => state.status,
  (status) => {
    const next =
      restorePhase === "waiting" && status !== "disconnected"
        ? status === "connected" ? "done" : "restoring"
        : restorePhase === "restoring" && (status === "connected" || status === "disconnected")
          ? "done"
          : restorePhase;
    if (next === restorePhase) return;
    restorePhase = next;
    restoreListeners.forEach((l) => l());
  },
);

/** True until wagmi has finished restoring the last wallet: show a placeholder, not "Connect wallet". */
export function useWalletRestoring() {
  return useSyncExternalStore(
    (l) => {
      restoreListeners.add(l);
      return () => restoreListeners.delete(l);
    },
    () => restorePhase !== "done",
    () => true,
  );
}

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
