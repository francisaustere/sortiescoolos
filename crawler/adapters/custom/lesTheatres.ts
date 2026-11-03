import * as cheerio from "cheerio";
import type { RawEvent } from "@shared/event";

// The network also runs Aix venues; mapping the venue lets the geo filter drop them
const VENUE_CITIES: [RegExp, string][] = [
  [/gymnase/i, "4 rue du Théâtre Français, 13001 Marseille"],
  [/bernardines/i, "17 bd Garibaldi, 13001 Marseille"],
  [/jeu de paume/i, "Aix-en-Provence"],
  [/grand th[ée][âa]tre/i, "Aix-en-Provence"],
];

/** Season grid: li.item--activity with h6.venue, h5.spacetime time[datetime] (start, end), h3.title. */
export function parseLesTheatres(html: string): RawEvent[] {
  const $ = cheerio.load(html);
  const events: RawEvent[] = [];
  $("li.item--activity").each((_, element) => {
    const item = $(element);
    const times = item.find(".spacetime time").map((__, t) => $(t).attr("datetime")).get();
    const title = item.find("h3.title").text().trim();
    if (!title || !times[0]) return;
    const venueName = item.find("h6.venue").text().replace(/\s+/g, " ").trim();
    const subtitle = item.find("h4.subtitle").text().trim();
    events.push({
      title: subtitle ? `${title} – ${subtitle}` : title,
      start: times[0],
      end: times[1],
      url: item.find("a[href*='/a/']").first().attr("href"),
      venueName,
      address: VENUE_CITIES.find(([pattern]) => pattern.test(venueName))?.[1],
      image: item.find("img").attr("src"),
      keywords: [item.find(".label").text().trim()].filter(Boolean),
    });
  });
  return events;
}
