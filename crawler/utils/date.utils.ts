const PARIS_TZ = "Europe/Paris";
const MINUTE_IN_MS = 60_000;

/** Offset in minutes of Europe/Paris from UTC at a given instant (60 or 120). */
function parisOffsetMinutes(utcMs: number): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: PARIS_TZ,
    hourCycle: "h23",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
  }).formatToParts(new Date(utcMs));
  const get = (type: string): number => Number(parts.find((p) => p.type === type)?.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"));
  return Math.round((asUtc - utcMs) / MINUTE_IN_MS);
}

/** Converts a wall-clock time in Paris to a UTC ISO string. */
export function parisLocalToIso(year: number, month: number, day: number, hour = 0, minute = 0): string {
  const naiveUtc = Date.UTC(year, month - 1, day, hour, minute);
  // Two passes handle DST transitions correctly enough for event times
  let offset = parisOffsetMinutes(naiveUtc);
  offset = parisOffsetMinutes(naiveUtc - offset * MINUTE_IN_MS);
  return new Date(naiveUtc - offset * MINUTE_IN_MS).toISOString();
}

/** True when an ISO string carries no time part (e.g. "2026-11-12"). */
export function isDateOnly(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value.trim());
}

/**
 * Normalises any ISO-like date to a UTC ISO string.
 * Strings without offset are read as Paris local time.
 */
export function toUtcIso(value: string): string | null {
  const trimmed = value.trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?)?(Z|[+-]\d{2}:?\d{2})?$/.exec(trimmed);
  if (!match) {
    const parsed = Date.parse(trimmed);
    return Number.isNaN(parsed) ? null : new Date(parsed).toISOString();
  }
  const [, y, mo, d, h, mi, zone] = match;
  if (zone) {
    const parsed = Date.parse(trimmed.replace(" ", "T"));
    return Number.isNaN(parsed) ? null : new Date(parsed).toISOString();
  }
  return parisLocalToIso(Number(y), Number(mo), Number(d), Number(h ?? 0), Number(mi ?? 0));
}
