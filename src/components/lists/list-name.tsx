"use client";

import { toast } from "sonner";

import { EditableTitle } from "@/components/ui/editable-title";
import { useRenameList } from "@/lib/api/queries";
import type { ListDetail } from "@/lib/api/types";

import { useFreshList } from "./use-create-list";

/** First input of the recipients editor (the first row's name), once it's on screen. */
function focusFirstRecipient() {
  requestAnimationFrame(() => document.querySelector<HTMLInputElement>("[data-row] input:not([type=checkbox])")?.focus());
}

/**
 * The list's name as the page title. A list just made with "New list" opens with its default
 * name selected, so typing replaces it, and Enter carries on into adding people.
 */
export function ListName({ list }: { list: ListDetail }) {
  const rename = useRenameList(list.id, { meta: { errorToast: false } });
  const { isFresh, consume } = useFreshList(list.id);
  return (
    <EditableTitle
      // Optimistic: the new name shows while the request is in flight.
      value={rename.isPending && rename.variables ? rename.variables : list.name}
      label="List name"
      startEditing={isFresh}
      onStarted={consume}
      onEnter={focusFirstRecipient}
      onRename={(name) =>
        rename.mutate(name, {
          onSuccess: () => toast.success("List renamed"),
          onError: (err) => toast.error(err.message),
        })
      }
    />
  );
}
