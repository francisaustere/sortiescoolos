import { COMMUNES, EXCLUDED_TOWNS } from "@shared/geo";
import type { RawEvent } from "@shared/event";
import { includesPattern, normalizeText } from "./text.utils";

/**
 * Returns the commune of an event, "excluded" when it is clearly outside our area,
 * or null when nothing can be inferred.
 */
export function resolveCommune(event: RawEvent): string | "excluded" | null {
  const haystack = normalizeText([event.postalCode, event.city, event.address, event.venueName].filter(Boolean).join(" "));
  if (!haystack) return null;

  const postal = /\b(13\d{3})\b/.exec(haystack)?.[1];
  if (postal) {
    const commune = COMMUNES.find((c) => c.postalCodes.includes(postal));
    return commune ? commune.name : "excluded";
  }
  if (EXCLUDED_TOWNS.some((town) => includesPattern(haystack, town))) return "excluded";
  const byAlias = COMMUNES.find((c) => c.aliases.some((alias) => includesPattern(haystack, alias)));
  return byAlias ? byAlias.name : null;
}
