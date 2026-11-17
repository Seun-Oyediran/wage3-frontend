import type { Metadata } from "next";
import Link from "next/link";

import { ChangelogEntry } from "@/components/changelog/changelog-entry";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { CHANGELOG, REPO_URL } from "@/content/changelog";
import { cn } from "@/lib/utils/cn";
import { DISPLAY_TEXT } from "@/lib/type";

export const metadata: Metadata = {
  title: "Changelog · Wage3",
  description: "What's new in Wage3.",
};

/** The public changelog: every release, newest first. */
export default function ChangelogPage() {
  return (
    <div className="min-h-dvh">
      <header className="border-b border-hairline">
        <div className="mx-auto flex h-16 max-w-[1248px] items-center justify-between px-6">
          <Link href="/" className="pressable rounded-md">
            <Logo mark={false} />
          </Link>
          {/* Into the app; its guard sends anyone logged out to log in first. */}
          <Button asChild variant="inverse" size="sm">
            <Link href="/dashboard">Use App</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-[1248px] px-6 pt-16 pb-24">
        <h1 className={cn(DISPLAY_TEXT, "text-28 leading-8 font-medium tracking-[-0.01em]")}>Changelog</h1>

        <ol className="mt-16">
          {CHANGELOG.map((entry) => (
            <ChangelogEntry key={entry.slug} entry={entry} />
          ))}
        </ol>

        <p className="mt-4 text-13 text-fg-subtle">
          Every release is on{" "}
          <a href={REPO_URL} target="_blank" rel="noreferrer" className="text-fg-muted underline-offset-4 hover:text-fg hover:underline">
            GitHub
          </a>
          .
        </p>
      </main>
    </div>
  );
}
