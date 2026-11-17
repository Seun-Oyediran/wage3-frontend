import { daysAgo } from "@/lib/utils/format";

/** The rolling periods offered wherever payments are filtered by time, each counting today. */
export const PERIODS = [
  { days: 7, short: "7D", name: "Last 7 days" },
  { days: 30, short: "30D", name: "Last 30 days" },
  { days: 90, short: "90D", name: "Last 90 days" },
] as const;

/** The API `from` date that starts a period: "Last 30 days" is from 29 days ago, through today. */
export function periodStart(days: number) {
  return daysAgo(days - 1);
}
