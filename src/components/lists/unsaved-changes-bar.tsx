"use client";

import { Button } from "@/components/ui/button";
import { FloatingToast } from "@/components/ui/floating-toast";
import { toastTone } from "@/components/ui/toast-tone";
import { cn } from "@/lib/utils/cn";

/** "Unsaved changes" with Discard and Save, floating at the bottom while there are edits. */
export function UnsavedChangesBar({
  show,
  error,
  saving,
  onDiscard,
  onSave,
}: {
  show: boolean;
  error: string | null;
  saving: boolean;
  onDiscard: () => void;
  onSave: () => void;
}) {
  return (
    <FloatingToast
      show={show}
      // Under the selection toast's layer, and lifted a toast-height while that one is up.
      containerClassName="z-30 transition-transform duration-200 ease-(--ease-out) [body:has([data-selection-toast])_&]:-translate-y-15"
      // 12px around the 10px-radius buttons, so a 22px corner keeps them concentric.
      className="h-15 rounded-[22px] py-3 pr-3 pl-4"
    >
      <div className="mr-auto min-w-0">
        <div className="truncate text-15 leading-5 font-medium">Unsaved changes</div>
        {/* Hidden on phones (an error still shows), so the title keeps to one line. */}
        <div
          role={error ? "alert" : undefined}
          className={cn("truncate text-13 leading-4", error ? toastTone.error : cn(toastTone.muted, "max-sm:hidden"))}
        >
          {error ?? "Leaving this page will lose them."}
        </div>
      </div>
      <button
        type="button"
        onClick={onDiscard}
        disabled={saving}
        className={cn("pressable h-9 shrink-0 rounded-[10px] px-2.5 text-14 font-semibold whitespace-nowrap disabled:opacity-45", toastTone.action)}
      >
        Discard
      </button>
      <Button onClick={onSave} loading={saving} className={cn("ml-1 h-9 rounded-[10px] px-3.5 text-14 font-semibold", toastTone.primary)}>
        {/* One span, so the button's flex gap doesn't split the words. */}
        <span>
          Save<span className="max-sm:hidden"> changes</span>
        </span>
      </Button>
    </FloatingToast>
  );
}
