"use client";

import { useId, type ReactNode } from "react";

/**
 * A titled block on a page, opened by a hairline. The header is 68px with the heading centered,
 * so the heading's text sits 24px under the rule and 24px over the content, and an `action`
 * up to 36px tall (a link, a segmented control) fits without moving it.
 */
export function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <section aria-labelledby={id} className="border-t border-hairline">
      <div className="flex min-h-17 items-center justify-between gap-4">
        <h2 id={id} className="text-sm font-medium tracking-[-0.006em] text-fg">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}
