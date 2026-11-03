import * as cheerio from "cheerio";
import type { RawEvent } from "@shared/event";
import { parisLocalToIso } from "../../utils/date.utils";
import { parseTime } from "../../utils/frenchDate.utils";

/** Agenda list: .event.thumb[data-date] with h3 title, h4 subtitle, excerpt, tags, "09h-13h", price/CTA. */
export function parseFriche(html: string): RawEvent[] {
  const $ = cheerio.load(html);
  const events: RawEvent[] = [];
  $(".event.thumb[data-date]").each((_, element) => {
    const card = $(element);
    const date = card.attr("data-date") ?? "";
    const link = card.find("h3.title a").first();
    const title = link.text().replace(/\s+/g, " ").trim();
    const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
    if (!title || !dateMatch) return;
    const hours = card.find(".thumb-left").text().replace(/\s+/g, " ").trim();
    const time = parseTime(hours);
    const [, y, m, d] = dateMatch;
    const subtitle = card.find("h4.subtitle").text().trim();
    events.push({
      title: subtitle ? `${title} – ${subtitle}` : title,
      start: time ? parisLocalToIso(Number(y), Number(m), Number(d), time.hour, time.minute) : date,
      description: card.find(".excerpt").text().replace(/\s+/g, " ").trim(),
      url: link.attr("href"),
      image: card.find("img").attr("src"),
      priceText: card.find(".thumb-cta .icon-text").text().replace(/\s+/g, " ").trim() || undefined,
      keywords: card.find(".tags .tag").map((__, tag) => $(tag).text().trim()).get(),
    });
  });
  return mergeRepeats(events);
}

/** Exhibitions are listed once per opening day: keep the first day and extend `end` to the last one. */
function mergeRepeats(events: RawEvent[]): RawEvent[] {
  const byKey = new Map<string, RawEvent>();
  for (const event of events) {
    const key = event.url ?? event.title;
    const first = byKey.get(key);
    if (!first) {
      byKey.set(key, { ...event });
      continue;
    }
    first.end = event.start.slice(0, 10);
  }
  return [...byKey.values()];
}
