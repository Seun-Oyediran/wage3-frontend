"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { BellIcon, ChevronRightIcon } from "@/components/ui/icons";
import { Logo } from "@/components/ui/logo";
import { WalletButton } from "@/components/wallet/wallet-button";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils/cn";

import { useActive } from "./app-nav";
import { AppSearch } from "./app-search";

// Below lg, where the sidebar is hidden; same order as the sidebar.
const MOBILE = [
  { href: "/dashboard", label: "Home" },
  { href: "/history", label: "History" },
  { href: "/lists", label: "Lists" },
  { href: "/settings", label: "Settings" },
] as const;

/** Where a page sits, for the breadcrumb: its parent, linked when the parent is a page. */
function parentOf(pathname: string): { label: string; href?: string } | null {
  if (pathname === "/pay/new") return { label: "Pay" };
  if (pathname.startsWith("/pay/")) return { label: "History", href: "/history" };
  if (pathname.startsWith("/lists/")) return { label: "Lists", href: "/lists" };
  return null;
}

/**
 * Watches the page's h1 and reports when it has scrolled up under the top bar. Pages render
 * their h1 after data loads (and swap it while renaming), so a MutationObserver re-attaches to
 * whichever h1 is current.
 */
function useScrolledPastTitle(pathname: string) {
  const [state, setState] = useState({ path: "", title: "", past: false });
  useEffect(() => {
    const main = document.getElementById("app-main");
    if (!main) return;
    let watched: Element | null = null;
    // The 64px sticky top bar covers the top of the window; a title under it counts as gone.
    const io = new IntersectionObserver(
      ([e]) => setState({ path: pathname, title: e.target.textContent?.trim() ?? "", past: !e.isIntersecting && e.boundingClientRect.top < 64 }),
      { rootMargin: "-64px 0px 0px 0px" },
    );
    const attach = () => {
      const h1 = main.querySelector("h1");
      if (h1 === watched) return;
      if (watched) io.unobserve(watched);
      watched = h1;
      if (h1) io.observe(h1);
    };
    attach();
    const mo = new MutationObserver(attach);
    mo.observe(main, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);
  // Keyed by path so a new page never starts with the last page's crumb showing.
  return state.path === pathname && state.past ? state.title : null;
}

/** Appears once the page title scrolls away, so you still know where you are. */
function Breadcrumb({ pathname }: { pathname: string }) {
  const title = useScrolledPastTitle(pathname);
  const parent = parentOf(pathname);
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 hidden h-16 items-center justify-center md:flex">
      <AnimatePresence>
        {title && (
          <motion.nav
            key={pathname}
            aria-label="Breadcrumb"
            initial={{ opacity: 0, filter: "blur(4px)", transform: "translateY(4px)" }}
            animate={{ opacity: 1, filter: "blur(0px)", transform: "translateY(0px)" }}
            exit={{ opacity: 0, filter: "blur(4px)", transform: "translateY(-2px)", transition: { duration: 0.12 } }}
            transition={{ duration: 0.22, ease: EASE_OUT }}
            className="pointer-events-auto flex max-w-[min(420px,40vw)] items-center gap-1.5 text-sm"
          >
            {parent && (
              <>
                {parent.href ? (
                  <Link href={parent.href} className="shrink-0 text-fg-muted hover:text-fg">
                    {parent.label}
                  </Link>
                ) : (
                  <span className="shrink-0 text-fg-muted">{parent.label}</span>
                )}
                <ChevronRightIcon className="size-3.5 shrink-0 text-fg-subtle" />
              </>
            )}
            <span aria-current="page" className="truncate font-medium text-fg">
              {title}
            </span>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Placeholder until notifications exist: there so the bar isn't just the wallet. Does nothing yet. */
function NotificationButton() {
  return (
    <Button variant="filled" size="icon" aria-label="Notifications" className="text-fg-muted hover:text-fg">
      <BellIcon className="size-4" />
    </Button>
  );
}

/**
 * The bar above every page: search on the left, notifications and the wallet on the right, and
 * the breadcrumb once the title scrolls away. Below lg it also carries the logo and the section
 * tabs, since the sidebar is hidden.
 */
export function AppHeader() {
  const active = useActive();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 shrink-0 bg-bg/85 backdrop-blur-xl">
      <div className="relative flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Breadcrumb pathname={pathname} />
        <Link href="/dashboard" className="pressable shrink-0 rounded-md lg:hidden">
          <Logo mark={false} />
        </Link>

        <AppSearch className="hidden sm:block" />

        <div className="ml-auto flex items-center gap-2">
          <NotificationButton />
          <WalletButton filled className="h-9" />
        </div>
      </div>

      {/* Below lg the sidebar is hidden, so the sections become tabs. */}
      <nav className="flex gap-1 overflow-x-auto px-4 pb-2 lg:hidden" aria-label="Main">
        {MOBILE.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-medium whitespace-nowrap",
              active(l.href) ? "bg-surface-muted text-fg" : "text-fg-muted",
            )}
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
