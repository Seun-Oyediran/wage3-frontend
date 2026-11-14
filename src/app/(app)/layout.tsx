"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { AppHeader } from "@/components/shell/app-header";
import { AppSidebar } from "@/components/shell/app-nav";
import { StatusBanner } from "@/components/shell/status-banner";
import { PageHeaderSkeleton } from "@/components/ui/page-header";
import { useSession } from "@/lib/auth/use-session";

export default function AppLayout({ children }: { children: ReactNode }) {
  const { hydrated, isAuthenticated } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace(`/sign-in?next=${encodeURIComponent(pathname)}`);
    }
  }, [hydrated, isAuthenticated, pathname, router]);

  return (
    // Desktop: a full-height sidebar that stays put, and the page beside it. The window scrolls,
    // so the browser restores scroll position on back/forward.
    <div className="flex min-h-dvh">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col bg-bg">
        <StatusBanner />
        <AppHeader />
        <main
          id="app-main"
          aria-busy={!isAuthenticated}
          className="mx-auto w-full max-w-7xl flex-1 px-4 pt-8 pb-24 sm:px-6 sm:pt-10 lg:px-8 lg:pt-6"
        >
          {/* The shell renders straight away at its final size; only the page waits for the
              session (kept in localStorage, so unknown on the server and the first render). */}
          {isAuthenticated ? children : <PageHeaderSkeleton />}
        </main>
      </div>
    </div>
  );
}
