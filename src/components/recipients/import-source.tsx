"use client";

import { motion } from "motion/react";
import { useId, useRef, useState, type DragEvent } from "react";

import { Button } from "@/components/ui/button";
import { DownloadIcon, ImportIcon } from "@/components/ui/icons";
import { Textarea } from "@/components/ui/input";
import { useRovingFocus } from "@/hooks/use-roving-focus";
import { cn } from "@/lib/utils/cn";
import { SLIDE } from "@/lib/motion";
import { CSV_TEMPLATE, parseRecipientsText, readRecipientsFile, type ParsedImport } from "@/lib/recipients";
import { downloadFile } from "@/lib/utils/download";

export type SourceTab = "file" | "paste";

const TABS: { id: SourceTab; label: string }[] = [
  { id: "file", label: "Upload CSV" },
  { id: "paste", label: "Paste" },
];

/** Step one of Import: a file (dropped or chosen) or pasted text, parsed and handed to `onParsed`. */
export function ImportSource({
  tab,
  onTab,
  text,
  onText,
  failed,
  onParsed,
}: {
  tab: SourceTab;
  onTab: (tab: SourceTab) => void;
  /** The paste box's text, kept by the dialog so going back from the preview doesn't lose it. */
  text: string;
  onText: (text: string) => void;
  /** The last attempt, when it couldn't be read. */
  failed?: ParsedImport | null;
  onParsed: (result: ParsedImport) => void;
}) {
  const id = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const roving = useRovingFocus({
    count: TABS.length,
    selected: TABS.findIndex((t) => t.id === tab),
    onSelect: (i) => onTab(TABS[i].id),
  });

  const readFile = (file: File) => readRecipientsFile(file).then(onParsed);
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation(); // the page-wide drop is off while this dialog is open, but be sure
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) readFile(file);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div
        role="tablist"
        aria-label="Import from"
        onKeyDown={roving.onKeyDown}
        className="mb-4 inline-flex h-9 items-center rounded-[10px] bg-surface-sunken p-0.5 text-sm font-medium ring-1 ring-border-subtle ring-inset [corner-shape:superellipse(1.5)]"
      >
        {TABS.map((t, i) => {
          const on = tab === t.id;
          return (
            <button
              key={t.id}
              {...roving.itemProps(i)}
              type="button"
              role="tab"
              id={`${id}-${t.id}`}
              aria-selected={on}
              aria-controls={`${id}-panel`}
              onClick={() => onTab(t.id)}
              className={cn(
                "relative flex h-8 items-center rounded-[8px] px-3.5 transition-colors duration-150 [corner-shape:superellipse(1.5)]",
                on ? "text-fg" : "text-fg-muted hover:text-fg",
              )}
            >
              {on && (
                <motion.span
                  layoutId="import-tab"
                  className="absolute inset-0 rounded-[8px] bg-(--color-200) [corner-shape:superellipse(1.5)]"
                  transition={SLIDE}
                />
              )}
              <span className="relative">{t.label}</span>
            </button>
          );
        })}
      </div>

      <div role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-${tab}`}>
        {tab === "file" ? (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={cn(
              // Children ignore the pointer, so dragging across the icon or text doesn't fire dragleave.
              "flex w-full flex-col items-center rounded-2xl border border-dashed px-6 py-8 text-center transition-colors duration-150 [&_*]:pointer-events-none",
              dragging ? "border-solid border-(--blue-9) bg-(--blue-3)" : "border-border hover:border-border-strong hover:bg-surface-hover",
            )}
          >
            <span className="grid size-10 place-items-center rounded-full bg-surface-muted text-fg-muted">
              <ImportIcon className="size-5" />
            </span>
            <span className="mt-3 text-sm font-medium">
              <span className="sm:hidden">Choose a CSV file</span>
              <span className="hidden sm:inline">Drop a CSV here, or click to choose</span>
            </span>
            <span className="mt-1 text-13 text-fg-subtle">Exported from Sheets, Excel or Notion</span>
          </button>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onParsed(parseRecipientsText(text));
            }}
          >
            <Textarea
              autoFocus
              value={text}
              onChange={(e) => onText(e.target.value)}
              placeholder={"Ada, ada@example.com, 0x1234…, 250\nGrace, 0xabcd…, 100"}
              className="min-h-40 font-mono text-13"
              spellCheck={false}
            />
            <Button type="submit" variant="inverse" className="mt-3 w-full" disabled={!text.trim()}>
              Preview
            </Button>
          </form>
        )}
      </div>

      {failed?.error && (
        <p role="alert" className="mt-3 rounded-xl bg-danger-soft px-3.5 py-2.5 text-13 text-danger-fg">
          {failed.fileName && <strong className="font-medium">{failed.fileName}: </strong>}
          {failed.error}
        </p>
      )}

      <button
        type="button"
        onClick={() => downloadFile("wage3-recipients.csv", CSV_TEMPLATE)}
        className="mt-4 inline-flex items-center gap-1.5 text-13 font-medium text-fg-muted hover:text-fg"
      >
        <DownloadIcon className="size-3.5" /> Download a template
      </button>
      <input
        ref={fileRef}
        type="file"
        accept=".csv,text/csv,text/plain,.tsv"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) readFile(f);
          e.target.value = ""; // so choosing the same file again still fires
        }}
      />
    </motion.div>
  );
}
