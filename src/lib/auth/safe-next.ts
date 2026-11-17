/**
 * Where to go after signing in: `next` when it's one of our own pages ("/lists"), else the
 * dashboard. "//evil.com", "/\evil.com" and "https://…" are rejected, since they'd leave the site.
 */
export function safeNext(next: string | null) {
  if (next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\")) return next;
  return "/dashboard";
}
