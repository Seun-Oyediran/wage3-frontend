"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useEffectEvent, type ComponentType } from "react";

import { ExternalIcon, HashIcon, HistoryIcon, HomeIcon, ListIcon, PaymentIcon, SettingsIcon, SidebarIcon } from "@/components/ui/icons";
import { Kbd, ModKey } from "@/components/ui/kbd";
import { Logo, LogoMark } from "@/components/ui/logo";
import { Tooltip } from "@/components/ui/tooltip";
import { addressUrl, BATCHER_ADDRESS } from "@/lib/config";
import { useHydrated } from "@/lib/auth/use-session";
import { useLocalValue } from "@/lib/local-prefs";
import { SIDEBAR_COLLAPSED_KEY } from "@/lib/sidebar";
import { cn } from "@/lib/utils/cn";

import { UserCard } from "./user-menu";

type NavLink = { href: string; label: string; icon: ComponentType<{ className?: string }>; external?: boolean };

// Grouped like a dashboard sidebar: where you are, what you do, where the money lives.
const SECTIONS: { title?: string; links: NavLink[] }[] = [
  {
    links: [
      { href: "/dashboard", label: "Home", icon: HomeIcon },
      { href: "/history", label: "History", icon: HistoryIcon },
    ],
  },
  {
    title: "Pay",
    links: [
      { href: "/pay/new", label: "New payment", icon: PaymentIcon },
      { href: "/lists", label: "Lists", icon: ListIcon },
    ],
  },
  {
    title: "On-chain",
    links: [{ href: addressUrl(BATCHER_ADDRESS), label: "Batcher contract", icon: HashIcon, external: true }],
  },
];

const SETTINGS: NavLink = { href: "/settings", label: "Settings", icon: SettingsIcon };

/** Whether a nav link is the current page or one of its children. */
export function useActive() {
  const pathname = usePathname();
  return (href: string) => pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * One sidebar link. Collapsed, the label fades out (it's clipped by the rail) and moves to a
 * tooltip. The icon sits 20px in either way, so it doesn't move when the rail collapses.
 */
function NavItem({ link, on, collapsed }: { link: NavLink; on: boolean; collapsed: boolean }) {
  const item = (
    <Link
      href={link.href}
      target={link.external ? "_blank" : undefined}
      rel={link.external ? "noreferrer" : undefined}
      aria-label={collapsed ? link.label : undefined}
      className={cn(
        // No transitions: hover and the active state change instantly, on click and on sweep.
        "relative flex h-9 items-center gap-2.5 rounded-[8px] px-3 text-13 font-medium whitespace-nowrap [corner-shape:superellipse(1.5)]",
        on ? "text-fg" : "text-fg-muted hover:bg-surface-hover hover:text-fg",
      )}
    >
      {/* No slide between links: the highlight lands on the clicked link instantly. */}
      {on && <span className="absolute inset-0 rounded-[8px] bg-(--color-200) [corner-shape:superellipse(1.5)]" />}
      <link.icon className="relative size-4 shrink-0" />
      <span className="relative flex flex-1 items-center gap-2.5 transition-opacity duration-150 collapsed:opacity-0">
        <span className="flex-1">{link.label}</span>
        {link.external && <ExternalIcon className="size-3.5 text-fg-subtle" />}
      </span>
    </Link>
  );
  return collapsed ? (
    <Tooltip content={link.label} side="right">
      {item}
    </Tooltip>
  ) : (
    item
  );
}

/**
 * Desktop: full-height rail, collapsible to icons with ⌘\. Hidden below `lg`, where the top bar
 * carries the tabs. How it looks collapsed comes from CSS (`collapsed:`, keyed to <html
 * data-sidebar>), set before first paint, so it never loads wide and then shrinks. `collapsed`
 * here only drives labels and tooltips.
 */
export function AppSidebar() {
  const active = useActive();
  const hydrated = useHydrated();
  const [stored, setStored] = useLocalValue(SIDEBAR_COLLAPSED_KEY);
  const collapsed = stored === "1";
  const toggle = () => setStored(collapsed ? null : "1");
  const onShortcut = useEffectEvent(toggle);

  // Mirrors the stored value onto <html>: on toggle, and when another tab changes it. Waits for
  // hydration, whose first pass doesn't know the stored value and would undo the pre-paint script.
  useEffect(() => {
    if (!hydrated) return;
    const root = document.documentElement;
    if (collapsed) root.dataset.sidebar = "collapsed";
    else delete root.dataset.sidebar;
  }, [hydrated, collapsed]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Only where the sidebar shows; below lg it would toggle something you can't see.
      if (!(e.metaKey || e.ctrlKey) || e.key !== "\\" || !window.matchMedia("(min-width: 64rem)").matches) return;
      e.preventDefault();
      onShortcut();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const toggleLabel = collapsed ? "Expand sidebar" : "Collapse sidebar";

  return (
    <aside
      data-app-sidebar
      className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col overflow-hidden border-r border-border bg-surface-sunken transition-[width] duration-200 ease-(--ease-out) motion-reduce:transition-none collapsed:w-14 lg:flex"
    >
      {/* Collapsed, the mark stays where it is and hovering the header swaps it for the expand button. */}
      <div className="group/head relative flex h-16 shrink-0 items-center pr-2 pl-5 collapsed:pl-4.5">
        <Link
          href="/dashboard"
          aria-label="Home"
          className="pressable rounded-md collapsed:group-hover/head:opacity-0 collapsed:group-has-focus-visible/head:opacity-0"
        >
          <Logo mark={false} className="collapsed:hidden" />
          <LogoMark className="hidden collapsed:block" />
        </Link>
        <Tooltip
          content={
            <>
              {toggleLabel} <ModKey />
              <Kbd>\</Kbd>
            </>
          }
          side="right"
        >
          <button
            type="button"
            onClick={toggle}
            aria-label={toggleLabel}
            aria-expanded={!collapsed}
            className="ml-auto grid size-7 place-items-center rounded-md text-fg-subtle hover:bg-surface-hover hover:text-fg collapsed:absolute collapsed:left-3.5 collapsed:ml-0 collapsed:opacity-0 collapsed:group-hover/head:opacity-100 collapsed:focus-visible:opacity-100"
          >
            <SidebarIcon open={collapsed} className="size-4" />
          </button>
        </Tooltip>
      </div>

      <nav aria-label="Main" className="flex flex-1 flex-col gap-6 overflow-x-hidden overflow-y-auto px-2 pt-2">
        {SECTIONS.map((section, i) => (
          <div key={section.title ?? i} className="flex flex-col gap-0.5">
            {/* Collapsed, the title keeps its space so the icons below don't shift up. */}
            {section.title && (
              <div
                aria-hidden={collapsed}
                className="px-3 pb-1.5 text-13 whitespace-nowrap text-fg-subtle transition-opacity duration-150 collapsed:opacity-0"
              >
                {section.title}
              </div>
            )}
            {section.links.map((l) => (
              <NavItem key={l.href} link={l} on={!l.external && active(l.href)} collapsed={collapsed} />
            ))}
          </div>
        ))}
      </nav>

      {/* Settings and the account sit at the bottom, apart from the everyday sections. */}
      <div className="flex flex-col gap-1 p-2">
        <NavItem link={SETTINGS} on={active(SETTINGS.href)} collapsed={collapsed} />
        <UserCard collapsed={collapsed} />
      </div>
    </aside>
  );
}
