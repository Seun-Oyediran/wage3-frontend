"use client";

import { LogOut } from "lucide-react";

import {
  DropdownContent,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
  DropdownSeparator,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import { MailIcon } from "@/components/ui/icons";
import { useMe } from "@/lib/api/queries";
import { useSession, useSignOut } from "@/lib/auth/use-session";
import { Skeleton } from "@/components/ui/skeleton";

export function Avatar({ name, email, src, className = "size-8" }: { name?: string | null; email: string; src?: string | null; className?: string }) {
  const initial = (name || email).trim().charAt(0).toUpperCase();
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" referrerPolicy="no-referrer" className={`${className} rounded-full object-cover`} />
  ) : (
    <span className={`${className} grid place-items-center rounded-full bg-inverse text-13 font-semibold text-inverse-fg`}>
      {initial}
    </span>
  );
}

/**
 * Sidebar footer: who's signed in, with sign out. The avatar's centre lines up with the nav
 * icons above; collapsed, only the avatar shows.
 */
export function UserCard({ collapsed }: { collapsed?: boolean }) {
  const { user: sessionUser } = useSession();
  const { data: me } = useMe();
  const signOut = useSignOut();
  const user = me ?? sessionUser;

  // Until the session is read: the same size, so the sidebar footer doesn't move when it lands.
  if (!user) {
    return (
      <div aria-hidden className="flex h-13 items-center gap-2.5 px-1">
        <Skeleton className="size-8 shrink-0 rounded-full" />
        <span className="flex flex-1 flex-col gap-1.5 collapsed:opacity-0">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-2.5 w-32" />
        </span>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownTrigger
        aria-label={collapsed ? "Account menu" : undefined}
        className="pressable flex h-13 w-full items-center gap-2.5 rounded-lg px-1 text-left hover:bg-surface-hover"
      >
        <Avatar name={user.full_name} email={user.email} src={user.avatar_url} className="size-8 shrink-0" />
        <span className="min-w-0 flex-1 whitespace-nowrap transition-opacity duration-150 collapsed:opacity-0">
          {user.full_name && <span className="block truncate text-14 font-medium">{user.full_name}</span>}
          <span className="block truncate text-12 text-fg-subtle">{user.email}</span>
        </span>
      </DropdownTrigger>
      <DropdownContent className="w-56" side={collapsed ? "right" : "top"}>
        <DropdownItem icon={<LogOut />} onSelect={signOut}>
          Log out
        </DropdownItem>
      </DropdownContent>
    </DropdownMenu>
  );
}

export function UserMenu() {
  const { user: sessionUser } = useSession();
  const { data: me } = useMe();
  const signOut = useSignOut();
  const user = me ?? sessionUser;
  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownTrigger
        className="pressable rounded-full outline-offset-2"
        aria-label="Account menu"
      >
        <Avatar name={user.full_name} email={user.email} src={user.avatar_url} />
      </DropdownTrigger>
      <DropdownContent className="w-64">
        <DropdownLabel className="flex flex-col gap-0.5 pb-2">
          {user.full_name && <span className="text-13 font-medium text-fg">{user.full_name}</span>}
          <span className="flex items-center gap-1.5 truncate">
            <MailIcon className="size-3" /> {user.email}
          </span>
        </DropdownLabel>
        <DropdownSeparator />
        <DropdownItem icon={<LogOut />} onSelect={signOut}>
          Log out
        </DropdownItem>
      </DropdownContent>
    </DropdownMenu>
  );
}
