import type { Category } from "@shared/event";
import { includesPattern, normalizeText } from "./text.utils";

// Ordered from most to least specific: "festival de slam" is both, that's fine
const CATEGORY_PATTERNS: [Category, string[]][] = [
  ["slam", ["slam", "poesie", "open mic", "scene ouverte", "spoken word", "lecture poetique"]],
  ["conference", ["conference", "debat", "table ronde", "rencontre avec", "causerie", "seminaire", "colloque", "universite populaire", "presentation du livre", "dedicace"]],
  ["sciences", ["science", "scientifique", "astrophysique", "neuroscience", "pint of science", "chercheur", "chercheuse", "sciences sociales", "biodiversite", "mathematique"]],
  ["nature", ["balade", "randonnee", "sortie nature", "oiseaux", "ornitho", "etoiles", "astronom", "observation du ciel", "chauves souris", "nuit de la chouette", "jardin"]],
  ["makers", ["fablab", "atelier", "repair cafe", "maker", "bricolage", "impression 3d", "electronique"]],
  ["festival", ["festival", "biennale", "fiesta", "rencontres d"]],
  ["concert", ["concert", "live", "dj set", "jazz", "rock", "rap", "punk", "electro", "musique", "chanson", "orchestre", "trio", "quartet"]],
  ["theatre", ["theatre", "piece", "comedie", "mise en scene", "seul en scene"]],
  ["spectacle", ["spectacle", "danse", "cirque", "marionnette", "humour", "stand up", "cabaret", "performance", "clown"]],
  ["expo", ["exposition", "expo ", "vernissage", "galerie"]],
  ["cinema", ["projection", "film", "cinema", "documentaire", "cine club"]],
  ["fete", ["soiree", "bal ", "fete", "guinguette", "boum", "karaoke"]],
];

const MAX_CATEGORIES = 3;

export function classify(title: string, description: string, keywords: string[] = [], fallback: Category[] = []): Category[] {
  const titleText = normalizeText(`${title} ${keywords.join(" ")}`);
  const fullText = `${titleText} ${normalizeText(description)}`;

  // Title matches win; description is only used when the title says nothing
  let found = CATEGORY_PATTERNS.filter(([, patterns]) => patterns.some((p) => includesPattern(titleText, p))).map(([c]) => c);
  if (found.length === 0) {
    found = CATEGORY_PATTERNS.filter(([, patterns]) => patterns.some((p) => includesPattern(fullText, p))).map(([c]) => c);
  }
  if (found.length === 0) found = fallback.length > 0 ? fallback : ["autre"];
  return found.slice(0, MAX_CATEGORIES);
}
