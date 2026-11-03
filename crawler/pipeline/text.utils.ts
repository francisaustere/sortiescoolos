/** Lowercase, strip accents and punctuation: used for matching and dedup keys. */
export function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function includesPattern(haystack: string, pattern: string): boolean {
  return haystack.includes(normalizeText(pattern));
}

const DESCRIPTION_MAX_LENGTH = 400;

export function shortenDescription(value: string | undefined): string {
  if (!value) return "";
  const clean = value.replace(/\s+/g, " ").trim();
  return clean.length > DESCRIPTION_MAX_LENGTH ? `${clean.slice(0, DESCRIPTION_MAX_LENGTH - 1)}…` : clean;
}
