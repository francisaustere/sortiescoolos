/** Communes kept in the dashboard: Marseille and the towns directly bordering it (not Aubagne, Aix, Cassis). */
export const COMMUNES: { name: string; postalCodes: string[]; aliases: string[] }[] = [
  {
    name: "Marseille",
    postalCodes: Array.from({ length: 16 }, (_, i) => `130${String(i + 1).padStart(2, "0")}`),
    aliases: ["marseille", "l'estaque", "estaque", "la joliette", "belle de mai", "noailles", "cours julien", "la plaine", "les goudes", "callelongue", "pointe rouge"],
  },
  { name: "Allauch", postalCodes: ["13190"], aliases: ["allauch"] },
  { name: "Plan-de-Cuques", postalCodes: ["13380"], aliases: ["plan-de-cuques", "plan de cuques"] },
  { name: "Septèmes-les-Vallons", postalCodes: ["13240"], aliases: ["septèmes", "septemes"] },
  { name: "Les Pennes-Mirabeau", postalCodes: ["13170"], aliases: ["pennes-mirabeau", "pennes mirabeau"] },
];

/** Towns explicitly out of scope; a match here drops the event even from a local source. */
export const EXCLUDED_TOWNS = [
  "aubagne", "aix-en-provence", "aix en provence", "cassis", "la ciotat", "martigues", "vitrolles",
  "gardanne", "arles", "avignon", "toulon", "marignane", "istres", "salon-de-provence", "la penne-sur-huveaune",
];
