import type { ListDetail, Payout } from "@/lib/api/types";
import { formatDate, pluralize } from "@/lib/utils/format";
import { emptyRow, rowsFromPayoutItems, rowsFromRecipients, type RecipientRow } from "@/lib/recipients";

export type StartingPoint = {
  rows: RecipientRow[];
  name: string;
  /** The page's subtitle, saying where the rows came from. */
  origin: string | null;
  listId: string | null;
};

/**
 * What a new payment is filled with: a saved list, a past payment (all of it, or only the
 * people who weren't paid), or one empty row.
 */
export function startingPoint({
  list,
  payout,
  unpaidOnly,
}: {
  list?: ListDetail;
  payout?: Payout;
  unpaidOnly: boolean;
}): StartingPoint {
  if (list) {
    const rows = rowsFromRecipients(list.recipients);
    return {
      rows: rows.length ? rows : [emptyRow()],
      name: `${list.name} · ${formatDate(new Date())}`,
      origin: `From your list “${list.name}”`,
      listId: list.id,
    };
  }
  if (payout && unpaidOnly) {
    // Retrying a partly paid payment: only the people who weren't paid, so nobody is paid twice.
    const unpaid = payout.items.filter((i) => i.status !== "paid");
    return {
      rows: unpaid.length ? rowsFromPayoutItems(unpaid) : [emptyRow()],
      name: `${payout.name} (remaining)`,
      origin: `The ${pluralize(unpaid.length, "person", "people")} from “${payout.name}” who weren't paid`,
      listId: null,
    };
  }
  if (payout) {
    return {
      rows: rowsFromPayoutItems(payout.items),
      name: `${payout.name} (again)`,
      origin: `Copied from “${payout.name}”`,
      listId: null,
    };
  }
  return { rows: [emptyRow()], name: "", origin: null, listId: null };
}
