"use client";

import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";

import { cn } from "@/lib/utils/cn";

/**
 * A one-time code as one box per digit. Typing moves on, Backspace on an empty box goes back,
 * arrows move, and a pasted or autofilled code fills every box. `onComplete` fires once per
 * distinct full code (Enter fires it again). Focuses the first box on mount.
 */
export function CodeInput({
  length,
  disabled,
  invalid,
  label,
  onEdit,
  onComplete,
}: {
  length: number;
  disabled?: boolean;
  invalid?: boolean;
  /** Names the group for screen readers ("6-digit code"). */
  label: string;
  /** Any change, e.g. to clear a previous error. */
  onEdit?: () => void;
  onComplete: (code: string) => void;
}) {
  const [digits, setDigits] = useState<string[]>(() => Array(length).fill(""));
  const boxes = useRef<(HTMLInputElement | null)[]>([]);
  const lastCompleted = useRef<string | null>(null);

  useEffect(() => {
    boxes.current[0]?.focus();
  }, []);

  const commit = (next: string[]) => {
    setDigits(next);
    onEdit?.();
    const code = next.join("");
    if (!next.includes("") && lastCompleted.current !== code) {
      lastCompleted.current = code;
      onComplete(code);
    }
  };

  /** Writes `chars` from box `start` on, then focuses the box after the last one written. */
  const fill = (start: number, chars: string) => {
    const next = [...digits];
    let i = start;
    for (const c of chars) {
      if (i >= length) break;
      next[i++] = c;
    }
    commit(next);
    boxes.current[Math.min(i, length - 1)]?.focus();
  };

  const onChange = (i: number, value: string) => {
    const only = value.replace(/\D/g, "");
    if (only) return fill(i, only);
    const next = [...digits];
    next[i] = "";
    commit(next);
  };

  const onKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      e.preventDefault();
      const next = [...digits];
      next[i - 1] = "";
      commit(next);
      boxes.current[i - 1]?.focus();
    } else if (e.key === "ArrowLeft" && i > 0) {
      e.preventDefault();
      boxes.current[i - 1]?.focus();
    } else if (e.key === "ArrowRight" && i < length - 1) {
      e.preventDefault();
      boxes.current[i + 1]?.focus();
    } else if (e.key === "Enter" && !digits.includes("")) {
      e.preventDefault();
      onComplete(digits.join(""));
    }
  };

  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!text) return;
    e.preventDefault();
    fill(0, text.slice(0, length));
  };

  return (
    <fieldset disabled={disabled} className="flex justify-between gap-2" aria-label={label}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            boxes.current[i] = el;
          }}
          value={d}
          onChange={(e) => onChange(i, e.target.value)}
          onKeyDown={(e) => onKeyDown(i, e)}
          onPaste={onPaste}
          onFocus={(e) => e.target.select()}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          // Room for a whole code, so autofill into the first box can spread it across all of them.
          maxLength={length}
          aria-label={`Digit ${i + 1}`}
          aria-invalid={invalid || undefined}
          // Grey wells; the one being typed in turns white with a dark edge.
          className={cn(
            "h-14 w-full min-w-0 rounded-2xl border border-transparent bg-(--color-400) text-center font-mono text-2xl font-medium tabular outline-none [corner-shape:superellipse(1.5)]",
            "transition-[border-color,background-color] duration-150 focus:border-(--color-900) focus:bg-surface",
            "disabled:opacity-60 aria-invalid:border-danger aria-invalid:bg-danger-soft",
          )}
        />
      ))}
    </fieldset>
  );
}
