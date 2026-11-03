import type { Category, VenueTag } from "./event";

/**
 * Taste profile of the couple. Each keyword found in title/description adds its weight.
 * Edit freely: this is the main knob for the "coup de cœur" score.
 */
export const TASTE_KEYWORDS: { label: string; weight: number; patterns: string[] }[] = [
  { label: "sociologie", weight: 3, patterns: ["sociolog", "bourdieu", "sciences sociales", "ethnograph", "anthropolog"] },
  { label: "histoire", weight: 2, patterns: ["histoire", "historien", "mémoire", "archives", "colonial"] },
  { label: "politique", weight: 3, patterns: ["politique", "luttes", "lutte", "féminis", "antiracis", "syndica", "écologie politique", "anticapital", "marxis", "commun", "solidarit", "palestin", "migrations", "décolonial", "autogestion", "éducation populaire", "université populaire"] },
  { label: "débat", weight: 2, patterns: ["conférence", "débat", "rencontre", "table ronde", "discussion", "projection-débat", "causerie"] },
  { label: "slam / poésie", weight: 2, patterns: ["slam", "poésie", "poète", "open mic", "scène ouverte", "spoken word"] },
  { label: "makers", weight: 2, patterns: ["fablab", "maker", "atelier", "bricol", "réparation", "repair café", "électronique", "impression 3d", "do it yourself", "diy"] },
  { label: "nature", weight: 2, patterns: ["oiseaux", "ornitho", "étoiles", "astronom", "nuit noire", "balade", "randonnée", "sortie nature", "faune", "flore", "chauves-souris", "calanques", "écoute"] },
  { label: "original", weight: 2, patterns: ["nocturne", "insolite", "secret", "immersi", "sonore", "à l'aube", "lever du soleil", "pleine lune"] },
  { label: "festival", weight: 1, patterns: ["festival"] },
  { label: "prix libre", weight: 1, patterns: ["prix libre", "gratuit", "entrée libre", "participation libre"] },
];

/** Bonus per venue trait, so hidden spots surface first. */
export const VENUE_TAG_WEIGHTS: Record<VenueTag, number> = {
  planque: 3,
  tiers_lieu: 2,
  militant: 2,
  makers: 1,
  nature: 1,
  institution: 0,
};

export const CATEGORY_WEIGHTS: Partial<Record<Category, number>> = {
  conference: 2,
  slam: 2,
  nature: 2,
  makers: 1,
  festival: 1,
};

/** Score at or above which an event is a "coup de cœur". */
export const COUP_DE_COEUR_THRESHOLD = 6;
