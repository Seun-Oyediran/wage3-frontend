import { ActionBanner } from "@/components/ui/action-banner";
import { Button } from "@/components/ui/button";
import { pluralize } from "@/lib/utils/format";

/** Above the table, in red because it blocks sending: how many rows, and the two ways out. */
export function BlockedRowsBanner({
  count,
  showingOnly,
  onToggleShow,
  onRemove,
}: {
  count: number;
  showingOnly: boolean;
  onToggleShow: () => void;
  onRemove: () => void;
}) {
  const them = count === 1 ? "it" : "them";
  return (
    <ActionBanner
      tone="danger"
      className="mb-4"
      title={`${pluralize(count, "row")} can't be paid.`}
      actions={
        <>
          <Button
            size="sm"
            variant="ghost"
            aria-pressed={showingOnly}
            className="text-(--red-12) hover:bg-(--red-4) hover:text-(--red-12)"
            onClick={onToggleShow}
          >
            {showingOnly ? "Show all" : `Show ${them}`}
          </Button>
          <Button size="sm" className="bg-(--red-11) text-white hover:bg-(--red-12)" onClick={onRemove}>
            Remove {them}
          </Button>
        </>
      }
    >
      Fix or remove {them} to send.
    </ActionBanner>
  );
}
