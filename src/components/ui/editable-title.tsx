"use client";

import { Pencil } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { LIMITS } from "@/lib/config";

/**
 * A page title you can click to rename (a list, a payment). An empty or too-long name keeps the
 * field open with the reason, so nothing typed is lost. Enter or leaving the field saves; Escape
 * cancels. `onRename` runs only when the name actually changed.
 */
export function EditableTitle({
  value,
  label,
  onRename,
  maxLength = LIMITS.nameLength,
  startEditing = false,
  onStarted,
  onEnter,
}: {
  /** The name to show; pass the pending one while a rename is in flight. */
  value: string;
  /** What's being named, for screen readers ("List name"). */
  label: string;
  onRename: (name: string) => void;
  maxLength?: number;
  /** Open in edit mode with the name selected, e.g. for something just created with a default name. */
  startEditing?: boolean;
  /** Called once after opening in edit mode via `startEditing`. */
  onStarted?: () => void;
  /** After a valid save with Enter, e.g. to move on to the next field. */
  onEnter?: () => void;
}) {
  const [editing, setEditing] = useState(startEditing);
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!startEditing) return;
    inputRef.current?.select();
    onStarted?.();
  }, [startEditing, onStarted]);

  const start = () => {
    setDraft(value);
    setError(null);
    setEditing(true);
    requestAnimationFrame(() => inputRef.current?.select());
  };

  /** Returns false when the name is invalid; the field then stays open with the reason. */
  const commit = () => {
    const name = draft.trim();
    if (!name) {
      setError("Name can't be empty");
      return false;
    }
    if (name.length > maxLength) {
      setError(`At most ${maxLength} characters`);
      return false;
    }
    setEditing(false);
    if (name !== value) onRename(name);
    return true;
  };

  if (editing) {
    return (
      <div>
        <input
          ref={inputRef}
          value={draft}
          aria-label={label}
          aria-invalid={!!error || undefined}
          onChange={(e) => {
            setDraft(e.target.value);
            setError(null);
          }}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (commit()) onEnter?.();
            } else if (e.key === "Escape") {
              setEditing(false);
              setError(null);
            }
          }}
          className="headline -mx-2 w-full max-w-xl font-normal rounded-xl border border-primary bg-surface px-2 py-1 text-28 outline-none shadow-[0_0_0_3px_color-mix(in_oklch,var(--primary)_18%,transparent)] aria-invalid:border-danger"
        />
        {error && <p className="mt-1.5 text-13 text-danger-fg">{error}</p>}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={start}
      className="group -mx-2 flex max-w-full items-center gap-2 rounded-xl px-2 py-1 text-left transition-colors duration-150 hover:bg-surface-hover"
      aria-label={`Rename ${value}`}
    >
      <h1 className="headline truncate text-28 font-normal">{value}</h1>
      <Pencil className="size-4 shrink-0 text-fg-subtle opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100" />
    </button>
  );
}
