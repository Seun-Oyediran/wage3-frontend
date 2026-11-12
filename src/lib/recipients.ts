import Papa from "papaparse";

import type { PayoutItem, PayoutItemInput, Recipient, RecipientInput } from "@/lib/api/types";

import { USDC } from "./config";
import { cleanWallet, parseAmount, toInputAmount, validateEmail, validateWallet } from "@/lib/utils/format";

/** One editable row. `amount` is what the user typed (display units), not base units. */
export type RecipientRow = {
  key: string;
  name: string;
  email: string;
  wallet: string;
  amount: string;
};

export type RowErrors = Partial<Record<"name" | "email" | "wallet" | "amount", string>>;

/** "list": amount is an optional default. "payout": amount is required. */
export type EditorMode = "list" | "payout";

let seq = 0;
export const newKey = () => `r${Date.now().toString(36)}${(seq++).toString(36)}`;

export const emptyRow = (): RecipientRow => ({ key: newKey(), name: "", email: "", wallet: "", amount: "" });

export const isBlankRow = (r: RecipientRow) => !r.name.trim() && !r.email.trim() && !r.wallet.trim() && !r.amount.trim();

export function validateRow(r: RecipientRow, mode: EditorMode): RowErrors {
  const errors: RowErrors = {};
  const wallet = validateWallet(r.wallet);
  if (wallet) errors.wallet = wallet;
  // Email is optional and doesn't affect the payment: a bad one is a warning in the editor
  // (see emailWarning) and is left out of what's sent, never a reason a row can't be paid.
  if (r.name.trim().length > 100) errors.name = "At most 100 characters";
  if (mode === "payout" || r.amount.trim()) {
    const amount = parseAmount(r.amount);
    if (!amount.ok) errors.amount = amount.error;
  }
  return errors;
}

/**
 * Errors keyed by row key. Blank rows are ignored (they're dropped on save).
 * A wallet twice is an error in a list (the backend rejects it) and a warning in a payout.
 */
export function validateRows(rows: RecipientRow[], mode: EditorMode) {
  const errors: Record<string, RowErrors> = {};
  const duplicates = new Set<string>();
  const seen = new Map<string, string>();

  for (const r of rows) {
    if (isBlankRow(r)) continue;
    const e = validateRow(r, mode);
    const w = r.wallet.trim().toLowerCase();
    if (!e.wallet && w) {
      if (seen.has(w)) {
        duplicates.add(r.key);
        duplicates.add(seen.get(w)!);
        if (mode === "list") e.wallet = "This wallet is already in the list";
      } else seen.set(w, r.key);
    }
    if (Object.keys(e).length) errors[r.key] = e;
  }

  const filled = rows.filter((r) => !isBlankRow(r));
  return {
    errors,
    duplicates,
    filledCount: filled.length,
    invalidCount: Object.keys(errors).length,
    isValid: filled.length > 0 && Object.keys(errors).length === 0,
  };
}

/** Sum of valid amounts, in base units. */
export function rowsTotal(rows: RecipientRow[]): bigint {
  return rows.reduce((acc, r) => {
    const a = parseAmount(r.amount);
    return a.ok ? acc + BigInt(a.value) : acc;
  }, BigInt(0));
}

const opt = (s: string) => (s.trim() ? s.trim() : null);

/** Optional email: kept only when it's a real address, so a typo never fails the request. */
const optEmail = (s: string) => (opt(s) && !validateEmail(s) ? s.trim() : null);

/** A typed email that isn't one. A warning only: emails are optional. */
export const emailWarning = (r: RecipientRow) => (r.email.trim() ? (validateEmail(r.email) ?? undefined) : undefined);

/** A wallet that's valid but probably a mistake in a payment. A warning only; it never blocks. */
export function walletWarning(r: RecipientRow, { duplicate, ownWallet }: { duplicate: boolean; ownWallet?: string }) {
  if (duplicate) return "Paid twice in this payment";
  if (ownWallet && r.wallet.trim().toLowerCase() === ownWallet) return "This is your connected wallet";
  return undefined;
}

// One cent in base units. Splits round down to it, so nobody gets a fraction of a cent.
const CENT = BigInt(10) ** BigInt(USDC.decimals - 2);

/** `total` (base units) split evenly between `count`, rounded down to the cent; `leftover` is what's unassigned. */
export function splitEvenly(total: bigint, count: number) {
  const n = BigInt(count);
  const each = (total / n / CENT) * CENT;
  return { each, leftover: total - each * n };
}

export function rowsToRecipientInputs(rows: RecipientRow[]): RecipientInput[] {
  return rows.filter((r) => !isBlankRow(r)).map((r) => {
    const a = r.amount.trim() ? parseAmount(r.amount) : null;
    return {
      name: opt(r.name),
      email: optEmail(r.email),
      wallet_address: r.wallet.trim(),
      default_amount: a && a.ok ? a.value : null,
    };
  });
}

export function rowsToPayoutItems(rows: RecipientRow[]): PayoutItemInput[] {
  return rows.filter((r) => !isBlankRow(r)).map((r) => {
    const a = parseAmount(r.amount);
    return {
      name: opt(r.name),
      email: optEmail(r.email),
      wallet_address: r.wallet.trim(),
      amount: a.ok ? a.value : "0",
    };
  });
}

export function rowsFromRecipients(recipients: Recipient[]): RecipientRow[] {
  return recipients.map((r) => ({
    key: r.id,
    name: r.name ?? "",
    email: r.email ?? "",
    wallet: r.wallet_address,
    amount: toInputAmount(r.default_amount),
  }));
}

