"use client";

import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { RecipientsEditor } from "@/components/recipients/recipients-editor";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { DropdownContent, DropdownItem, DropdownMenu, DropdownTrigger } from "@/components/ui/dropdown";
import { DeleteIcon, SendIcon } from "@/components/ui/icons";
import { LogoField } from "@/components/ui/logo-field";
import { ReasonTooltip } from "@/components/ui/tooltip";
import { useDeleteList } from "@/lib/api/queries";
import type { ListDetail } from "@/lib/api/types";
import { LIMITS, USDC } from "@/lib/config";
import { formatCount, formatAmount, formatRelative, pluralize, sumAmounts } from "@/lib/utils/format";
import { useListLogo } from "@/lib/local-prefs";

import { ListName } from "./list-name";
import { UnsavedChangesBar } from "./unsaved-changes-bar";
import { useListDraft } from "./use-list-draft";

/** A saved list: its name, logo and people, edited in place and saved together. */
export function ListEditor({ list }: { list: ListDetail }) {
  const router = useRouter();
  const draft = useListDraft(list);
  const remove = useDeleteList();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [logo, setLogo] = useListLogo(list.id);

  // The saved figures, not the edits: they describe the list as it is.
  const count = list.recipients.length;
  const totalDefault = useMemo(() => sumAmounts(list.recipients.map((r) => r.default_amount)), [list.recipients]);

  const confirmDelete = () =>
    remove.mutate(list.id, {
      onSuccess: () => {
        toast.success(`Deleted “${list.name}”`);
        router.replace("/lists");
      },
    });

  return (
    <div className="pb-16">
      <header className="flex flex-col gap-4 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 flex-1">
          <ListName list={list} />
          <p className="mt-2.5 flex flex-wrap items-center gap-x-2 text-15 text-fg-muted">
            <span className="tabular">{pluralize(count, "person", "people")}</span>
            {totalDefault > BigInt(0) && (
              <>
                <span aria-hidden>·</span>
                <span className="tabular">
                  {formatAmount(totalDefault)} {USDC.symbol} by default
                </span>
              </>
            )}
            <span aria-hidden>·</span>
            <span>Updated {formatRelative(list.updated_at)}</span>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <PayListButton listId={list.id} blockedBy={draft.dirty ? "Save your changes first" : count === 0 ? "Add people to this list first" : null} />
          <DropdownMenu>
            <DropdownTrigger asChild>
              <Button variant="outline" size="icon" aria-label="More actions">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownTrigger>
            <DropdownContent>
              <DropdownItem tone="danger" icon={<DeleteIcon />} onSelect={() => setDeleteOpen(true)}>
                Delete list
              </DropdownItem>
            </DropdownContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Saved on this device until the API has a field for it, like the company logo in Settings. */}
      <div className="mb-8">
        <LogoField label="Logo (optional)" value={logo} onChange={setLogo} />
      </div>

      <RecipientsEditor rows={draft.rows} onChange={draft.setRows} mode="list" showAllErrors={draft.showAllErrors} />
      <p className="mt-3 text-13 text-fg-subtle">
        Amounts are optional defaults, prefilled when you pay this list. Up to {formatCount(LIMITS.listRecipients)} people
        per list; each wallet once.
      </p>

      <UnsavedChangesBar
        show={draft.dirty}
        error={draft.saveError}
        saving={draft.saving}
        onDiscard={draft.discard}
        onSave={draft.save}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Delete “${list.name}”?`}
        description="The list and its people are removed. Payments you already sent from it stay in your history."
        confirmLabel="Delete list"
        loading={remove.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

/** Starts a payment from the saved list. While it can't (`blockedBy`), the tooltip says why. */
function PayListButton({ listId, blockedBy }: { listId: string; blockedBy: string | null }) {
  if (blockedBy) {
    return (
      <ReasonTooltip reason={blockedBy}>
        <Button disabled>
          <SendIcon className="size-4" /> Pay this list
        </Button>
      </ReasonTooltip>
    );
  }
  return (
    <Button asChild>
      <Link href={`/pay/new?list=${listId}`}>
        <SendIcon className="size-4" /> Pay this list
      </Link>
    </Button>
  );
}
