import type { RawEvent } from "@shared/event";
import { buildStart, monthFromName } from "../utils/frenchDate.utils";
import { normalizeText } from "./text.utils";

export interface KnownVenue {
  name: string;
  address: string;
}

const MIN_EVENT_LINE_LENGTH = 6;
// "Mercredi 5 novembre", "MER 05/11", "Sam. 8", "jeudi 13 nov."
const DAY_HEADER = /^(lun|mar|mer|jeu|ven|sam|dim)[a-z.]*\s+(\d{1,2})(?:er)?(?:\s*[/.]\s*(\d{1,2})|\s+([a-zéûô]+\.?))?\b(.*)$/i;
const MONTH_HEADER = /^(janvier|f[ée]vrier|mars|avril|mai|juin|juillet|ao[uû]t|septembre|octobre|novembre|d[ée]cembre)\b/i;
const TIME = /\b(\d{1,2})\s*h\s*(\d{2})?\b|\b(\d{1,2}):(\d{2})\b/i;
const PRICE = /(prix libre|gratuit|\d+(?:[.,]\d+)?\s*(?:€|euros?))/i;

/** Short form used in agendas: "Leda Atomica Musique (LAM)" is written "Leda Atomica Musique". */
function venueKey(name: string): string {
  return normalizeText(name.replace(/\(.*?\)/g, "").split(",")[0] ?? name);
}

function findVenue(line: string, venues: KnownVenue[]): KnownVenue | undefined {
  const text = normalizeText(line);
  return venues
    .filter((v) => venueKey(v.name).length > 2 && text.includes(venueKey(v.name)))
    .sort((a, b) => venueKey(b.name).length - venueKey(a.name).length)[0];
}

/**
 * Best-effort reader for agendas published as plain text (PDF zines):
 * a day header line, then one event per line until the next header.
 */
export function parseAgendaText(text: string, venues: KnownVenue[] = [], now = new Date()): RawEvent[] {
  const events: RawEvent[] = [];
  let currentMonth: string | null = null;
  let currentDay: number | null = null;
  let dayMonth: string | null = null;

  const pushEvent = (line: string): void => {
    if (currentDay === null || line.length < MIN_EVENT_LINE_LENGTH) return;
    const month = dayMonth ?? currentMonth;
    if (!month) return;
    const timeMatch = TIME.exec(line);
    const start = buildStart(currentDay, month, undefined, timeMatch?.[0], now);
    if (!start) return;
    const venue = findVenue(line, venues);
    events.push({
      title: line.replace(/\s+/g, " ").trim(),
      start,
      venueName: venue?.name,
      address: venue?.address,
      priceText: PRICE.exec(line)?.[0],
      keywords: ["concert"],
    });
  };

  for (const rawLine of text.split(/\n+/)) {
    const line = rawLine.replace(/\s+/g, " ").trim();
    if (!line) continue;
    const monthHeader = MONTH_HEADER.exec(line);
    if (monthHeader && line.length < 30) {
      currentMonth = monthHeader[1]!;
      continue;
    }
    const header = DAY_HEADER.exec(line);
    if (header) {
      currentDay = Number(header[2]);
      const numericMonth = header[3] ? Number(header[3]) : null;
      const namedMonth = header[4] && monthFromName(header[4]) ? header[4] : null;
      dayMonth = namedMonth ?? (numericMonth ? ["", "jan", "fév", "mar", "avr", "mai", "juin", "juil", "aoû", "sep", "oct", "nov", "déc"][numericMonth] ?? null : null);
      // Some zines put the first event on the header line itself
      const rest = header[5]?.replace(/^[\s:–-]+/, "") ?? "";
      if (rest) pushEvent(rest);
      continue;
    }
    pushEvent(line);
  }
  return events;
}
