"use client";

import { PeopleIcon } from "@/components/ui/icons";
import { LogoPreview } from "@/components/ui/logo-field";
import { cn } from "@/lib/utils/cn";
import { useListLogo } from "@/lib/local-prefs";

const SIZES = {
  sm: { box: "size-9", icon: "size-4" },
  md: { box: "size-10", icon: "size-4.5" },
} as const;

/** A list's logo (stored on this device), or the people icon when it has none. */
export function ListAvatar({ listId, size = "md" }: { listId: string; size?: keyof typeof SIZES }) {
  const [logo] = useListLogo(listId);
  const s = SIZES[size];
  if (logo) return <LogoPreview src={logo} className={s.box} />;
  return (
    <span className={cn("grid shrink-0 place-items-center rounded-full bg-surface-muted text-fg-muted", s.box)}>
      <PeopleIcon className={s.icon} />
    </span>
  );
}
