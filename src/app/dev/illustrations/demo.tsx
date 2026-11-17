"use client";

import { useState } from "react";

import { EmptyIllustration, type IllustrationId } from "@/components/illustrations";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const SCENES: { id: IllustrationId; title: string; description: string }[] = [
  {
    id: "lists",
    title: "Save your first list",
    description: "Save your team or contributors once, then pay them all in a couple of clicks every time.",
  },
  {
    id: "history",
    title: "Send your first payment",
    description: "Pay your whole team in USDC on Base. Every payment lands here with its on-chain receipt.",
  },
  {
    id: "rows",
    title: "No payment history yet",
    description: "Send your first payment and it'll show up here.",
  },
  {
    id: "no-matches",
    title: "Nothing matches these filters",
    description: "Try a different name, status or date range.",
  },
];

/** Trial bench for the empty-state illustrations: real size in its card, and zoomed. */
export function IllustrationsDemo() {
  const [run, setRun] = useState(0);

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-20 font-medium">Empty-state illustrations</h1>
        <Button variant="outline" size="sm" onClick={() => setRun((n) => n + 1)}>
          Replay
        </Button>
      </div>

      <div className="flex flex-col gap-10">
        {SCENES.map((s) => (
          <section key={s.id} data-scene={s.id} className="grid items-start gap-6 md:grid-cols-2">
            <Card className="flex flex-col items-center px-6 py-16">
              <div className="flex w-full max-w-sm flex-col items-start">
                <EmptyIllustration key={run} id={s.id} />
                <h2 className="headline mt-8 text-24 font-normal">{s.title}</h2>
                <p className="mt-2 text-15 leading-6 text-fg-muted text-pretty">{s.description}</p>
              </div>
            </Card>
            <Card className="grid place-items-center overflow-hidden p-6">
              <div data-zoom className="size-[480px]">
                <EmptyIllustration key={run} id={s.id} className="size-40 origin-top-left scale-300" />
              </div>
            </Card>
          </section>
        ))}
      </div>
    </div>
  );
}
