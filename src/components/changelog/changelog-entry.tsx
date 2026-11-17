import { REPO_URL, type ChangelogEntry as Entry } from "@/content/changelog";
import { cn } from "@/lib/utils/cn";
import { formatDate } from "@/lib/utils/format";
import { DISPLAY_TEXT } from "@/lib/type";

import { CopyLink } from "./copy-link";
import { Signature } from "./signature";
import { SignatureFade } from "./signature-fade";

/**
 * One release, under a hairline, in two columns: title and authors on the left (sticky beside a
 * long entry, with the signatures at the foot), and on the right the date and Copy link, a media
 * card and the text. One column on phones.
 */
export function ChangelogEntry({ entry }: { entry: Entry }) {
  return (
    <li id={entry.slug} className="scroll-mt-8 border-t border-hairline pt-10 pb-16">
      <div className="grid gap-x-20 gap-y-8 md:grid-cols-2">
        <div className="flex flex-col">
          {/* Pushed down by the date row (32px + 12px), so the title tops out level with the media card. */}
          <div data-entry-head className="md:sticky md:top-8 md:pt-11">
            <h2 className={cn(DISPLAY_TEXT, "text-24 leading-8 font-[450] tracking-[-0.01em] text-balance")}>{entry.title}</h2>
            <Authors entry={entry} />
          </div>
          {/* Desktop: blurs away as it scrolls up into the sticky title and authors. */}
          <SignatureFade className="hidden pt-10 md:mt-auto md:block">
            <Signatures entry={entry} className="flex" />
          </SignatureFade>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-13 text-fg-muted">
              <time dateTime={entry.date} className="tabular">
                {formatDate(entry.date, { month: "long" })}
              </time>
              {entry.prs?.map((n) => (
                <a
                  key={n}
                  href={`${REPO_URL}/pull/${n}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-fg-subtle tabular transition-colors duration-150 hover:text-fg"
                >
                  #{n}
                </a>
              ))}
            </div>
            <CopyLink slug={entry.slug} />
          </div>
          <MediaCard entry={entry} />
          <div className="mt-10 flex flex-col gap-6">
            {entry.body.map((p) => (
              <p key={p} className="text-14 leading-5 font-normal tracking-[-0.0046em] text-fg-muted text-pretty">
                {p}
              </p>
            ))}
          </div>
          <Signatures entry={entry} className="mt-8 flex md:hidden" />
        </div>
      </div>
    </li>
  );
}

function Authors({ entry }: { entry: Entry }) {
  return (
    <ul className="mt-7 flex flex-col gap-1">
      {entry.authors.map((a) => (
        <li key={a.github}>
          {/* Pulled 8px left so the avatar stays on the column edge while the hover fill has room. */}
          <a
            href={`https://github.com/${a.github}`}
            target="_blank"
            rel="noreferrer"
            className="-ml-2 flex w-fit items-center gap-2.5 rounded-xl py-1 pr-3 pl-2 transition-colors duration-150 hover:bg-surface-hover"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- a 32px avatar */}
            <img
              src={a.avatar ?? `https://github.com/${a.github}.png?size=64`}
              alt=""
              width={32}
              height={32}
              className="size-8 rounded-full bg-(--color-400) object-cover shadow-[0_0_0_1px_oklch(0_0_0/0.06)]"
            />
            <div className="text-13 leading-5">
              <div className="font-medium">{a.name}</div>
              <div className="text-fg-muted">{a.role}</div>
            </div>
          </a>
        </li>
      ))}
    </ul>
  );
}

/** The release's image when there is one, otherwise its title on grey. */
function MediaCard({ entry }: { entry: Entry }) {
  return (
    <div className="relative aspect-[560/292] overflow-hidden rounded-2xl border border-hairline bg-(--color-25) [corner-shape:superellipse(1.5)]">
      {entry.media ? (
        // eslint-disable-next-line @next/next/no-img-element -- release art, sized by the card
        <img src={entry.media.src} alt={entry.media.alt} className="absolute inset-0 size-full object-cover" />
      ) : (
        <span
          className={cn(
            DISPLAY_TEXT,
            "absolute bottom-6 left-6 text-20 font-medium tracking-[-0.015em] text-fg/80 sm:bottom-8 sm:left-10 sm:text-24",
          )}
        >
          {entry.title}
        </span>
      )}
    </div>
  );
}

/** The authors' signatures, drawn on as they scroll in. */
function Signatures({ entry, className }: { entry: Entry; className?: string }) {
  if (!entry.authors.some((a) => a.signature)) return null;
  return (
    <div className={cn("gap-6", className)}>
      {entry.authors.map((a) => a.signature && <Signature key={a.github} signature={a.signature} label={`Signed by ${a.name}`} />)}
    </div>
  );
}
