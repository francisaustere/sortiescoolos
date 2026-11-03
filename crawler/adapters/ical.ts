import type { RawEvent } from "@shared/event";
import type { Adapter } from "../types";
import { parisLocalToIso } from "../utils/date.utils";

interface IcsProperty {
  params: Record<string, string>;
  value: string;
}

/** Joins folded lines (RFC 5545: continuation lines start with a space or tab). */
function unfold(text: string): string[] {
  return text.replace(/\r\n/g, "\n").replace(/\n[ \t]/g, "").split("\n");
}

function unescapeText(value: string): string {
  return value.replace(/\\n/gi, "\n").replace(/\\([,;\\])/g, "$1").trim();
}

function parseLine(line: string): [string, IcsProperty] | null {
  const colon = line.indexOf(":");
  if (colon < 0) return null;
  const [name = "", ...rawParams] = line.slice(0, colon).split(";");
  const params: Record<string, string> = {};
  for (const param of rawParams) {
    const [key, val] = param.split("=");
    if (key && val) params[key.toUpperCase()] = val.replace(/"/g, "");
  }
  return [name.toUpperCase(), { params, value: line.slice(colon + 1) }];
}

/** Returns an ISO string; date-only values stay "YYYY-MM-DD" so they read as all-day. */
function parseIcsDate(prop: IcsProperty): string | null {
  const match = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?$/.exec(prop.value.trim());
  if (!match) return null;
  const [, y, mo, d, h, mi, , utc] = match;
  if (h === undefined) return `${y}-${mo}-${d}`;
  if (utc) return new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi))).toISOString();
  // Floating times and TZID times are treated as Paris local time (all our sources are local)
  return parisLocalToIso(Number(y), Number(mo), Number(d), Number(h), Number(mi));
}

export function parseIcs(text: string): RawEvent[] {
  const events: RawEvent[] = [];
  let current: Map<string, IcsProperty> | null = null;

  for (const line of unfold(text)) {
    if (line === "BEGIN:VEVENT") {
      current = new Map();
      continue;
    }
    if (line === "END:VEVENT") {
      const event = current ? toRawEvent(current) : null;
      if (event) events.push(event);
      current = null;
      continue;
    }
    if (!current) continue;
    const parsed = parseLine(line);
    if (parsed && !current.has(parsed[0])) current.set(parsed[0], parsed[1]);
  }
  return events;
}

function toRawEvent(props: Map<string, IcsProperty>): RawEvent | null {
  const summary = props.get("SUMMARY");
  const dtStart = props.get("DTSTART");
  if (!summary || !dtStart) return null;
  const start = parseIcsDate(dtStart);
  if (!start) return null;
  const dtEnd = props.get("DTEND");
  const location = props.get("LOCATION");
  const categories = props.get("CATEGORIES");
  return {
    title: unescapeText(summary.value),
    start,
    end: dtEnd ? parseIcsDate(dtEnd) ?? undefined : undefined,
    description: props.get("DESCRIPTION") ? unescapeText(props.get("DESCRIPTION")!.value) : undefined,
    url: props.get("URL")?.value.trim(),
    address: location ? unescapeText(location.value) : undefined,
    keywords: categories ? unescapeText(categories.value).split(",").map((k) => k.trim()) : undefined,
  };
}

const icalAdapter: Adapter = async (source, http) => ({ events: parseIcs(await http.getText(source.url)) });

export default icalAdapter;
