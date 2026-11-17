import { cn } from "@/lib/utils/cn";

/** The Base-style blue square plus wordmark. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("inline-block size-5 shrink-0 rounded-[5px] bg-base-blue", className)}
    />
  );
}

/** The wordmark, in Bricolage Grotesque, after the blue mark. `mark={false}`: wordmark only, as in the app sidebar. */
export function Logo({ className, mark = true }: { className?: string; mark?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      {mark && <LogoMark />}
      <span className="font-[family-name:var(--font-bricolage)] text-17 font-semibold tracking-[-0.03em]">wage3</span>
    </span>
  );
}
