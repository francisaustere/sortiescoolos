import * as cheerio from "cheerio";
import type { RawEvent } from "@shared/event";
import { buildStart } from "../../utils/frenchDate.utils";

/** SPIP "Escal" agenda block: .evenement-date (day, month, time) followed by .evenement-donnees (title, place). */
export function parseMilleBabords(html: string, baseUrl: string): RawEvent[] {
  const $ = cheerio.load(html);
  const events: RawEvent[] = [];
  $(".evenement-date").each((_, element) => {
    const date = $(element);
    const data = date.nextAll(".evenement-donnees").first();
    const link = data.find(".donnee-titre a").first();
    const title = link.text().trim();
    const start = buildStart(Number(date.find(".evenement-jour").text()), date.find(".evenement-mois").text(), undefined, date.find(".donnee-heure").text());
    if (!title || !start) return;
    const place = data.find(".donnee-lieu").text().replace(/\s+/g, " ").trim();
    events.push({
      title,
      start,
      url: link.attr("href") ? new URL(link.attr("href")!, baseUrl).toString() : undefined,
      venueName: place.split(/[,-]/)[0]?.trim() || undefined,
      address: place || undefined,
    });
  });
  return events;
}
