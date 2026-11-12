"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { SearchField } from "@/components/ui/search-field";
import { cn } from "@/lib/utils/cn";

/**
 * The header's search, meant to grow into one search across the app (payments, lists,
 * recipients). For now it only knows payments: submitting opens History filtered by the term.
 */
export function AppSearch({ className }: { className?: string }) {
  const router = useRouter();
  const [q, setQ] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    router.push(term ? `/history?q=${encodeURIComponent(term)}` : "/history");
  };

  return (
    <form onSubmit={submit} role="search" className={cn("w-full max-w-[269px]", className)}>
      <SearchField value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search payments, lists, people" aria-label="Search payments, lists and people" />
    </form>
  );
}
