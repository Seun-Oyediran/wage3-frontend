"use client";

import { motion } from "motion/react";

import { ImportIcon, SendIcon, WalletIcon } from "@/components/ui/icons";
import { Section } from "@/components/ui/section";
import { riseIn } from "@/lib/motion";

const STEPS = [
  { icon: ImportIcon, title: "Add your people", body: "Paste wallets or import a CSV." },
  { icon: WalletIcon, title: "Connect a wallet", body: "Base Account or any browser wallet." },
  { icon: SendIcon, title: "Send in one go", body: "Up to 1,000 wallets, batched on Base." },
];

/** Before the first payment: the three steps to one, in place of lists and recent payments. */
export function FirstRun() {
  return (
    <Section title="Get started">
      {/* Five columns on desktop keeps each step a compact tile; the rest of the row stays empty. */}
      <ol className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {STEPS.map((s, i) => (
          <motion.li
            key={s.title}
            {...riseIn(0.05 + i * 0.05)}
            className="flex h-28 flex-col gap-2 rounded-2xl bg-(--color-25) p-4 shadow-(--shadow-xs) sm:p-5"
          >
            <div className="flex items-center gap-2">
              <s.icon className="size-5 shrink-0 text-(--color-800)" />
              <h3 className="truncate text-15 font-medium tracking-[-0.01em] text-(--color-950)">{s.title}</h3>
            </div>
            <p className="line-clamp-2 text-13 leading-5 text-(--color-900) text-pretty">{s.body}</p>
          </motion.li>
        ))}
      </ol>
    </Section>
  );
}
