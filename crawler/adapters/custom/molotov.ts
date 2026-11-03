import * as cheerio from "cheerio";
import type { RawEvent } from "@shared/event";
import { buildStart } from "../../utils/frenchDate.utils";

const VENUES: Record<string, string> = {
  "le molotov": "3 place Paul-Cézanne, 13006 Marseille",
  "le dodu": "Belle de Mai, 13003 Marseille",
};

/** Event cards: .eveDate (h2 day, h3 month, h3 year), .evePlus "@ Venue / 20:00", #eveName h1 title. */
export function parseMolotov(html: string): RawEvent[] {
  const $ = cheerio.load(html);
  const events: RawEvent[] = [];
  $("[id='eveCard']").each((_, element) => {
    const card = $(element);
    const [monthText, yearText] = card.find(".eveDate h3").map((__, h) => $(h).text()).get();
    const plus = card.find(".evePlus").text().replace(/\s+/g, " ");
    const [venuePart, timePart] = plus.split("/");
    const start = buildStart(Number(card.find(".eveDate h2").text()), monthText ?? "", yearText, timePart);
    const title = card.find("[id='eveName'] h1").text().trim();
    if (!title || !start) return;
    const venueName = venuePart?.replace("@", "").trim() || "Le Molotov";
    const onclick = card.find("[id='eveImg']").attr("onclick") ?? "";
    const styles = card.find("[id='eveName'] h2 a").map((__, a) => $(a).text().trim()).get();
    events.push({
      title,
      start,
      url: /href='([^']+)'/.exec(onclick)?.[1],
      venueName,
      address: VENUES[venueName.toLowerCase()],
      image: /url\('([^']+)'\)/.exec(card.find("[id='eveImg']").attr("style") ?? "")?.[1],
      keywords: ["concert", ...styles],
    });
  });
  return events;
}
