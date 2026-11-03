const TIME_ZONE = "Europe/Paris";
const DAY_IN_MS = 24 * 60 * 60 * 1000;

const dayKeyFormat = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" });
const dayLabelFormat = new Intl.DateTimeFormat("fr-FR", { timeZone: TIME_ZONE, weekday: "long", day: "numeric", month: "long" });
const timeFormat = new Intl.DateTimeFormat("fr-FR", { timeZone: TIME_ZONE, hour: "2-digit", minute: "2-digit" });
const stampFormat = new Intl.DateTimeFormat("fr-FR", { timeZone: TIME_ZONE, weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });

/** "YYYY-MM-DD" of an instant, in Paris time. All-day dates are already day keys. */
export function dayKey(iso: string): string {
  return /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso : dayKeyFormat.format(new Date(iso));
}

export function formatDayLabel(key: string): string {
  return dayLabelFormat.format(new Date(`${key}T12:00:00Z`));
}

export function formatTime(iso: string): string {
  return timeFormat.format(new Date(iso));
}

export function formatStamp(iso: string): string {
  return stampFormat.format(new Date(iso));
}

/** Day keys bounding a period, inclusive. Weeks run Monday to Sunday. */
export function periodRange(period: "week" | "weekend" | "next" | "all", today = new Date()): [string, string] | null {
  if (period === "all") return null;
  const todayKey = dayKey(today.toISOString());
  const base = new Date(`${todayKey}T12:00:00Z`);
  const weekday = (base.getUTCDay() + 6) % 7; // Monday = 0
  const shift = (days: number): string => new Date(base.getTime() + days * DAY_IN_MS).toISOString().slice(0, 10);
  if (period === "week") return [todayKey, shift(6 - weekday)];
  if (period === "weekend") return [weekday >= 4 ? todayKey : shift(4 - weekday), shift(6 - weekday)];
  return [shift(7 - weekday), shift(13 - weekday)];
}