export function rowsFromPayoutItems(items: Pick<PayoutItem, "name" | "email" | "wallet_address" | "amount">[]): RecipientRow[] {
  return items.map((i) => ({
    key: newKey(),
    name: i.name ?? "",
    email: i.email ?? "",
    wallet: i.wallet_address,
    amount: toInputAmount(i.amount),
  }));
}

// ---- CSV / paste import ----

const HEADER_ALIASES: Record<keyof Omit<RecipientRow, "key">, string[]> = {
  name: ["name", "full name", "full_name", "recipient", "contributor"],
  email: ["email", "e-mail", "email address", "mail"],
  wallet: ["wallet", "wallet address", "wallet_address", "address", "evm_address", "evm address", "recipient address", "to"],
  amount: ["amount", "usdc", "amount (usdc)", "value", "pay", "salary", "default_amount"],
};

function matchHeader(cell: string) {
  const c = cell.trim().toLowerCase();
  return (Object.keys(HEADER_ALIASES) as (keyof typeof HEADER_ALIASES)[]).find((k) =>
    HEADER_ALIASES[k].includes(c),
  );
}

const looksLikeAddress = (s: string) => /^0x[0-9a-fA-F]{6,}/.test(s.trim());
const looksLikeAmount = (s: string) => /^[\d,]*\.?\d+$/.test(s.trim().replace(/^\$/, ""));
const looksLikeEmail = (s: string) => /@/.test(s);

export type ImportResult = { rows: RecipientRow[]; skipped: number; error?: string };

/**
 * Accepts CSV (with or without a header) or tab-separated text pasted from a spreadsheet.
 * Without a header, columns are guessed per cell: 0x… = wallet, @ = email, number = amount, else name.
 */
export function parseRecipientsText(text: string): ImportResult {
  const parsed = Papa.parse<string[]>(text.trim(), { skipEmptyLines: "greedy" });
  const data = parsed.data.filter((r) => r.some((c) => c?.trim()));
  if (!data.length) return { rows: [], skipped: 0, error: "That file looks empty." };

  const header = data[0].map(matchHeader);
  const hasHeader = header.filter(Boolean).length >= 1 && header.includes("wallet");
  const body = hasHeader ? data.slice(1) : data;

  let skipped = 0;
  const rows: RecipientRow[] = [];

  for (const cells of body) {
    const row = emptyRow();
    if (hasHeader) {
      header.forEach((field, i) => {
        if (field && cells[i] !== undefined) row[field] = cells[i].trim();
      });
    } else {
      for (const raw of cells) {
        const cell = raw?.trim() ?? "";
        if (!cell) continue;
        if (!row.wallet && looksLikeAddress(cell)) row.wallet = cell;
        else if (!row.email && looksLikeEmail(cell)) row.email = cell;
        else if (!row.amount && looksLikeAmount(cell)) row.amount = cell.replace(/^\$/, "");
        else if (!row.name) row.name = cell;
      }
    }
    row.amount = row.amount.replace(/^\$/, "").replace(/,/g, "");
    row.wallet = cleanWallet(row.wallet);
    if (isBlankRow(row)) {
      skipped++;
      continue;
    }
    rows.push(row);
  }

  if (!rows.length) {
    return { rows, skipped, error: "We couldn't find any wallet addresses in that file." };
  }
  return { rows, skipped };
}

export const CSV_TEMPLATE = "name,email,wallet,amount\nAda Lovelace,ada@example.com,0x1111111111111111111111111111111111111111,250\n";

const MAX_FILE_BYTES = 2 * 1024 * 1024;

/** A parsed import, with the file it came from (none for pasted text). */
export type ParsedImport = ImportResult & { fileName?: string };

/** Reads and parses a CSV/TSV/text file of recipients. Never rejects: problems come back as `error`. */
export function readRecipientsFile(file: File): Promise<ParsedImport> {
  const failed = (error: string): ParsedImport => ({ rows: [], skipped: 0, error, fileName: file.name });
  if (file.size > MAX_FILE_BYTES) return Promise.resolve(failed("That file is over 2 MB. Is it the right one?"));
  return file
    .text()
    .then((text) => ({ ...parseRecipientsText(text), fileName: file.name }))
    .catch(() => failed("We couldn't read that file."));
}

/** Why an imported row might not be wanted. `block` rows start unticked. `wallet`: the wallet itself is bad. */
export type ImportIssue = { label: string; block: boolean; wallet?: boolean };

/**
 * What's wrong with each imported row, if anything, one issue per row. A bad wallet wins, since
 * "Repeated in this file" on junk would hide what to fix. Repeats block in a list (the backend
 * rejects them) but only warn in a payment.
 */
export function importIssues(rows: RecipientRow[], mode: EditorMode, existingWallets: Set<string>) {
  const issues = new Map<string, ImportIssue>();
  const seen = new Set<string>();
  for (const r of rows) {
    const w = r.wallet.trim().toLowerCase();
    const errors = validateRow(r, mode);
    const first = errors.wallet ?? errors.amount ?? errors.email ?? errors.name;
    if (errors.wallet && w) {
      issues.set(r.key, { label: errors.wallet, block: false, wallet: true });
    } else if (w && existingWallets.has(w)) {
      issues.set(r.key, { label: mode === "list" ? "Already in this list" : "Already in this payment", block: mode === "list" });
    } else if (w && seen.has(w)) {
      issues.set(r.key, { label: "Repeated in this file", block: mode === "list" });
    } else if (first) {
      issues.set(r.key, { label: first, block: false });
    }
    if (w) seen.add(w);
  }
  return issues;
}
