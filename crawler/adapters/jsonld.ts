import * as cheerio from "cheerio";
import type { RawEvent } from "@shared/event";
import type { Adapter } from "../types";

const MAX_FOLLOWED_PAGES = 40;
// Placeholder place names seen on tourism sites; the real name is then in the address
const GENERIC_PLACE_NAMES = /^(adresse|address|lieu|location|place)$/i;

type JsonObject = Record<string, unknown>;

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | undefined {
  if (typeof value === "string") return value.trim() || undefined;
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) return asString(value[0]);
  if (isObject(value)) return asString(value["url"] ?? value["@id"] ?? value["name"]);
  return undefined;
}

function isEventType(node: JsonObject): boolean {
  const type = node["@type"];
  const types = Array.isArray(type) ? type : [type];
  return types.some((t) => typeof t === "string" && t.endsWith("Event"));
}

/** Walks @graph, arrays and nested objects to collect every schema.org *Event node. */
function collectEventNodes(value: unknown, out: JsonObject[]): void {
  if (Array.isArray(value)) {
    for (const item of value) collectEventNodes(item, out);
    return;
  }
  if (!isObject(value)) return;
  if (isEventType(value)) {
    out.push(value);
    // Some sites nest sub-events (festival programmes)
    if (value["subEvent"]) collectEventNodes(value["subEvent"], out);
    return;
  }
  for (const key of ["@graph", "itemListElement", "item", "mainEntity", "event", "events"]) {
    if (value[key]) collectEventNodes(value[key], out);
  }
}

function toRawEvent(node: JsonObject, pageUrl: string): RawEvent | null {
  const title = asString(node["name"]);
  const start = asString(node["startDate"]);
  if (!title || !start) return null;

  const location = Array.isArray(node["location"]) ? node["location"][0] : node["location"];
  const place = isObject(location) ? location : null;
  const address = place && isObject(place["address"]) ? place["address"] : null;
  const offers = Array.isArray(node["offers"]) ? node["offers"][0] : node["offers"];
  const offer = isObject(offers) ? offers : null;
  const price = offer ? asString(offer["price"]) : undefined;

  return {
    title: cheerio.load(title).text(),
    start,
    end: asString(node["endDate"]),
    description: node["description"] ? cheerio.load(String(asString(node["description"]) ?? "")).text() : undefined,
    url: asString(node["url"]) ?? pageUrl,
    venueName: [place ? asString(place["name"]) : asString(location)].find((n) => n && !GENERIC_PLACE_NAMES.test(n)),
    address: address
      ? [asString(address["streetAddress"]), asString(address["postalCode"]), asString(address["addressLocality"])].filter(Boolean).join(", ")
      : typeof place?.["address"] === "string" ? place["address"] : undefined,
    city: address ? asString(address["addressLocality"]) : undefined,
    postalCode: address ? asString(address["postalCode"]) : undefined,
    image: asString(node["image"]),
    priceText: price !== undefined ? `${price} ${asString(offer?.["priceCurrency"]) ?? "€"}`.trim() : undefined,
    isFree: node["isAccessibleForFree"] === true || price === "0" || price === "0.00" ? true : undefined,
  };
}

export function extractJsonLdEvents(html: string, pageUrl: string): RawEvent[] {
  const $ = cheerio.load(html);
  const nodes: JsonObject[] = [];
  $("script[type='application/ld+json']").each((_, element) => {
    try {
      collectEventNodes(JSON.parse($(element).text()), nodes);
    } catch {
      // Malformed JSON-LD is common on small sites: skip that block only
    }
  });
  return nodes.map((node) => toRawEvent(node, pageUrl)).filter((e): e is RawEvent => e !== null);
}

export function extractLinks(html: string, selector: string, baseUrl: string, limit = 0): string[] {
  const $ = cheerio.load(html);
  const links = new Set<string>();
  $(selector).each((_, element) => {
    const href = $(element).attr("href");
    if (!href) return;
    try {
      links.add(new URL(href, baseUrl).toString());
    } catch {
      // Ignore unparsable hrefs
    }
  });
  return [...links].slice(0, Math.max(MAX_FOLLOWED_PAGES, limit ?? 0));
}

/** Reads JSON-LD on the listing page; if a selector is given, also reads each linked event page. */
const jsonLdAdapter: Adapter = async (source, http) => {
  const html = await http.getText(source.url);
  const events = extractJsonLdEvents(html, source.url);
  if (!source.followLinks) return { events };

  for (const link of extractLinks(html, source.followLinks, source.url)) {
    try {
      events.push(...extractJsonLdEvents(await http.getText(link), link));
    } catch (error) {
      console.warn(`[jsonld] ${source.id}: skipped ${link}`, error instanceof Error ? error.message : error);
    }
  }
  return { events };
};

export default jsonLdAdapter;
