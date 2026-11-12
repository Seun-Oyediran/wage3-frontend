"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar, CalendarFooter, formatYmd, type YmdRange } from "@/components/ui/date-picker";
import {
  DropdownContent,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
  DropdownRadioGroup,
  DropdownRadioItem,
  DropdownSeparator,
  DropdownSub,
  DropdownSubContent,
  DropdownSubTrigger,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import { ChevronRightIcon, FiltersIcon } from "@/components/ui/icons";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils/cn";
import { PERIODS, periodStart } from "@/lib/utils/periods";

/** The shared periods as menu choices; the radio value is the day count ("30"). */
const TIME_PRESETS = PERIODS.map((p) => ({ id: String(p.days), label: p.name, days: p.days }));

/** Which preset a from/to pair is, if any: a preset is a start date with no end. */
function presetFor(from: string, to: string) {
  if (!from || to) return null;
  return TIME_PRESETS.find((p) => from === periodStart(p.days)) ?? null;
}

/** "3 Mar", without the year, so a range fits the menu's hint column. */
const shortDate = (ymd: string) => formatYmd(ymd).replace(/ \d{4}$/, "");

/**
 * List and Time filters behind one button, each in its own submenu. The button counts the
 * active ones. Reset clears both; search and status have their own controls.
 */
export function FiltersMenu({
  lists,
  listId,
  from,
  to,
  onList,
  onTime,
  onReset,
}: {
  lists: { id: string; name: string }[];
  listId: string;
  from: string;
  to: string;
  onList: (id: string) => void;
  onTime: (range: YmdRange) => void;
  onReset: () => void;
}) {
  const preset = presetFor(from, to);
  const hasTime = !!(from || to);
  const time = hasTime && !preset ? "custom" : (preset?.id ?? "all");
  // Open when a custom range is already set, so it's visible where it lives.
  const [customOpen, setCustomOpen] = useState(time === "custom");
  const active = (listId ? 1 : 0) + (hasTime ? 1 : 0);

  const rangeName = hasTime ? `${from ? shortDate(from) : "…"} – ${to ? shortDate(to) : "…"}` : "";
  const list = listId ? lists.find((l) => l.id === listId) : undefined;
  const listName = !listId ? "All lists" : (list?.name ?? "Deleted list");
  const timeName = time === "custom" ? rangeName : (preset?.label ?? "All time");

  const onTimeValue = (v: string) => {
    const p = TIME_PRESETS.find((x) => x.id === v);
    onTime(p ? { from: periodStart(p.days), to: "" } : { from: "", to: "" });
  };

  return (
    <DropdownMenu>
      <Tooltip content="Filters">
        <DropdownTrigger asChild>
          <Button
            variant="outline"
            aria-label={active ? `Filters, ${active} active` : "Filters"}
            className={cn("h-10 shrink-0 gap-1.5 rounded-full", active > 0 ? "px-3" : "w-10 p-0")}
          >
            <FiltersIcon className="size-4" />
            {active > 0 && (
              <span className="grid h-[18px] min-w-[18px] place-items-center rounded-full bg-inverse px-1 text-11 font-medium text-inverse-fg tabular">
                {active}
              </span>
            )}
          </Button>
        </DropdownTrigger>
      </Tooltip>
      <DropdownContent className="w-64">
        <DropdownLabel
          action={
            active > 0 && (
              <button type="button" onClick={onReset}>
                Reset
              </button>
            )
          }
        >
          Filters
        </DropdownLabel>

        <DropdownSub>
          <DropdownSubTrigger hint={listName}>List</DropdownSubTrigger>
          <DropdownSubContent className="max-h-80 w-56 overflow-y-auto">
            <DropdownRadioGroup value={listId} onValueChange={onList}>
              <DropdownRadioItem value="">All lists</DropdownRadioItem>
              {lists.map((l) => (
                <DropdownRadioItem key={l.id} value={l.id}>
                  {l.name}
                </DropdownRadioItem>
              ))}
              {/* A link can name a list that's since been deleted; keep it selectable so it shows as chosen. */}
              {listId && !list && <DropdownRadioItem value={listId}>Deleted list</DropdownRadioItem>}
            </DropdownRadioGroup>
          </DropdownSubContent>
        </DropdownSub>

        <DropdownSub>
          <DropdownSubTrigger hint={timeName}>Time</DropdownSubTrigger>
          <DropdownSubContent className={customOpen ? "w-[266px]" : "w-56"}>
            <DropdownRadioGroup value={time} onValueChange={onTimeValue}>
              <DropdownRadioItem value="all">All time</DropdownRadioItem>
              {TIME_PRESETS.map((p) => (
                <DropdownRadioItem key={p.id} value={p.id}>
                  {p.label}
                </DropdownRadioItem>
              ))}
            </DropdownRadioGroup>
            <DropdownSeparator />
            {/* The calendar expands in place rather than in a third flyout, which could open far from the click. */}
            <DropdownItem
              onSelect={(e) => {
                e.preventDefault();
                setCustomOpen((o) => !o);
              }}
              aria-expanded={customOpen}
            >
              <span className="flex-1">Custom range</span>
              {time === "custom" && <span className="text-13 text-fg-subtle">{rangeName}</span>}
              <ChevronRightIcon className={cn("size-4 text-fg-subtle transition-transform duration-150", customOpen && "rotate-90")} />
            </DropdownItem>
            {customOpen && (
              <div className="w-[256px] px-px">
                <Calendar mode="range" value={time === "custom" ? { from, to } : { from: "", to: "" }} onSelect={onTime} />
                <CalendarFooter>
                  <span className="text-fg-subtle">{to ? "Range set" : from ? "Now pick an end date" : "Pick a start date"}</span>
                  <button
                    type="button"
                    disabled={!hasTime}
                    onClick={() => onTime({ from: "", to: "" })}
                    className="text-fg-subtle hover:text-fg disabled:opacity-35"
                  >
                    Clear
                  </button>
                </CalendarFooter>
              </div>
            )}
          </DropdownSubContent>
        </DropdownSub>
      </DropdownContent>
    </DropdownMenu>
  );
}
