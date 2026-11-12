<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project rules

### Structure
- Route files in `src/app/` stay thin: params, data hooks, layout. Page UI lives in `src/components/<feature>/`.
- Small generic helpers go in `src/lib/utils/<topic>.ts` (format, display, clipboard, download, periods, cn). Never flat in `lib/`, never one catch-all utils file. Domain logic gets its own module (`lib/recipients.ts`, `lib/send-payout.ts`).
- App-wide hooks go in `src/hooks/`; hooks used by one feature sit next to it (`components/pay/use-payout-draft.ts`).
- Before writing a helper or component, search for an existing one. Check `components/ui/` first (Section, Pagination, SearchField, ActionBanner, FloatingToast, Skeleton, EmptyState/ErrorState, ReasonTooltip, CopyButton, Kbd/ModKey) and `lib/utils/format.ts` (formatDate, formatCount, pluralize, daysAgo).

### React
- Effects are only for syncing with something outside React (DOM APIs, subscriptions, timers). If you're not sure, read https://react.dev/learn/you-might-not-need-an-effect. In practice:
  - Derive values during render instead of mirroring them in state.
  - Reset state with a `key`, or by setting state during render, not in an effect.
  - Put logic caused by a user action in the event handler.
  - Use `useEffectEvent` to read the latest props or state inside an effect without re-running it.
  - Use `useSyncExternalStore` for browser state (localStorage, matchMedia), as in `lib/local-prefs.ts`.
- Every timer, interval, listener and observer is cleaned up, and stops when it's no longer needed (countdowns end at 0).
- Side effects that outlive the user's intent get cancelled: a pending redirect is dropped if the user navigates away.
- No `!` non-null assertions; narrow the type instead.
- `useSearchParams` sits under a `<Suspense>` boundary.

### Data
- All requests go through `lib/api/endpoints.ts` and the hooks in `lib/api/queries.ts`. No axios or fetch in components.
- Query keys come from `qk`; no hand-written key arrays.
- Mutations write the response into the cache with `setQueryData` and invalidate whatever lists depend on it.
- Mutation errors toast by default. Pass `meta: { errorToast: false }` when the error is shown inline.
- Query errors render `ErrorState` with a retry.
- Failures are never swallowed silently: clipboard, download and storage failures tell the user.

### Styling
- Font sizes use the size-only tokens `text-11` … `text-40`. Don't add `text-sm`/`text-xs` in new code; they also set line-height. Never bundle size with line-height or tracking in one token.
- Adding a font size means adding it in two places: `globals.css` and `FONT_SIZES` in `lib/utils/cn.ts`. Otherwise tailwind-merge drops the class.
- Colours come from theme tokens (`bg-bg`, `bg-surface-sunken`, `text-fg-muted`, `border-border`, `border-hairline`). No raw hex or palette greys in components.
- The main create action is the default blue `Button` at `h-10 px-4`. "New payment" is always `NewPaymentButton`.
- Card headings use `CardTitle` and `CardDescription`.
- Icons come from `components/ui/icons.tsx` (24 grid, 2px stroke, `currentColor`). Use lucide only when there's no custom icon, and flag it.
- Motion uses `lib/motion.ts` (`EASE_OUT`, `riseIn`) and respects reduced motion.

### UX
- A disabled control says why (`ReasonTooltip`). Never a dead button with no explanation.
- Keyboard hints use `ModKey`: ⌘ on Apple devices, Ctrl elsewhere.
- Pasted or imported input goes through the same validation and limits as typed input.
- User-provided text (names, labels) truncates wherever space is fixed, toasts included.
- Validation rules like the email regex are defined once and imported.

### Comments
- Comments explain why, briefly. No design history ("changed from X after Y"), and no restating what the code says.

### Workflow
- Don't run `next build` while the dev server is running; it breaks the dev server's CSS. Check work with `npx tsc --noEmit` and `npx eslint <paths>`.
- There's no Prettier config. Don't reformat code you aren't changing.
- For refactors that span files, propose the plan first.
