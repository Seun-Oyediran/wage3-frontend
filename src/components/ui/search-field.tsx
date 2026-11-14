"use client";

import type { InputHTMLAttributes } from "react";

import { CloseIcon, SearchIcon } from "@/components/ui/icons";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils/cn";

/**
 * The app's search field: a grey pill with no border and a blue ring on focus. `loading` shows a
 * spinner while results are on their way; `onClear` adds a clear button (and Escape) once there's
 * text. `className` sizes the wrapper.
 */
export function SearchField({
  className,
  loading,
  onClear,
  onKeyDown,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { loading?: boolean; onClear?: () => void }) {
  const hasText = !!props.value;
  const trailing = loading || (onClear && hasText);
  return (
    <div className={cn("relative", className)}>
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-fg-subtle" />
      <input
        {...props}
        onKeyDown={(e) => {
          if (e.key === "Escape" && onClear && hasText) onClear();
          onKeyDown?.(e);
        }}
        className={cn(
          "h-10 w-full rounded-full bg-surface-muted pl-10 text-13 outline-none transition-[background-color,box-shadow] duration-150 placeholder:text-fg-subtle focus:bg-surface focus:shadow-[0_0_0_2px_var(--primary)]",
          trailing ? "pr-11" : "pr-4",
        )}
      />
      {trailing && (
        <span className="absolute top-1/2 right-1.5 grid size-7 -translate-y-1/2 place-items-center">
          {loading ? (
            <Spinner className="size-4 text-fg-subtle" />
          ) : (
            <button
              type="button"
              onClick={onClear}
              className="pressable grid size-7 place-items-center rounded-full text-fg-subtle hover:bg-surface-hover hover:text-fg"
              aria-label="Clear search"
            >
              <CloseIcon className="size-3.5" />
            </button>
          )}
        </span>
      )}
    </div>
  );
}
