import * as cheerio from "cheerio";
import { extractText, getDocumentProxy } from "unpdf";
import type { AdapterResult, HttpClient } from "../../types";
import { parseAgendaText, type KnownVenue } from "../../pipeline/agendaText";
import { ocrPdf } from "../../utils/ocr.utils";

const MIN_TEXT_LENGTH = 200;

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
  const bytes = await http.getBytes(pdfUrl);
  const links = [{ label: "Agenda du Vortex (PDF du mois)", url: pdfUrl }];

  // The zine is usually a scan: fall back to OCR when the PDF has no text layer
  const { text: embedded } = await extractText(await getDocumentProxy(bytes.slice()), { mergePages: true });
  const isScan = embedded.trim().length < MIN_TEXT_LENGTH;
  const text = isScan ? await ocrPdf(bytes) ?? "" : embedded;
  const events = parseAgendaText(text, parseVortexVenues(html))
    .map((event) => ({ ...event, url: pdfUrl, approximate: isScan }));
  return { events, links, snapshotText: text };
}
