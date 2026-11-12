"use client";

import { AnimatePresence } from "motion/react";
import { useState } from "react";

import { Dialog } from "@/components/ui/dialog";
import type { EditorMode, ParsedImport, RecipientRow } from "@/lib/recipients";

import { ImportPreview } from "./import-preview";
import { ImportSource, type SourceTab } from "./import-source";

/** Import people from a CSV or pasted text: pick a source, then choose who to add. */
export function ImportDialog({
  open,
  onOpenChange,
  onImport,
  hasRows,
  mode,
  existingWallets,
  room,
  dropped,
  onClearDropped,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onImport: (rows: RecipientRow[], replace: boolean) => void;
  hasRows: boolean;
  mode: EditorMode;
  /** Lowercased wallets already in the editor, to flag repeats. */
  existingWallets: Set<string>;
  /** How many more people fit (backend limit minus current). */
  room: number;
  /** A file dropped on the page, already parsed: opens straight into its preview. */
  dropped?: ParsedImport | null;
  onClearDropped?: () => void;
}) {
  const [tab, setTab] = useState<SourceTab>("file");
  const [text, setText] = useState("");
  const [picked, setPicked] = useState<ParsedImport | null>(null);
  const result = picked ?? dropped ?? null;
  const setResult = (r: ParsedImport | null) => {
    setPicked(r);
    if (dropped) onClearDropped?.();
  };

  const close = (o: boolean) => {
    if (!o) {
      setResult(null);
      setText("");
    }
    onOpenChange(o);
  };

  const preview = result && !result.error && result.rows.length > 0 ? result : null;

  return (
    <Dialog
      open={open}
      onOpenChange={close}
      title={preview ? "Choose who to add" : "Import people"}
      description={
        preview
          ? "Untick anyone you don't want. They're added to the bottom of the list, and you can still edit them after."
          : "Columns: name, email, wallet, amount. Only wallet is required."
      }
      className={preview ? "sm:max-w-3xl" : "sm:max-w-lg"}
    >
      <AnimatePresence mode="wait" initial={false}>
        {preview ? (
          <ImportPreview
            key={preview.rows[0].key}
            result={preview}
            mode={mode}
            existingWallets={existingWallets}
            room={room}
            hasRows={hasRows}
            // Back keeps the tab and any pasted text, so it can be fixed rather than retyped.
            onBack={() => setResult(null)}
            onConfirm={(rows, replace) => {
              onImport(rows, replace);
              close(false);
            }}
          />
        ) : (
          <ImportSource key="source" tab={tab} onTab={setTab} text={text} onText={setText} failed={result} onParsed={setResult} />
        )}
      </AnimatePresence>
    </Dialog>
  );
}
