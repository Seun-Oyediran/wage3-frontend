import { chain } from "@/lib/config";

/** The network payments go out on: Base's blue square and its name. */
export function NetworkBadge() {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span aria-hidden className="size-2.5 rounded-[3px] bg-base-blue" />
      {chain.name}
    </span>
  );
}
