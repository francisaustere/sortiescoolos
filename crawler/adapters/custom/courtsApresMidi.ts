import * as cheerio from "cheerio";
import type { RawEvent } from "@shared/event";
import { buildStart } from "../../utils/frenchDate.utils";

const NEXT_SESSION = /prochaine s[ée]ance\s*:\s*\S+\s+(\d{1,2})(?:er)?\s+([a-zéû]+)\s+(\d{4})(?:\s+à\s+(\d{1,2}\s*h\s*\d{0,2}))?/i;

/** Jimdo site announcing only the next monthly session in a heading. */
export function parseCourtsApresMidi(html: string, baseUrl: string): RawEvent[] {
  const $ = cheerio.load(html);
  const heading = $("h1, h2").filter((_, h) => NEXT_SESSION.test($(h).text())).first();
  const match = NEXT_SESSION.exec(heading.text());
  if (!match) return [];
  const start = buildStart(Number(match[1]), match[2]!, match[3], match[4]);
  if (!start) return [];
  // Guest and context lines follow the heading until the next separator
  const details = heading.closest(".j-module").nextAll(".j-header").slice(0, 3).map((_, h) => $(h).text().trim()).get();
  return [{
    title: "Des courts l'après-midi – séance de courts métrages",
    start,
    description: ["Séance gratuite de courts métrages au cinéma le Miroir.", ...details].join(" "),
    url: baseUrl,
    venueName: "Cinéma le Miroir, Vieille Charité",
    address: "2 rue de la Charité, 13002 Marseille",
    isFree: true,
    keywords: ["court métrage", "cinéma"],
  }];
}
