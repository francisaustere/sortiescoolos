import * as cheerio from "cheerio";
import { extractText, getDocumentProxy } from "unpdf";
import type { AdapterResult, HttpClient } from "../../types";
import { parseAgendaText, type KnownVenue } from "../../pipeline/agendaText";

/** Venue list on the homepage: "<a>Name</a> — address — 13006". */
export function parseVortexVenues(html: string): KnownVenue[] {
  const $ = cheerio.load(html);
  const venues: KnownVenue[] = [];
  $("li").each((_, element) => {
    const item = $(element);
    const name = item.find("a").first().text().trim();
    const rest = item.text().replace(name, "").replace(/[—–-]/g, ",").replace(/\s+/g, " ").trim();
    const postal = /\b(13\d{3})\b/.exec(rest)?.[1];
    if (!name || !postal) return;
    venues.push({ name, address: `${rest.replace(/^,\s*/, "").replace(/,?\s*13\d{3}.*$/, "")}, ${postal} Marseille` });
  });
  return venues;
}

/** Le Vortex publishes its monthly agenda as a PDF linked from the homepage. */
export async function readVortex(html: string, baseUrl: string, http: HttpClient): Promise<AdapterResult> {
  const $ = cheerio.load(html);
  const pdfHref = $("a[href$='.pdf']").map((_, a) => $(a).attr("href")).get().find((href) => /vortex/i.test(href));
  if (!pdfHref) throw new Error("Lien du PDF Vortex introuvable");
  const pdfUrl = new URL(pdfHref, baseUrl).toString();
  const pdf = await getDocumentProxy(await http.getBytes(pdfUrl));
  const { text } = await extractText(pdf, { mergePages: true });
  const events = parseAgendaText(text, parseVortexVenues(html)).map((event) => ({ ...event, url: pdfUrl }));
  return { events, snapshotText: text };
}
