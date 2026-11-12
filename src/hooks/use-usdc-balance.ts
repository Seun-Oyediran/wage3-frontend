"use client";

import { useConnection, useReadContract } from "wagmi";

import { chain, USDC } from "@/lib/config";
import { erc20Abi } from "@/lib/contracts";

/** USDC balance of the connected wallet on Base, refreshed every 15s. */
export function useUsdcBalance() {
  const { address } = useConnection();
  return useReadContract({
    address: USDC.address,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: chain.id,
    query: { enabled: !!address, refetchInterval: 15_000 },
  });
}
