import { CATEGORY_WEIGHTS, TASTE_KEYWORDS, VENUE_TAG_WEIGHTS } from "@shared/taste";
import type { Category, VenueTag } from "@shared/event";
import { includesPattern, normalizeText } from "./text.utils";

const VENUE_TAG_LABELS: Record<VenueTag, string> = {
  planque: "lieu planqué",
  tiers_lieu: "tiers-lieu",
  militant: "lieu militant",
  makers: "lieu makers",
  nature: "plein air",
  institution: "institution",
};

export interface ScoreInput {
  title: string;
  description: string;
  categories: Category[];
  venueTags: VenueTag[];
  isFree: boolean;
}

/** Transparent additive score: every point comes with a human-readable reason. */
export function score(input: ScoreInput): { score: number; reasons: string[] } {
  const text = normalizeText(`${input.title} ${input.description}`);
  let total = 0;
  const reasons: string[] = [];

  for (const taste of TASTE_KEYWORDS) {
    if (!taste.patterns.some((p) => includesPattern(text, p))) continue;
    total += taste.weight;
    reasons.push(taste.label);
  }
  for (const tag of input.venueTags) {
    const weight = VENUE_TAG_WEIGHTS[tag];
    if (weight <= 0) continue;
    total += weight;
    reasons.push(VENUE_TAG_LABELS[tag]);
  }
  for (const category of input.categories) {
    total += CATEGORY_WEIGHTS[category] ?? 0;
  }
  if (input.isFree && !reasons.includes("prix libre")) {
    total += 1;
    reasons.push("gratuit");
  }
  return { score: total, reasons };
}
