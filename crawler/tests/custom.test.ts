import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CUSTOM_PARSERS } from "../adapters/custom";
import { parseVortexVenues } from "../adapters/custom/vortex";
import { parseAgendaText } from "../pipeline/agendaText";
import { normalize } from "../pipeline/normalize";
import type { SourceConfig } from "../types";

// Fixtures are real pages saved by the crawler on 2026-11-03
const fixture = (name: string): string => readFileSync(new URL(`./fixtures/${name}.html`, import.meta.url), "utf8");
const WINDOW = { from: new Date("2026-11-03T00:00:00Z"), to: new Date("2026-12-18T00:00:00Z") };

function run(id: string, requireLocalMatch = false) {
  const raw = CUSTOM_PARSERS[id]!(fixture(id), "https://example.org/");
  const source: SourceConfig = {
    id, name: id, kind: "custom", url: "https://example.org", venueTags: [], enabled: true, requireLocalMatch,
    defaultVenue: requireLocalMatch ? undefined : { name: id, commune: "Marseille" },
  };
  return { raw, kept: raw.map((r) => normalize(r, source, WINDOW)).filter(Boolean) };
}

describe("custom parsers on real pages", () => {
  it("Mille Bâbords agenda block", () => {
    const { raw, kept } = run("mille-babords");
    expect(raw.length).toBeGreaterThan(15);
    expect(raw.find((e) => e.title.includes("Apéro social club"))?.start).toBe("2026-11-11T18:00:00.000Z");
    expect(kept.length).toBeGreaterThan(10);
  });
  it("Molotov cards", () => {
    const { raw } = run("molotov");
    const upsessions = raw.find((e) => e.title === "THE UPSESSIONS");
    expect(upsessions?.start).toBe("2026-11-15T19:00:00.000Z");
    expect(upsessions?.url).toBe("https://lemolotov.com/events/the-upsessions/");
  });
  it("Les Théâtres keeps Marseille venues only", () => {
    const { raw, kept } = run("les-theatres", true);
    expect(raw.length).toBeGreaterThan(10);
    expect(kept.length).toBeGreaterThan(0);
    expect(kept.every((e) => !/grand th/i.test(e!.venueName ?? ""))).toBe(true);
  });
  it("Vidéodrome 2 screenings", () => {
    const { raw } = run("videodrome2");
    expect(raw.length).toBeGreaterThan(3);
    expect(raw[0]?.start).toMatch(/^2026-11/);
  });
});

describe("Vortex", () => {
  const venues = parseVortexVenues(fixture("vortex"));
  it("reads the venue directory", () => {
    const data = venues.find((v) => v.name === "Data");
    expect(data?.address).toContain("13006 Marseille");
    expect(venues.length).toBeGreaterThan(15);
  });
  it("reads a text agenda with day headers", () => {
    const text = "NOVEMBRE\nMercredi 5\nLeda Atomica Musique : Bruits Confus + Noise trio 20h prix libre\nJeudi 6 novembre\nL’Embobineuse – Punk night – 21h – 8€";
    const events = parseAgendaText(text, venues, new Date("2026-11-01T00:00:00Z"));
    expect(events).toHaveLength(2);
    expect(events[0]?.start).toBe("2026-11-05T19:00:00.000Z");
    expect(events[0]?.venueName).toBe("Leda Atomica Musique (LAM)");
    expect(events[1]?.priceText).toBe("8€");
  });
});
