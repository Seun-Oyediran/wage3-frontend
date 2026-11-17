"use client";

import { DropdownMenu as M } from "radix-ui";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";
import { CheckIcon, ChevronRightIcon } from "@/components/ui/icons";

export const DropdownMenu = M.Root;
export const DropdownTrigger = M.Trigger;

const PANEL =
  "z-50 min-w-44 rounded-[11px] bg-surface p-1 shadow-(--shadow-menu) [corner-shape:superellipse(1.5)] " +
  "data-[state=open]:animate-menu-in data-[state=closed]:animate-menu-out";
const ROW =
  "flex h-7.5 cursor-default select-none items-center gap-2 rounded-[7px] px-2 text-13 outline-none [corner-shape:superellipse(1.5)] " +
  "data-highlighted:bg-surface-hover data-disabled:opacity-45";

/**
 * Scales from the trigger (origin-aware), 160ms ease-out. 4px padding with 7px items, so the
 * container is 11px: concentric radii. A layered shadow stands in for a border. Rows are 30px
 * at 13px, the same scale as the tables and sidebar.
 */
export function DropdownContent({
  className,
  align = "end",
  sideOffset = 6,
  ...props
}: ComponentProps<typeof M.Content>) {
  return (
    <M.Portal>
      <M.Content
        align={align}
        sideOffset={sideOffset}
        className={cn(
          PANEL,
          "origin-(--radix-dropdown-menu-content-transform-origin)",
          className,
        )}
        {...props}
      />
    </M.Portal>
  );
}

export function DropdownItem({
  className,
  icon,
  tone,
  children,
  ...props
}: ComponentProps<typeof M.Item> & { icon?: ReactNode; tone?: "danger" }) {
  return (
    <M.Item
      className={cn(
        ROW,
        tone === "danger" ? "text-danger-fg" : "text-fg",
        className,
      )}
      {...props}
    >
      {icon && <span className="flex text-current opacity-70 [&_svg]:size-3.5">{icon}</span>}
      {children}
    </M.Item>
  );
}

export function DropdownSeparator() {
  return <M.Separator className="-mx-1 my-1 h-px bg-border" />;
}

/** Section label, with an optional quiet action on the right (e.g. "Reset"). */
export function DropdownLabel({
  className,
  action,
  children,
  ...props
}: ComponentProps<typeof M.Label> & { action?: ReactNode }) {
  return (
    <M.Label
      className={cn("flex items-center justify-between gap-4 px-2 pt-1.5 pb-0.5 text-12 font-medium text-fg-subtle", className)}
      {...props}
    >
      {children}
      {action && <span className="text-fg-subtle hover:text-fg">{action}</span>}
    </M.Label>
  );
}

/** A row that opens a secondary menu to its side. */
export const DropdownSub = M.Sub;

export function DropdownSubTrigger({
  className,
  icon,
  hint,
  children,
  ...props
}: ComponentProps<typeof M.SubTrigger> & { icon?: ReactNode; hint?: ReactNode }) {
  return (
    <M.SubTrigger className={cn(ROW, "text-fg data-[state=open]:bg-surface-hover", className)} {...props}>
      {icon && <span className="flex text-current opacity-70 [&_svg]:size-3.5">{icon}</span>}
      <span className="flex-1 whitespace-nowrap">{children}</span>
      {hint && <span className="max-w-28 truncate text-12 text-fg-subtle">{hint}</span>}
      <ChevronRightIcon className="size-3.5 text-fg-subtle" />
    </M.SubTrigger>
  );
}

export function DropdownSubContent({ className, sideOffset = 8, ...props }: ComponentProps<typeof M.SubContent>) {
  return (
    <M.Portal>
      <M.SubContent
        sideOffset={sideOffset}
        alignOffset={-4}
        className={cn(PANEL, "origin-(--radix-dropdown-menu-content-transform-origin) data-[state=open]:animate-submenu-in", className)}
        {...props}
      />
    </M.Portal>
  );
}

export const DropdownRadioGroup = M.RadioGroup;

/** Single choice in a group; the chosen one gets a tick on the right. */
export function DropdownRadioItem({ className, children, ...props }: ComponentProps<typeof M.RadioItem>) {
  return (
    <M.RadioItem className={cn(ROW, "text-fg", className)} {...props}>
      <span className="flex-1 truncate">{children}</span>
      <M.ItemIndicator>
        <CheckIcon className="size-3.5" />
      </M.ItemIndicator>
    </M.RadioItem>
  );
}
