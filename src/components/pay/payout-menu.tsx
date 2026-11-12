"use client";

import { MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DropdownContent, DropdownItem, DropdownMenu, DropdownSeparator, DropdownTrigger } from "@/components/ui/dropdown";
import { CopyIcon, DownloadIcon, ListPlusIcon, RepeatIcon } from "@/components/ui/icons";
import type { Payout } from "@/lib/api/types";
import { downloadPayoutCsv } from "@/lib/export-payout";
import { pluralize } from "@/lib/utils/format";
import { copyText } from "@/lib/utils/clipboard";

async function copyLink() {
  if (await copyText(window.location.href)) toast.success("Link copied");
  else toast.error("Couldn't copy the link");
}

/** The payment's ⋯ menu. `payAgainInMenu` is false when the page header already shows Pay again. */
export function PayoutMenu({ payout, payAgainInMenu, onSaveAsList }: { payout: Payout; payAgainInMenu: boolean; onSaveAsList: () => void }) {
  const router = useRouter();
  return (
    <DropdownMenu>
      <DropdownTrigger asChild>
        <Button variant="outline" size="icon" aria-label="More actions">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownTrigger>
      <DropdownContent>
        <DropdownItem icon={<ListPlusIcon />} onSelect={onSaveAsList}>
          Save people as a list
        </DropdownItem>
        {payAgainInMenu && (
          <DropdownItem icon={<RepeatIcon />} onSelect={() => router.push(`/pay/new?from=${payout.id}`)}>
            Pay these people again
          </DropdownItem>
        )}
        <DropdownSeparator />
        {payout.status !== "draft" && (
          <DropdownItem
            icon={<DownloadIcon />}
            onSelect={() => {
              downloadPayoutCsv(payout);
              toast.success(`Exported ${pluralize(payout.items.length, "person", "people")}`);
            }}
          >
            Export CSV
          </DropdownItem>
        )}
        <DropdownItem icon={<CopyIcon />} onSelect={copyLink}>
          Copy link
        </DropdownItem>
      </DropdownContent>
    </DropdownMenu>
  );
}
