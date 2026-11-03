import type { RawEvent } from "@shared/event";
import type { Adapter, SourceConfig, HttpClient } from "../types";
import { extractJsonLdEvents, extractLinks } from "./jsonld";
import { parseTribeResponse } from "./wpTribe";

const MAX_AUTO_FOLLOW = 25;
// Link patterns that usually point to an event detail page on venue websites
const EVENT_LINK_SELECTOR = [
  "evenement", "event", "agenda/", "spectacle", "programmation/", "concert", "saison/", "rendez-vous", "sortie",
].map((part) => `a[href*='${part}']`).join(", ");

async function tryWpTribe(source: SourceConfig, http: HttpClient): Promise<RawEvent[]> {
  const origin = new URL(source.url).origin;
  const today = new Date().toISOString().slice(0, 10);
  try {
    const text = await http.getText(`${origin}/wp-json/tribe/events/v1/events?per_page=50&start_date=${today}`);
    return parseTribeResponse(JSON.parse(text)).events;
  } catch {
    return [];
  }
}

/**
 * Best effort for sites whose format we have not inspected yet:
 * 1. WordPress "The Events Calendar" API, 2. JSON-LD on the page, 3. JSON-LD on same-site event pages.
 */
const autoAdapter: Adapter = async (source, http) => {
  const tribe = await tryWpTribe(source, http);
  if (tribe.length > 0) return { events: tribe };

  const html = await http.getText(source.url);
  const events = extractJsonLdEvents(html, source.url);
  if (events.length > 0 && !source.followLinks) return { events };

  const host = new URL(source.url).host;
  const links = extractLinks(html, source.followLinks ?? EVENT_LINK_SELECTOR, source.url, source.maxFollow)
    .filter((link) => new URL(link).host === host && link !== source.url)
    .slice(0, source.maxFollow ?? MAX_AUTO_FOLLOW);
  for (const link of links) {
    try {
      events.push(...extractJsonLdEvents(await http.getText(link), link));
    } catch {
      // A dead detail page should not fail the whole source
    }
  }
  return { events };
};

export default autoAdapter;
