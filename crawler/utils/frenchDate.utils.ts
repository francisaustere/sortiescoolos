import { parisLocalToIso } from "./date.utils";

const MONTHS: [RegExp, number][] = [
  [/^jan/i, 1], [/^f[ée]v|^feb/i, 2], [/^mar/i, 3], [/^avr|^apr/i, 4], [/^mai|^may/i, 5], [/^juin|^jun/i, 6],
  [/^juil|^jul/i, 7], [/^ao[uû]|^aug/i, 8], [/^sep/i, 9], [/^oct/i, 10], [/^nov/i, 11], [/^d[ée]c|^dec/i, 12],
];
const HALF_YEAR_IN_MONTHS = 6;

export function monthFromName(name: string): number | null {
  const clean = name.trim().replace(/\.$/, "");
  return MONTHS.find(([pattern]) => pattern.test(clean))?.[1] ?? null;
}

/** Year of a day/month without year: the next occurrence, tolerating events up to ~6 months in the past. */
export function inferYear(month: number, now = new Date()): number {
  const currentMonth = now.getUTCMonth() + 1;
  const year = now.getUTCFullYear();
  if (month < currentMonth && currentMonth - month > HALF_YEAR_IN_MONTHS) return year + 1;
  return year;
}

/** Parses "20:00", "20h", "20h30", "20 h 30". */
export function parseTime(text: string): { hour: number; minute: number } | null {
  const match = /(\d{1,2})\s*(?:h|:)\s*(\d{2})?/i.exec(text);
  if (!match) return null;
  const hour = Number(match[1]);
  if (hour > 23) return null;
  return { hour, minute: Number(match[2] ?? 0) };
}

/**
 * Builds an event start from loose parts. Returns "YYYY-MM-DD" when no time is known (all-day),
 * a UTC ISO string otherwise.
 */
export function buildStart(day: number, monthName: string, yearText?: string, timeText?: string, now = new Date()): string | null {
  const month = monthFromName(monthName);
  if (!month || day < 1 || day > 31) return null;
  const year = yearText && /^\d{4}$/.test(yearText.trim()) ? Number(yearText) : inferYear(month, now);
  const time = timeText ? parseTime(timeText) : null;
  if (!time) return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return parisLocalToIso(year, month, day, time.hour, time.minute);
}
