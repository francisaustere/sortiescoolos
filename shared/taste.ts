import type { Category, VenueTag } from "./event";

/**
 * Taste profile of the couple. Each keyword found in title/description adds its weight.
 * Edit freely: this is the main knob for the "coup de cœur" score.
 */
export const TASTE_KEYWORDS: { label: string; weight: number; patterns: string[] }[] = [
  { label: "sociologie", weight: 3, patterns: ["sociolog", "bourdieu", "sciences sociales", "sciences humaines", "ehess", "ethnograph", "anthropolog", "allez savoir"] },
  { label: "sciences", weight: 2, patterns: ["science", "scientifique", "chercheur", "chercheuse", "astrophysi", "neuroscien", "biodiversit", "physique", "biologie", "climat", "écologie scientifique", "pint of science", "fête de la science", "mathémati", "cerveau", "génétique"] },
  { label: "histoire", weight: 2, patterns: ["histoire", "historien", "mémoire", "archives", "colonial"] },
  { label: "politique", weight: 3, patterns: ["politique", "luttes", "lutte", "féminis", "antiracis", "syndica", "écologie politique", "anticapital", "marxis", "commun", "solidarit", "palestin", "migrations", "décolonial", "autogestion", "éducation populaire", "université populaire", "gaza", "antisémit", "racisme", "fascis", "manif", "rassemblement", "logement", "rue d'aubagne", "sans-papiers", "grève", "violences policières", "capitalisme", "technocritique", "data center", "extrême droite", "queer", "lgbt"] },
  { label: "débat", weight: 2, patterns: ["conférence", "débat", "rencontre", "table ronde", "discussion", "projection-débat", "causerie", "présentation du livre", "présentation de", "lancement du livre", "réunion publique", "assemblée ouverte", "avant-première", "documentaire"] },
  { label: "slam / poésie", weight: 3, patterns: ["slam", "poésie", "poète", "open mic", "scène ouverte", "spoken word"] },
  { label: "makers", weight: 2, patterns: ["fablab", "maker", "atelier", "bricol", "do it yourself", "diy", "impression 3d", "découpe laser"] },
  { label: "électronique", weight: 3, patterns: ["électronique", "arduino", "raspberry", "esp32", "microcontrôleur", "soudure", "capteur", "robotique", "circuit imprimé"] },
  { label: "IA / code", weight: 3, patterns: ["intelligence artificielle", "vibe coding", "vibecoding", "llm", "machine learning", "apprentissage automatique", "ia générative", "programmation", "coding", "open source", "logiciel libre", "linux", "install party", "devfest", "meetup ia", "meetups de l'ia"] },
  { label: "réparation", weight: 3, patterns: ["repair café", "repair cafe", "réparation", "réparer", "upcycling", "atelier vélo", "recyclerie", "low-tech", "low tech"] },
  { label: "plantes", weight: 3, patterns: ["plantes", "botanique", "herbier", "herboriste", "cueillette", "plantes sauvages", "jardin partagé", "permaculture", "grainothèque", "troc de graines", "troc de plantes", "bouturage", "arbres", "potager", "champignons", "mycolog"] },
  { label: "nature", weight: 2, patterns: ["oiseaux", "ornitho", "étoiles", "astronom", "nuit noire", "balade", "randonnée", "sortie nature", "faune", "flore", "chauves-souris", "calanques", "écoute"] },
  { label: "original", weight: 2, patterns: ["nocturne", "insolite", "secret", "immersi", "sonore", "à l'aube", "lever du soleil", "pleine lune"] },
  { label: "jeux", weight: 2, patterns: ["jeu de société", "jeux de société", "soirée jeux", "ludique", "ludothèque", "jeu de go", "murder party", "jeu de rôle"] },
  { label: "jeu vidéo indé / geek", weight: 3, patterns: ["game jam", "jeu vidéo indé", "jeux vidéo indé", "jeu indépendant", "jeux indépendants", "indie game", "itch.io", "contrôleur alternatif", "alt ctrl", "alt.ctrl", "arcade", "pixel art", "chiptune", "demoscene", "démoscène", "rétrogaming", "art numérique", "arts numériques", "creative coding", "hackathon", "hackerspace", "synthé modulaire", "circuit bending", "jeu expérimental", "jeux expérimentaux"] },
  { label: "court métrage", weight: 2, patterns: ["court métrage", "courts métrages", "court-métrage", "courts-métrages", "fête du court"] },
  { label: "festival", weight: 1, patterns: ["festival"] },
  { label: "prix libre", weight: 1, patterns: ["prix libre", "gratuit", "entrée libre", "participation libre"] },
];

/** Bonus per venue trait, so hidden spots surface first. */
export const VENUE_TAG_WEIGHTS: Record<VenueTag, number> = {
  // Kept modest so the topic, not the venue, decides the "coup de cœur"
  planque: 2,
  tiers_lieu: 1,
  militant: 1,
  makers: 1,
  nature: 1,
  institution: 0,
};

export const CATEGORY_WEIGHTS: Partial<Record<Category, number>> = {
  conference: 2,
  sciences: 2,
  slam: 2,
  nature: 2,
  makers: 1,
  festival: 1,
};

/** Score at or above which an event is a "coup de cœur". */
export const COUP_DE_COEUR_THRESHOLD = 6;
