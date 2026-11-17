import type { User } from "@/lib/api/types";

/** "Good morning" / "Good afternoon" / "Good evening", by the viewer's local time. */
export function greeting(now = new Date()) {
  const h = now.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

/** The first word of the user's name, falling back to the part of their email before the @. */
export function firstName(user: User | null | undefined) {
  return user?.full_name?.trim().split(/\s+/)[0] || user?.email.split("@")[0] || "";
}
